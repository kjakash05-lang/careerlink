const express = require('express');
const {
  createPost,
  repostPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  savePost,
  addComment,
  deleteComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post('/:id/repost', protect, repostPost);
router.put('/:id/like', protect, likePost);
router.put('/:id/save', protect, savePost);

router.post('/:id/comments', protect, addComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
