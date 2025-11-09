const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { validateCreateComment } = require('../validators/comment.validator');
const Comment = require('../models/Comment');

// Get comments for a post (public endpoint)
router.get('/', commentController.getComments);

// Create a new comment (requires authentication)
router.post('/', authenticate, validateCreateComment, commentController.createComment);

// Delete a comment (requires authentication, author or admin only)
router.delete('/:id', authenticate, authorizeOwnerOrAdmin(async (req) => {
  const comment = await Comment.findById(req.params.id);
  return comment?.authorId?.toString();
}), commentController.deleteComment);

module.exports = router;

