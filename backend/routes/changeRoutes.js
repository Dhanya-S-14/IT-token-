const express = require('express');
const router = express.Router();
const changeController = require('../controllers/changeController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, changeController.getChangeRequests);
router.post('/', authenticate, changeController.createChangeRequest);
router.get('/:id', authenticate, changeController.getChangeRequest);
router.put('/:id', authenticate, changeController.updateChangeRequest);
router.put('/:id/approve', authenticate, authorize('admin', 'manager'), changeController.approveChangeRequest);
router.put('/:id/reject', authenticate, authorize('admin', 'manager'), changeController.rejectChangeRequest);

module.exports = router;
