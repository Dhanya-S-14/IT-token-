const aiService = require('../services/aiService');
const AppError = require('../utils/AppError');
const Complaint = require('../models/Complaint');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.chat = catchAsync(async (req, res) => {
  const { message, history } = req.body;
  if (!message) throw new AppError('Message is required', 400);
  const reply = await aiService.chatWithAI({ message, history });
  res.json({ success: true, reply });
});

exports.categorize = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new AppError('Text is required', 400);
  const category = await aiService.categorizeComplaint(text);
  res.json({ success: true, category });
});

exports.priority = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new AppError('Text is required', 400);
  const priority = await aiService.detectPriority(text);
  res.json({ success: true, priority });
});

exports.summary = catchAsync(async (req, res) => {
  const { complaintId } = req.params;
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new AppError('Complaint not found', 404);
  const summary = await aiService.generateSummary(`${complaint.title}: ${complaint.description}`);
  res.json({ success: true, summary });
});

exports.suggestReply = catchAsync(async (req, res) => {
  const { complaintId } = req.params;
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new AppError('Complaint not found', 404);
  const reply = await aiService.suggestReply(complaint);
  res.json({ success: true, reply });
});

exports.enhance = catchAsync(async (req, res) => {
  const { title = '', description = '' } = req.body;
  if (!description && !title) throw new AppError('Title or description is required', 400);
  const enhanced = await aiService.enhanceDescription(title, description);
  res.json({ success: true, enhanced });
});

exports.troubleshoot = catchAsync(async (req, res) => {
  const { category = 'General', description = '' } = req.body;
  const steps = await aiService.suggestTroubleshooting(category, description);
  res.json({ success: true, steps });
});

exports.insights = catchAsync(async (req, res) => {
  const total = await Complaint.countDocuments();
  const open = await Complaint.countDocuments({ status: { $nin: ['Resolved', 'Closed'] } });
  const resolved = await Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] } });
  const highPriority = await Complaint.countDocuments({ priority: 'High', status: { $nin: ['Resolved', 'Closed'] } });
  
  const byCategory = await Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const catObj = {};
  byCategory.forEach(c => { if (c._id) catObj[c._id] = c.count; });

  const insights = await aiService.generateInsights({ total, open, resolved, highPriority, byCategory: catObj, avgResolutionTime: 24 });
  res.json({
    success: true,
    data: {
      insights,
      metrics: { total, open, resolved, highPriority }
    }
  });
});

exports.rca = catchAsync(async (req, res) => {
  const { title = '', description = '', category = 'General', priority = 'Medium', complaintId } = req.body;
  let t = title;
  let d = description;
  let c = category;
  let p = priority;

  if (complaintId) {
    const comp = await Complaint.findById(complaintId);
    if (comp) {
      t = comp.title;
      d = comp.description;
      c = comp.category;
      p = comp.priority;
    }
  }

  const rcaData = await aiService.generateRCA({ title: t, description: d, category: c, priority: p });
  res.json({ success: true, rca: rcaData });
});

exports.predictSla = catchAsync(async (req, res) => {
  const { title = '', category = 'General', priority = 'Medium', createdAt, complaintId } = req.body;
  let t = title;
  let c = category;
  let p = priority;
  let cr = createdAt;

  if (complaintId) {
    const comp = await Complaint.findById(complaintId);
    if (comp) {
      t = comp.title;
      c = comp.category;
      p = comp.priority;
      cr = comp.createdAt;
    }
  }

  const slaData = await aiService.predictSlaRisk({ title: t, category: c, priority: p, createdAt: cr });
  res.json({ success: true, sla: slaData });
});

