const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId,
      recipientModel: req.userRole === 'admin' ? 'Admin' : 'Employee'
    }).sort({ createdAt: -1 }).limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      recipientModel: req.userRole === 'admin' ? 'Admin' : 'Employee',
      isRead: false
    });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return next(new AppError('Notification not found', 404));
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, recipientModel: req.userRole === 'admin' ? 'Admin' : 'Employee', isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
