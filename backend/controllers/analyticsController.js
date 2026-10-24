const Incident = require('../models/Incident');
const Asset = require('../models/Asset');
const User = require('../models/User');
const ChangeRequest = require('../models/ChangeRequest');
const KnowledgeArticle = require('../models/KnowledgeArticle');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      openIncidents,
      criticalIncidents,
      pendingChanges,
      totalAssets,
      totalKnowledge,
      totalUsers,
      resolvedIncidents
    ] = await Promise.all([
      Incident.countDocuments({ status: { $ne: 'closed' } }),
      Incident.countDocuments({ priority: 'critical', status: { $ne: 'closed' } }),
      ChangeRequest.countDocuments({ status: 'pending' }),
      Asset.countDocuments({ isActive: true }),
      KnowledgeArticle.countDocuments({ status: 'published' }),
      User.countDocuments({ isActive: true }),
      Incident.countDocuments({ status: 'resolved' })
    ]);

    const slaStatus = await Incident.aggregate([
      { $group: { _id: '$isOverdue', count: { $sum: 1 } } }
    ]);

    const recentActivity = await Incident.find()
      .sort('-updatedAt')
      .limit(10)
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .select('incidentId title status priority updatedAt');

    res.json({
      success: true,
      data: {
        stats: {
          openIncidents, criticalIncidents, pendingChanges,
          totalAssets, totalKnowledge, totalUsers, resolvedIncidents
        },
        slaStatus,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyIncidents = await Incident.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const priorityDist = await Incident.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const deptWise = await Incident.aggregate([
      { $match: { department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: { monthlyIncidents, priorityDist, deptWise }
    });
  } catch (error) {
    next(error);
  }
};

exports.getEngineerPerformance = async (req, res, next) => {
  try {
    const performance = await Incident.aggregate([
      { $match: { assignedTo: { $ne: null }, status: 'resolved' } },
      { $group: {
        _id: '$assignedTo',
        resolvedCount: { $sum: 1 },
        avgResolutionTime: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } }
      }},
      { $sort: { resolvedCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'engineer' } },
      { $unwind: '$engineer' },
      { $project: { engineer: { name: 1, email: 1 }, resolvedCount: 1, avgResolutionTime: 1 } }
    ]);

    res.json({ success: true, data: performance });
  } catch (error) {
    next(error);
  }
};

exports.getExportData = async (req, res, next) => {
  try {
    const { type } = req.params;
    let data;

    switch (type) {
      case 'incidents':
        data = await Incident.find().populate('reportedBy assignedTo', 'name email').lean();
        break;
      case 'assets':
        data = await Asset.find().populate('assignedTo', 'name email').lean();
        break;
      case 'changes':
        data = await ChangeRequest.find().populate('requestedBy approvedBy', 'name email').lean();
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid export type' });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
