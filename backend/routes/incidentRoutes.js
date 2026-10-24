const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', authenticate, incidentController.getIncidents);
router.post('/', authenticate, incidentController.createIncident);
router.get('/:id', authenticate, incidentController.getIncident);
router.put('/:id', authenticate, incidentController.updateIncident);
router.delete('/:id', authenticate, authorize('admin', 'manager'), incidentController.deleteIncident);
router.put('/:id/assign', authenticate, authorize('admin', 'manager'), incidentController.assignIncident);
router.put('/:id/close', authenticate, authorize('admin', 'manager', 'engineer'), incidentController.closeIncident);

module.exports = router;
