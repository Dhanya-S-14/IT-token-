const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  replacedBy: String,
  userAgent: String,
  ip: String
}, {
  timestamps: true
});

refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

refreshTokenSchema.methods.isRevoked = function() {
  return this.revoked;
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
