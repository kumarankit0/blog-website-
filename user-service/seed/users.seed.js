require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const config = require('../src/config');
const logger = require('../src/logger');

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});

    // Create admin user
    const adminUser = await User.findOne({ email: 'admin@nimbus.com' });
    if (!adminUser) {
      await User.create({
        username: 'admin',
        email: 'admin@nimbus.com',
        password: 'admin123',
        role: 'admin',
      });
      logger.info('Admin user created: admin@nimbus.com / admin123');
    } else {
      logger.info('Admin user already exists');
    }

    // Create sample user
    const sampleUser = await User.findOne({ email: 'user@nimbus.com' });
    if (!sampleUser) {
      await User.create({
        username: 'testuser',
        email: 'user@nimbus.com',
        password: 'user123',
        role: 'user',
      });
      logger.info('Sample user created: user@nimbus.com / user123');
    } else {
      logger.info('Sample user already exists');
    }

    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error: error.message }, 'Seeding error');
    process.exit(1);
  }
};

seedUsers();

