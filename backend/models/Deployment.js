const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  deploymentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  clientName: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  team: {
    type: String,
    default: ''
  },
  manager: {
    type: String,
    default: ''
  },
  shiftTiming: {
    type: String,
    default: ''
  },
  workMode: {
    type: String,
    enum: ['Office', 'Hybrid', 'Remote'],
    default: 'Office'
  },
  status: {
    type: String,
    enum: ['Active', 'Bench', 'Completed'],
    default: 'Active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

deploymentSchema.index({ employee: 1 });
deploymentSchema.index({ status: 1 });
deploymentSchema.index({ department: 1 });

module.exports = mongoose.model('Deployment', deploymentSchema);
