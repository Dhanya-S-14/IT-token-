const router = require('express').Router();
const upload = require('../middlewares/upload');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const {
  createComplaint, getMyComplaints, getComplaint, getComplaintByToken,
  getAllComplaints, assignComplaint, updateComplaintStatus, deleteComplaint,
  getComplaintStats, getEmployeeComplaintStats
} = require('../controllers/complaintController');

router.post('/', authenticate('employee'), upload.single('screenshot'), createComplaint);
router.get('/my', authenticate('employee'), getMyComplaints);
router.get('/stats', authenticate('admin'), getComplaintStats);
router.get('/employee-stats', authenticate('employee'), getEmployeeComplaintStats);
router.get('/token/:token', getComplaintByToken);

router.get('/', authenticate('admin'), getAllComplaints);
router.get('/:id', authenticate(), getComplaint);
router.put('/:id/assign', authenticate('admin'), assignComplaint);
router.put('/:id/status', authenticate('admin'), upload.single('resolutionScreenshot'), updateComplaintStatus);
router.delete('/:id', authenticate('admin'), deleteComplaint);

module.exports = router;
