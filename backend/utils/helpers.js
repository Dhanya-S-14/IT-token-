const crypto = require('crypto');

const generateRandomPassword = (length = 16) => {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
};

const generateIncidentId = (count) => {
  const year = new Date().getFullYear();
  return `INC-${year}-${String(count + 1).padStart(5, '0')}`;
};

const sanitizeUser = (user) => {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.password;
  delete sanitized.refreshToken;
  delete sanitized.resetPasswordToken;
  delete sanitized.resetPasswordExpire;
  return sanitized;
};

const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);
  const skip = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, skip };
};

const buildFilter = (query, allowedFields) => {
  const filter = {};
  allowedFields.forEach(field => {
    if (query[field] !== undefined) {
      filter[field] = query[field];
    }
  });
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }
  return filter;
};

const buildSort = (sortBy = '-createdAt') => {
  const sort = {};
  const fields = sortBy.split(',');
  fields.forEach(field => {
    if (field.startsWith('-')) {
      sort[field.substring(1)] = -1;
    } else {
      sort[field] = 1;
    }
  });
  return sort;
};

const calculateSLADeadline = (priority) => {
  const SLA_HOURS = { low: 48, medium: 24, high: 8, critical: 4 };
  const hours = SLA_HOURS[priority] || 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

module.exports = {
  generateRandomPassword,
  generateIncidentId,
  sanitizeUser,
  paginate,
  buildFilter,
  buildSort,
  calculateSLADeadline
};
