const Asset = require('../models/Asset');
const ActivityLog = require('../models/ActivityLog');
const AppError = require('../utils/AppError');
const { paginate, buildSort } = require('../utils/helpers');

exports.createAsset = async (req, res, next) => {
  try {
    const asset = await Asset.create(req.body);
    const populated = await Asset.findById(asset._id)
      .populate('assignedTo', 'name email')
      .populate('department', 'name');

    await ActivityLog.create({
      actor: req.user._id,
      action: 'created',
      resourceType: 'asset',
      resourceId: asset._id,
      description: `Asset ${asset.assetId} created: ${asset.name}`,
      ip: req.ip
    });

    res.status(201).json({ success: true, message: 'Asset created', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.getAssets = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    if (req.query.vendor) filter.vendor = { $regex: req.query.vendor, $options: 'i' };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { assetId: { $regex: req.query.search, $options: 'i' } },
        { serialNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const sort = buildSort(req.query.sortBy);

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .populate('assignedTo', 'name email')
        .populate('department', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Asset.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: assets,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasMore: skip + assets.length < total
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('department', 'name');

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    res.json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

exports.updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo department');

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    await ActivityLog.create({
      actor: req.user._id,
      action: 'updated',
      resourceType: 'asset',
      resourceId: asset._id,
      description: `Asset ${asset.assetId} updated`,
      ip: req.ip
    });

    res.json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

exports.deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    await ActivityLog.create({
      actor: req.user._id,
      action: 'deleted',
      resourceType: 'asset',
      resourceId: asset._id,
      description: `Asset ${asset.assetId} deleted: ${asset.name}`,
      ip: req.ip
    });

    res.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    next(error);
  }
};

exports.addMaintenanceRecord = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    asset.maintenanceHistory.push(req.body);
    await asset.save();

    res.json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

exports.getAssetStats = async (req, res, next) => {
  try {
    const stats = await Asset.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const statusStats = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { typeStats: stats, statusStats } });
  } catch (error) {
    next(error);
  }
};
