const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const config = require('../config');
const AppError = require('../utils/AppError');
const ActivityLog = require('../models/ActivityLog');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRE });
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { adminId, email, identifier, username, password } = req.body;
    const loginIdentifier = (adminId || email || identifier || username || '').trim();
    if (!loginIdentifier || !password) {
      return next(new AppError('Please provide admin ID or email and password', 400));
    }
    const admin = await Admin.findOne({
      $or: [
        { adminId: { $regex: new RegExp(`^${loginIdentifier}$`, 'i') } },
        { email: loginIdentifier.toLowerCase() },
        ...(loginIdentifier.toLowerCase() === 'admin@opspulse.com' ? [{ email: 'admin@complaintpro.com' }] : []),
        ...(loginIdentifier.toLowerCase() === 'admin@complaintpro.com' ? [{ email: 'admin@opspulse.com' }] : [])
      ]
    }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return next(new AppError('Invalid admin ID/email or password', 401));
    }
    if (!admin.isActive) {
      return next(new AppError('Account has been deactivated', 401));
    }
    const token = signToken(admin._id, 'admin');
    admin.lastLogin = new Date();
    await admin.save();

    await ActivityLog.create({
      admin: admin._id,
      adminId: admin.adminId,
      adminName: admin.name,
      action: 'login',
      resource: 'login',
      details: 'Admin logged in'
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        profilePicture: admin.profilePicture
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.employeeLogin = async (req, res, next) => {
  try {
    const { employeeId, email, identifier, username, password } = req.body;
    const loginIdentifier = (employeeId || email || identifier || username || '').trim();
    if (!loginIdentifier || !password) {
      return next(new AppError('Please provide employee ID or email and password', 400));
    }
    
    // Support login by either employeeId (case-insensitive) or email (lowercase)
    const employee = await Employee.findOne({
      $or: [
        { employeeId: { $regex: new RegExp(`^${loginIdentifier}$`, 'i') } },
        { email: loginIdentifier.toLowerCase() }
      ]
    }).select('+password');

    if (!employee || !(await employee.comparePassword(password))) {
      return next(new AppError('Invalid employee ID/email or password', 401));
    }
    if (!employee.isActive || employee.status !== 'active') {
      return next(new AppError('Account has been deactivated', 401));
    }
    const token = signToken(employee._id, 'employee');
    employee.lastLogin = new Date();
    await employee.save();

    res.json({
      success: true,
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        phone: employee.phone,
        deploymentLocation: employee.deploymentLocation,
        joiningDate: employee.joiningDate,
        profilePicture: employee.profilePicture
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.employeeRegister = async (req, res, next) => {
  try {
    const { employeeId, name, email, password, phone, department, designation } = req.body;
    if (!name || !email || !password) {
      return next(new AppError('Please fill all required fields (name, email, password)', 400));
    }
    if (password.length < 6) {
      return next(new AppError('Password must be at least 6 characters long', 400));
    }

    // Auto-generate employeeId if not provided
    let empId = employeeId ? employeeId.trim().toUpperCase() : '';
    if (!empId) {
      const count = await Employee.countDocuments();
      empId = `EMP${String(count + 1).padStart(3, '0')}`;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const exists = await Employee.findOne({
      $or: [
        { employeeId: { $regex: new RegExp(`^${empId}$`, 'i') } },
        { email: trimmedEmail }
      ]
    });

    if (exists) {
      if (exists.email.toLowerCase() === trimmedEmail) {
        return next(new AppError('An account with this email address is already registered. Please log in directly with your email.', 400));
      }
      return next(new AppError(`Employee ID "${empId}" is already taken. Please enter a different Employee ID.`, 400));
    }

    const employee = await Employee.create({
      employeeId: empId,
      name: name.trim(),
      email: trimmedEmail,
      password,
      phone: phone || '',
      department: department || 'General',
      designation: designation || 'Employee',
      joiningDate: new Date()
    });

    const token = signToken(employee._id, 'employee');
    res.status(201).json({
      success: true,
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        phone: employee.phone,
        joiningDate: employee.joiningDate,
        profilePicture: employee.profilePicture
      }
    });
  } catch (err) {
    next(err);
  }
};
