const Incident = require('../models/Incident');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { paginate, buildSort } = require('../utils/helpers');
const { createSLARecord } = require('../services/slaService');
const { emitToUser, emitToRole } = require('../services/socketService');

exports.createIncident = async (req, res, next) => {
  try {
    req.body.reportedBy = req.user._id;
    const incident = await Incident.create(req.body);

    await createSLARecord(incident);

    const populated = await Incident.findById(incident._id)
      .populate('reportedBy', 'name email')
      .populate('department', 'name');

    await ActivityLog.create({
      actor: req.user._id,
      action: 'created',
      resourceType: 'incident',
      resourceId: incident._id,
      description: `Incident ${incident.incidentId} created: ${incident.title}`,
      ip: req.ip
    });

    const io = req.app.get('io');
    emitToRole(io, 'admin', 'incident:created', populated);
    emitToRole(io, 'manager', 'incident:created', populated);

    res.status(201).json({ success: true, message: 'Incident created', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getIncidents = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { incidentId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.user.role === 'employee') {
      filter.reportedBy = req.user._id;
    }

    const sort = buildSort(req.query.sortBy);

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .populate('reportedBy', 'name email profilePicture')
        .populate('assignedTo', 'name email profilePicture')
        .populate('department', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Incident.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: incidents,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasMore: skip + incidents.length < total
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name email profilePicture')
      .populate('assignedTo', 'name email profilePicture')
      .populate('department', 'name');

    if (!incident) {
      return next(new AppError('Incident not found', 404));
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

exports.updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('reportedBy assignedTo department');

    if (!incident) {
      return next(new AppError('Incident not found', 404));
    }

    await ActivityLog.create({
      actor: req.user._id,
      action: 'updated',
      resourceType: 'incident',
      resourceId: incident._id,
      description: `Incident ${incident.incidentId} updated`,
      metadata: { changes: Object.keys(req.body) },
      ip: req.ip
    });

    const io = req.app.get('io');
    emitToIncident(io, incident._id, 'incident:updated', incident);

    if (incident.assignedTo) {
      emitToUser(io, incident.assignedTo._id, 'incident:updated', incident);
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

exports.deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return next(new AppError('Incident not found', 404));
    }

    await ActivityLog.create({
      actor: req.user._id,
      action: 'deleted',
      resourceType: 'incident',
      resourceId: incident._id,
      description: `Incident ${incident.incidentId} deleted: ${incident.title}`,
      ip: req.ip
    });

    res.json({ success: true, message: 'Incident deleted' });
  } catch (error) {
    next(error);
  }
};

exports.assignIncident = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'in_progress' },
      { new: true }
    ).populate('reportedBy assignedTo department');

    if (!incident) {
      return next(new AppError('Incident not found', 404));
    }

    await Notification.create({
      recipient: assignedTo,
      type: 'incident_assigned',
      title: 'New Incident Assigned',
      message: `Incident ${incident.incidentId}: ${incident.title} has been assigned to you`,
      data: { referenceId: incident._id, referenceType: 'incident', referenceUrl: `/incidents/${incident._id}` }
    });

    await ActivityLog.create({
      actor: req.user._id,
      action: 'assigned',
      resourceType: 'incident',
      resourceId: incident._id,
      description: `Incident ${incident.incidentId} assigned to ${incident.assignedTo?.name || 'Unknown'}`,
      ip: req.ip
    });

    const io = req.app.get('io');
    emitToUser(io, assignedTo, 'incident:assigned', incident);

    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

exports.closeIncident = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolution, resolvedAt: new Date() },
      { new: true }
    ).populate('reportedBy assignedTo department');

    if (!incident) {
      return next(new AppError('Incident not found', 404));
    }

    await ActivityLog.create({
      actor: req.user._id,
      action: 'resolved',
      resourceType: 'incident',
      resourceId: incident._id,
      description: `Incident ${incident.incidentId} resolved`,
      ip: req.ip
    });

    const io = req.app.get('io');
    emitToUser(io, incident.reportedBy._id, 'incident:resolved', incident);

    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};
