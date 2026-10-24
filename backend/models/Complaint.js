const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Closed']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Hardware', 'Software', 'Network', 'Printer', 'Email', 'Internet', 'System Issue', 'Other']
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['Low', 'Medium', 'High']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  screenshot: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected', 'Closed'],
    default: 'Pending'
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: ''
  },
  assignedEngineer: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  estimatedResolutionDate: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  resolutionDescription: {
    type: String,
    default: ''
  },
  resolutionScreenshot: {
    type: String,
    default: ''
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  engineerNotes: {
    type: String,
    default: ''
  },
  timeline: [timelineSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

complaintSchema.index({ employee: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
