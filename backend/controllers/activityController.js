const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, resource } = req.query;
    const query = {};
    if (resource) query.resource = resource;

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    res.json({ success: true, data: logs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const Complaint = require('../models/Complaint');
    const Employee = require('../models/Employee');

    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeEmployees = await Employee.countDocuments({ status: 'active', isActive: true });
    const totalComplaints = await Complaint.countDocuments({ isActive: true });
    const pendingComplaints = await Complaint.countDocuments({ status: { $in: ['Pending', 'Assigned', 'In Progress'] }, isActive: true });
    const resolvedComplaints = await Complaint.countDocuments({ status: { $in: ['Resolved', 'Closed'] }, isActive: true });
    const highPriority = await Complaint.countDocuments({ priority: 'High', isActive: true });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayComplaints = await Complaint.countDocuments({ createdAt: { $gte: todayStart } });
    const recentActivity = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);

    const monthlyData = await Complaint.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);
    const departmentData = await Complaint.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);
    const priorityData = await Complaint.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { totalEmployees, activeEmployees, totalComplaints, pendingComplaints, resolvedComplaints, highPriority, todayComplaints, recentActivity, monthlyData, departmentData, priorityData } });
  } catch (err) {
    next(err);
  }
};
