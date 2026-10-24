const User = require('../models/User');
const AppError = require('../utils/AppError');
const { paginate, sanitizeUser } = require('../utils/helpers');

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter = { isActive: true };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).populate('department', 'name').sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: users.map(sanitizeUser),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('department', 'name');
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, jobTitle, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, jobTitle, phone, isActive },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, jobTitle, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, jobTitle, preferences },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Please upload an image', 400));
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: `/uploads/${req.file.filename}` },
      { new: true }
    );
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};
