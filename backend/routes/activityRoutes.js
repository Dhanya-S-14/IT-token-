const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { getActivityLogs, getDashboardStats } = require('../controllers/activityController');

router.get('/', authenticate('admin'), getActivityLogs);
router.get('/dashboard', authenticate('admin'), getDashboardStats);

module.exports = router;
