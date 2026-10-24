const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/stats', authenticate, assetController.getAssetStats);
router.get('/', authenticate, assetController.getAssets);
router.post('/', authenticate, authorize('admin', 'manager'), assetController.createAsset);
router.get('/:id', authenticate, assetController.getAsset);
router.put('/:id', authenticate, authorize('admin', 'manager'), assetController.updateAsset);
router.delete('/:id', authenticate, authorize('admin'), assetController.deleteAsset);
router.post('/:id/maintenance', authenticate, authorize('admin', 'manager'), assetController.addMaintenanceRecord);

module.exports = router;
