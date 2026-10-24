const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', authenticate, authorize('admin', 'manager'), userController.getUsers);
router.get('/:id', authenticate, userController.getUser);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);
router.put('/profile/update', authenticate, userController.updateProfile);
router.put('/profile/picture', authenticate, upload.single('profilePicture'), userController.updateProfilePicture);

module.exports = router;
