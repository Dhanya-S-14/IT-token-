const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentId: {
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
    required: [true, 'Description is required'],
    minlength: 10,
    maxlength: 5000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    enum: ['hardware', 'software', 'network', 'security', 'vpn', 'email', 'server', 'cloud', 'other'],
    default: 'other'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  resolution: {
    type: String,
    maxlength: 5000
  },
  resolvedAt: Date,
  closedAt: Date,
  dueBy: Date,
  isOverdue: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

incidentSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'referenceId'
});

incidentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Incident').countDocuments();
    const year = new Date().getFullYear();
    this.incidentId = `INC-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ status: 1, priority: 1 });
incidentSchema.index({ assignedTo: 1 });
incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
