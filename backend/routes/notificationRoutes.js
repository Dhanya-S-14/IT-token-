const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

router.get('/', authenticate(), getMyNotifications);
router.put('/:id/read', authenticate(), markAsRead);
router.put('/read-all', authenticate(), markAllAsRead);

module.exports = router;
