const SLARecord = require('../models/SLARecord');
const { getSLADetails } = require('../services/slaService');

exports.getSLAStatus = async (req, res, next) => {
  try {
    const { incidentId } = req.params;
    const details = await getSLADetails(incidentId);

    if (!details) {
      return res.status(404).json({ success: false, message: 'SLA record not found' });
    }

    res.json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
};

exports.getAllSLA = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      SLARecord.find(filter)
        .populate({
          path: 'incident',
          select: 'incidentId title priority status',
          populate: { path: 'assignedTo', select: 'name email' }
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      SLARecord.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSLASummary = async (req, res, next) => {
  try {
    const summary = await SLARecord.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$totalResponseTime' },
        avgResolutionTime: { $avg: '$totalResolutionTime' }
      }}
    ]);

    const breachRate = await SLARecord.aggregate([
      { $group: {
        _id: null,
        total: { $sum: 1 },
        breached: { $sum: { $cond: [{ $eq: ['$status', 'breached'] }, 1, 0] } }
      }},
      { $project: { breachRate: { $multiply: [{ $divide: ['$breached', '$total'] }, 100] } } }
    ]);

    res.json({ success: true, data: { summary, breachRate: breachRate[0]?.breachRate || 0 } });
  } catch (error) {
    next(error);
  }
};
