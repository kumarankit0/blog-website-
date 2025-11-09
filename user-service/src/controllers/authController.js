const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const logger = require('../logger');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '24h' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email or username already exists',
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info({ userId: user._id, email, correlationId: req.correlationId }, 'User registered successfully');

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId }, 'Registration error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info({ userId: user._id, email, correlationId: req.correlationId }, 'User logged in successfully');

    res.json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    logger.error({ error: error.message, correlationId: req.correlationId }, 'Login error');
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

