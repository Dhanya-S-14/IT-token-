const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');

const emit = (req) => req.app.get('io');

const generateToken = async () => {
  const year = new Date().getFullYear();
  // Use a high base so the sequence never collides with previously created
  // tokens even after deletions. Retry on any attempt conflicts with the
  // unique "token" index.
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await Complaint.countDocuments();
    const seq = String(count + 1000 + 1).padStart(6, '0');
    const token = `IT-${year}-${seq}`;
    const exists = await Complaint.exists({ token });
    if (!exists) return token;
  }
  // Last resort: a timestamp-based token guarantees uniqueness.
  const ts = Date.now().toString().slice(-6);
  return `IT-${year}-${ts}`;
};

exports.createComplaint = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.userId);
    if (!employee) return next(new AppError('Employee not found', 404));

    const { title, category, priority, description } = req.body;
    const token = await generateToken();
    const screenshot = req.file ? `/uploads/${req.file.filename}` : '';

    const complaint = await Complaint.create({
      token, title, category, priority, description, screenshot,
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      department: employee.department,
      timeline: [{ status: 'Pending', timestamp: new Date(), updatedBy: employee.name, notes: 'Complaint submitted' }]
    });

    const admins = await Admin.find();
    const io = emit(req);
    for (const admin of admins) {
      const notif = await Notification.create({
        recipient: admin._id, recipientModel: 'Admin',
        type: 'system', title: 'New Complaint', message: `New complaint ${token} raised by ${employee.name}`,
        complaint: complaint._id, token, link: `/admin/complaints/${complaint._id}`
      });
      io.to(`user:${admin._id}`).emit('notification', notif);
    }

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

exports.getMyComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = { employee: req.userId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { token: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: complaints, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return next(new AppError('Complaint not found', 404));
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintByToken = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ token: req.params.token });
    if (!complaint) return next(new AppError('Complaint not found', 404));
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

exports.getAllComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, department, search, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { token: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: complaints, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.assignComplaint = async (req, res, next) => {
  try {
    const { assignedEngineer, estimatedResolutionDate, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return next(new AppError('Complaint not found', 404));

    complaint.assignedEngineer = assignedEngineer;
    complaint.estimatedResolutionDate = estimatedResolutionDate;
    complaint.adminRemarks = remarks || complaint.adminRemarks;
    complaint.status = 'Assigned';
    complaint.timeline.push({
      status: 'Assigned', timestamp: new Date(),
      updatedBy: req.admin.name,
      notes: `Assigned to ${assignedEngineer}${remarks ? ': ' + remarks : ''}`
    });
    await complaint.save();

    const assignNotif = await Notification.create({
      recipient: complaint.employee, recipientModel: 'Employee',
      type: 'complaint_assigned', title: 'Complaint Assigned',
      message: `Your complaint ${complaint.token} has been assigned to ${assignedEngineer}`,
      complaint: complaint._id, token: complaint.token, link: `/employee/complaints/${complaint._id}`
    });
    emit(req).to(`user:${complaint.employee}`).emit('notification', assignNotif);

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'assigned', resource: 'complaint', resourceId: complaint.token,
      details: `Assigned complaint ${complaint.token} to ${assignedEngineer}`
    });

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, engineerNotes, resolutionDescription, adminRemarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return next(new AppError('Complaint not found', 404));

    complaint.status = status;
    if (engineerNotes) complaint.engineerNotes = engineerNotes;
    if (resolutionDescription) complaint.resolutionDescription = resolutionDescription;
    if (adminRemarks) complaint.adminRemarks = adminRemarks;
    if (req.file) complaint.resolutionScreenshot = `/uploads/${req.file.filename}`;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    complaint.timeline.push({
      status, timestamp: new Date(),
      updatedBy: req.admin.name,
      notes: engineerNotes || adminRemarks || `Status changed to ${status}`
    });
    await complaint.save();

    const notificationType = status === 'Resolved' ? 'complaint_resolved' :
      status === 'Rejected' ? 'complaint_rejected' :
      status === 'Closed' ? 'complaint_closed' : 'complaint_updated';

    const statusNotif = await Notification.create({
      recipient: complaint.employee, recipientModel: 'Employee',
      type: notificationType, title: `Complaint ${status}`,
      message: `Your complaint ${complaint.token} has been marked as ${status}`,
      complaint: complaint._id, token: complaint.token, link: `/employee/complaints/${complaint._id}`
    });
    emit(req).to(`user:${complaint.employee}`).emit('notification', statusNotif);

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'updated', resource: 'complaint', resourceId: complaint.token,
      details: `Updated complaint ${complaint.token} to ${status}`
    });

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!complaint) return next(new AppError('Complaint not found', 404));

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'deleted', resource: 'complaint', resourceId: complaint.token,
      details: `Deleted complaint ${complaint.token}`
    });

    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments({ isActive: true });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const assigned = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });
    const closed = await Complaint.countDocuments({ status: 'Closed' });
    const highPriority = await Complaint.countDocuments({ priority: 'High', isActive: true });

    res.json({
      success: true,
      data: { total, pending, assigned, inProgress, resolved, rejected, closed, highPriority }
    });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeeComplaintStats = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments({ employee: req.userId });
    const pending = await Complaint.countDocuments({ employee: req.userId, status: 'Pending' });
    const resolved = await Complaint.countDocuments({ employee: req.userId, status: { $in: ['Resolved', 'Closed'] } });

    res.json({ success: true, data: { total, pending, resolved } });
  } catch (err) {
    next(err);
  }
};
