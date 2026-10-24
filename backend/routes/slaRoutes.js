const express = require('express');
const router = express.Router();
const slaController = require('../controllers/slaController');
const { authenticate } = require('../middlewares/auth');

router.get('/summary', authenticate, slaController.getSLASummary);
router.get('/', authenticate, slaController.getAllSLA);
router.get('/:incidentId', authenticate, slaController.getSLAStatus);

module.exports = router;
