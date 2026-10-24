const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  adminId: {
    type: String,
    default: ''
  },
  adminName: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true,
    enum: ['complaint', 'employee', 'deployment', 'admin', 'system', 'login', 'report']
  },
  resourceId: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ admin: 1 });
activityLogSchema.index({ resource: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
