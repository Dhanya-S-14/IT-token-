const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { getDeployments, getDeployment, createDeployment, updateDeployment, deleteDeployment } = require('../controllers/deploymentController');

router.get('/', authenticate('admin'), getDeployments);
router.get('/:id', authenticate('admin'), getDeployment);
router.post('/', authenticate('admin'), createDeployment);
router.put('/:id', authenticate('admin'), updateDeployment);
router.delete('/:id', authenticate('admin'), deleteDeployment);

module.exports = router;
