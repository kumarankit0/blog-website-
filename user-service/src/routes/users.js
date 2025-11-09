const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUpdateUser } = require('../validators/user.validator');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, userController.getUserById);

// Update user (owner or admin)
router.put('/:id', authenticate, validateUpdateUser, authorizeOwnerOrAdmin(async (req) => {
  const user = await User.findById(req.params.id);
  return user?._id?.toString();
}), userController.updateUser);

// Delete user (owner or admin)
router.delete('/:id', authenticate, authorizeOwnerOrAdmin(async (req) => {
  const user = await User.findById(req.params.id);
  return user?._id?.toString();
}), userController.deleteUser);

module.exports = router;

