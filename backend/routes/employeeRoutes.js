const router = require('express').Router();
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const {
  getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, resetPassword,
  getEmployeeProfile, updateEmployeeProfile, changeEmployeePassword
} = require('../controllers/employeeController');

router.get('/profile', authenticate('employee'), getEmployeeProfile);
router.put('/profile', authenticate('employee'), updateEmployeeProfile);
router.put('/change-password', authenticate('employee'), changeEmployeePassword);

router.get('/', authenticate('admin'), getEmployees);
router.get('/:id', authenticate('admin'), getEmployee);
router.post('/', authenticate('admin'), createEmployee);
router.put('/:id', authenticate('admin'), updateEmployee);
router.delete('/:id', authenticate('admin'), deleteEmployee);
router.put('/:id/reset-password', authenticate('admin'), resetPassword);

module.exports = router;
