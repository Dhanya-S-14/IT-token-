const ChangeRequest = require('../models/ChangeRequest');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { paginate, buildSort } = require('../utils/helpers');

exports.createChangeRequest = async (req, res, next) => {
  try {
    req.body.requestedBy = req.user._id;
    const change = await ChangeRequest.create(req.body);

    await ActivityLog.create({
      actor: req.user._id,
      action: 'created',
      resourceType: 'change',
      resourceId: change._id,
      description: `Change request ${change.changeId} created: ${change.title}`,
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Change request created', data: change });
  } catch (error) {
    next(error);
  }
};

exports.getChangeRequests = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { changeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const sort = buildSort(req.query.sortBy);

    const [changes, total] = await Promise.all([
      ChangeRequest.find(filter)
        .populate('requestedBy', 'name email')
        .populate('approvedBy', 'name email')
        .populate('assignedTo', 'name email')
        .populate('department', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ChangeRequest.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: changes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: skip + changes.length < total }
    });
  } catch (error) {
    next(error);
  }
};

exports.getChangeRequest = async (req, res, next) => {
  try {
    const change = await ChangeRequest.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('department', 'name');

    if (!change) {
      return next(new AppError('Change request not found', 404));
    }

    res.json({ success: true, data: change });
  } catch (error) {
    next(error);
  }
};

exports.updateChangeRequest = async (req, res, next) => {
  try {
    const change = await ChangeRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('requestedBy approvedBy assignedTo department');

    if (!change) {
      return next(new AppError('Change request not found', 404));
    }

    res.json({ success: true, data: change });
  } catch (error) {
    next(error);
  }
};

exports.approveChangeRequest = async (req, res, next) => {
  try {
    const change = await ChangeRequest.findById(req.params.id);
    if (!change) {
      return next(new AppError('Change request not found', 404));
    }

    change.status = 'approved';
    change.approvedBy = req.user._id;
    change.approvalHistory.push({
      approver: req.user._id,
      action: 'approved',
      comment: req.body.comment || '',
      date: new Date()
    });
    await change.save();

    await Notification.create({
      recipient: change.requestedBy,
      type: 'change_approved',
      title: 'Change Request Approved',
      message: `Change request ${change.changeId} has been approved`,
      data: { referenceId: change._id, referenceType: 'change', referenceUrl: `/changes/${change._id}` }
    });

    res.json({ success: true, data: change });
  } catch (error) {
    next(error);
  }
};

exports.rejectChangeRequest = async (req, res, next) => {
  try {
    const change = await ChangeRequest.findById(req.params.id);
    if (!change) {
      return next(new AppError('Change request not found', 404));
    }

    change.status = 'rejected';
    change.approvalHistory.push({
      approver: req.user._id,
      action: 'rejected',
      comment: req.body.comment || '',
      date: new Date()
    });
    await change.save();

    await Notification.create({
      recipient: change.requestedBy,
      type: 'change_rejected',
      title: 'Change Request Rejected',
      message: `Change request ${change.changeId} has been rejected`,
      data: { referenceId: change._id, referenceType: 'change', referenceUrl: `/changes/${change._id}` }
    });

    res.json({ success: true, data: change });
  } catch (error) {
    next(error);
  }
};
