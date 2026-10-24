const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  description: String,
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

departmentSchema.virtual('members', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department'
});

module.exports = mongoose.model('Department', departmentSchema);
