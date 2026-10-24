const mongoose = require('mongoose');

const changeRequestSchema = new mongoose.Schema({
  changeId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  justification: String,
  category: {
    type: String,
    enum: ['software', 'hardware', 'network', 'security', 'infrastructure', 'other'],
    default: 'other'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  startDate: Date,
  endDate: Date,
  maintenanceWindow: {
    start: Date,
    end: Date
  },
  downtime: {
    type: String,
    default: '0 minutes'
  },
  rollbackPlan: {
    type: String
  },
  impactAssessment: String,
  approvalHistory: [{
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, enum: ['approved', 'rejected', 'requested_changes'] },
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  attachments: [{
    url: String,
    filename: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

changeRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('ChangeRequest').countDocuments();
    const year = new Date().getFullYear();
    this.changeId = `CHG-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

changeRequestSchema.index({ changeId: 1 });
changeRequestSchema.index({ status: 1, priority: 1 });
changeRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('ChangeRequest', changeRequestSchema);
