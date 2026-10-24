const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referenceType: {
    type: String,
    enum: ['incident', 'knowledge', 'asset', 'change'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Incident', 'KnowledgeArticle', 'Asset', 'ChangeRequest'],
    required: true
  },
  isInternal: {
    type: Boolean,
    default: false
  },
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

commentSchema.index({ referenceId: 1, referenceType: 1 });
commentSchema.index({ author: 1 });

module.exports = mongoose.model('Comment', commentSchema);
