const Comment = require('../models/Comment');
const logger = require('../logger');

// Get comments for a post with pagination
exports.getComments = async (req, res) => {
  try {
    const { postId, page = 1, limit = 10 } = req.query;

    if (!postId) {
      return res.status(400).json({
        status: 'error',
        message: 'postId query parameter is required',
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('authorId', 'username email')
      .exec();

    const total = await Comment.countDocuments({ postId });

    res.json({
      status: 'success',
      data: {
        comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId, userId: req.user?.userId }, 'Get comments error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const authorId = req.user.userId; // From JWT middleware

    const comment = new Comment({
      postId,
      authorId,
      content,
    });

    await comment.save();
    await comment.populate('authorId', 'username email');

    logger.info({ commentId: comment._id, postId, authorId, correlationId: req.correlationId }, 'Comment created');

    res.status(201).json({
      status: 'success',
      data: {
        comment,
      },
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId, userId: req.user?.userId }, 'Create comment error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Delete a comment (author or admin only - authorization handled by middleware)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found',
      });
    }

    await Comment.findByIdAndDelete(id);

    logger.info({ commentId: id, userId, correlationId: req.correlationId }, 'Comment deleted');

    res.json({
      status: 'success',
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId, userId: req.user?.userId }, 'Delete comment error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

