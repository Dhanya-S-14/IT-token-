const mongoose = require('mongoose');

const slaRecordSchema = new mongoose.Schema({
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  slaDeadline: {
    type: Date,
    required: true
  },
  responseDeadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'warning', 'breached', 'met', 'paused'],
    default: 'active'
  },
  breachTime: Date,
  acknowledgedAt: Date,
  resolvedAt: Date,
  totalResponseTime: Number,
  totalResolutionTime: Number,
  escalatedAt: Date,
  escalationLevel: {
    type: Number,
    default: 0
  },
  notificationsSent: [{
    type: { type: String, enum: ['warning', 'breach', 'escalation'] },
    sentAt: { type: Date, default: Date.now },
    sentTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, {
  timestamps: true
});

slaRecordSchema.index({ incident: 1 });
slaRecordSchema.index({ status: 1 });
slaRecordSchema.index({ slaDeadline: 1 });

module.exports = mongoose.model('SLARecord', slaRecordSchema);
