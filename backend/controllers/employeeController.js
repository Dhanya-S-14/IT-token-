const Employee = require('../models/Employee');
const Complaint = require('../models/Complaint');
const Deployment = require('../models/Deployment');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');

exports.getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, department } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (department) query.department = department;

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: employees, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return next(new AppError('Employee not found', 404));

    const complaints = await Complaint.find({ employee: employee._id }).sort({ createdAt: -1 });
    const deployments = await Deployment.find({ employee: employee._id }).sort({ createdAt: -1 });
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const pendingComplaints = complaints.filter(c => c.status === 'Pending' || c.status === 'Assigned' || c.status === 'In Progress').length;

    res.json({
      success: true, data: {
        ...employee.toObject(),
        complaints,
        deployments,
        stats: { totalComplaints, resolvedComplaints, pendingComplaints }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, phone, department, designation, deploymentLocation, joiningDate } = req.body;
    const exists = await Employee.findOne({ $or: [{ employeeId }, { email }] });
    if (exists) return next(new AppError('Employee ID or email already exists', 400));

    const employee = await Employee.create({
      employeeId, name, email, password, phone, department, designation, deploymentLocation, joiningDate
    });

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'created', resource: 'employee', resourceId: employee.employeeId,
      details: `Created employee ${name} (${employeeId})`
    });

    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'department', 'designation', 'deploymentLocation', 'joiningDate', 'status', 'profilePicture'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!employee) return next(new AppError('Employee not found', 404));

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'updated', resource: 'employee', resourceId: employee.employeeId,
      details: `Updated employee ${employee.name}`
    });

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { isActive: false, status: 'inactive' }, { new: true });
    if (!employee) return next(new AppError('Employee not found', 404));

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'deleted', resource: 'employee', resourceId: employee.employeeId,
      details: `Deactivated employee ${employee.name} (${employee.employeeId})`
    });

    res.json({ success: true, message: 'Employee deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) return next(new AppError('Employee not found', 404));
    employee.password = password;
    await employee.save();

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'updated', resource: 'employee', resourceId: employee.employeeId,
      details: `Reset password for employee ${employee.name}`
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeeProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.userId);
    if (!employee) return next(new AppError('Employee not found', 404));
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

exports.updateEmployeeProfile = async (req, res, next) => {
  try {
    const allowedFields = ['phone', 'email', 'profilePicture'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    const employee = await Employee.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    if (!employee) return next(new AppError('Employee not found', 404));
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

exports.changeEmployeePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const employee = await Employee.findById(req.userId).select('+password');
    if (!employee || !(await employee.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    employee.password = newPassword;
    await employee.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
