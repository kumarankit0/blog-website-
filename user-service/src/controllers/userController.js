const User = require('../models/User');
const logger = require('../logger');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      status: 'success',
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId, userId: req.user?.userId }, 'Get all users error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId, userId: req.user?.userId }, 'Get user by ID error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    logger.info({ userId, correlationId: req.correlationId }, 'User updated successfully');

    res.json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId, userId: req.user?.userId }, 'Update user error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    logger.info({ userId: user._id, correlationId: req.correlationId }, 'User deleted successfully');

    res.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId, userId: req.user?.userId }, 'Delete user error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

