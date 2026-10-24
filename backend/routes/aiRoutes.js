const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/chat', aiController.chat);
router.post('/categorize', aiController.categorize);
router.post('/priority', aiController.priority);
router.post('/enhance', aiController.enhance);
router.post('/troubleshoot', aiController.troubleshoot);
router.get('/summary/:complaintId', aiController.summary);
router.get('/suggest-reply/:complaintId', aiController.suggestReply);
router.get('/insights', aiController.insights);
router.post('/rca', aiController.rca);
router.post('/predict-sla', aiController.predictSla);

module.exports = router;
