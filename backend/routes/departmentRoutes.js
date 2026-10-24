const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/', authenticate, departmentController.getDepartments);
router.post('/', authenticate, authorize('admin'), departmentController.createDepartment);
router.get('/:id', authenticate, departmentController.getDepartment);
router.put('/:id', authenticate, authorize('admin'), departmentController.updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), departmentController.deleteDepartment);

module.exports = router;
