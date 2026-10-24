const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/bookmarks', authenticate, knowledgeController.getBookmarkedArticles);
router.get('/', authenticate, knowledgeController.getArticles);
router.post('/', authenticate, authorize('admin', 'manager', 'engineer'), knowledgeController.createArticle);
router.get('/:id', authenticate, knowledgeController.getArticle);
router.put('/:id', authenticate, authorize('admin', 'manager', 'engineer'), knowledgeController.updateArticle);
router.delete('/:id', authenticate, authorize('admin', 'manager'), knowledgeController.deleteArticle);
router.post('/:id/like', authenticate, knowledgeController.toggleLike);
router.post('/:id/bookmark', authenticate, knowledgeController.toggleBookmark);

module.exports = router;
