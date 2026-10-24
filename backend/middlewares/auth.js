const jwt = require('jsonwebtoken');
const config = require('../config');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');

const authenticate = (...roles) => {
  return async (req, res, next) => {
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      if (!token) {
        return next(new AppError('Authentication required. Please login.', 401));
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);

      if (decoded.role === 'admin') {
        const admin = await Admin.findById(decoded.id);
        if (!admin || !admin.isActive) {
          return next(new AppError('Admin not found or deactivated.', 401));
        }
        req.user = admin;
        req.userId = admin._id;
        req.userRole = 'admin';
        req.admin = admin;
      } else if (decoded.role === 'employee') {
        const employee = await Employee.findById(decoded.id);
        if (!employee || !employee.isActive || employee.status !== 'active') {
          return next(new AppError('Employee not found or deactivated.', 401));
        }
        req.user = employee;
        req.userId = employee._id;
        req.userRole = 'employee';
      } else {
        return next(new AppError('Invalid user role.', 401));
      }

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return next(new AppError('You do not have permission to perform this action.', 403));
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token.', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Token expired. Please login again.', 401));
      }
      return next(new AppError('Authentication failed.', 401));
    }
  };
};

module.exports = { authenticate };
