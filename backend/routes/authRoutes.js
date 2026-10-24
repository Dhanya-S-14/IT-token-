const router = require('express').Router();
const { adminLogin, employeeLogin, employeeRegister } = require('../controllers/authController');

router.post('/admin/login', adminLogin);
router.post('/employee/login', employeeLogin);
router.post('/employee/register', employeeRegister);

module.exports = router;
