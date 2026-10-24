const Deployment = require('../models/Deployment');
const ActivityLog = require('../models/ActivityLog');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');

exports.getDeployments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, department } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { deploymentId: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (department) query.department = department;

    const total = await Deployment.countDocuments(query);
    const deployments = await Deployment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: deployments, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getDeployment = async (req, res, next) => {
  try {
    const deployment = await Deployment.findById(req.params.id);
    if (!deployment) return next(new AppError('Deployment not found', 404));
    res.json({ success: true, data: deployment });
  } catch (err) {
    next(err);
  }
};

exports.createDeployment = async (req, res, next) => {
  try {
    const { employeeId, projectName, clientName, location, department, team, manager, shiftTiming, workMode, status, startDate, endDate, notes } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return next(new AppError('Employee not found', 404));

    const depCount = await Deployment.countDocuments();
    const deploymentId = `DEP-${String(depCount + 1).padStart(4, '0')}`;

    const deployment = await Deployment.create({
      deploymentId, employee: employee._id, employeeId: employee.employeeId,
      employeeName: employee.name, projectName, clientName, location, department,
      team, manager, shiftTiming, workMode, status: status || 'Active', startDate, endDate, notes
    });

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'created', resource: 'deployment', resourceId: deploymentId,
      details: `Created deployment for ${employee.name} on project ${projectName}`
    });

    res.status(201).json({ success: true, data: deployment });
  } catch (err) {
    next(err);
  }
};

exports.updateDeployment = async (req, res, next) => {
  try {
    const allowedFields = ['projectName', 'clientName', 'location', 'department', 'team', 'manager', 'shiftTiming', 'workMode', 'status', 'startDate', 'endDate', 'notes'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const deployment = await Deployment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!deployment) return next(new AppError('Deployment not found', 404));

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'updated', resource: 'deployment', resourceId: deployment.deploymentId,
      details: `Updated deployment ${deployment.deploymentId}`
    });

    res.json({ success: true, data: deployment });
  } catch (err) {
    next(err);
  }
};

exports.deleteDeployment = async (req, res, next) => {
  try {
    const deployment = await Deployment.findByIdAndDelete(req.params.id);
    if (!deployment) return next(new AppError('Deployment not found', 404));

    await ActivityLog.create({
      admin: req.admin._id, adminId: req.admin.adminId, adminName: req.admin.name,
      action: 'deleted', resource: 'deployment', resourceId: deployment.deploymentId,
      details: `Deleted deployment ${deployment.deploymentId}`
    });

    res.json({ success: true, message: 'Deployment deleted successfully' });
  } catch (err) {
    next(err);
  }
};
