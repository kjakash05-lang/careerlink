const express = require('express');
const {
  createArticle,
  getArticles,
  getArticleById,
  likeArticle,
  addComment,
  deleteArticle,
} = require('../controllers/articleController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getArticles)
  .post(protect, createArticle);

router.route('/:id')
  .get(getArticleById)
  .delete(protect, deleteArticle);

router.put('/:id/like', protect, likeArticle);
router.post('/:id/comments', protect, addComment);

module.exports = router;
