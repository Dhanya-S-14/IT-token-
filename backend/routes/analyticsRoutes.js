const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/auth');

router.get('/dashboard', authenticate, analyticsController.getDashboardStats);
router.get('/monthly-trends', authenticate, analyticsController.getMonthlyTrends);
router.get('/engineer-performance', authenticate, analyticsController.getEngineerPerformance);
router.get('/export/:type', authenticate, analyticsController.getExportData);

module.exports = router;
