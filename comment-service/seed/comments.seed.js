require('dotenv').config();
const mongoose = require('mongoose');
const Comment = require('../src/models/Comment');
const config = require('../src/config');
const logger = require('../src/logger');

const seedComments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB for seeding');

    // Sample post IDs and author IDs (these should exist in your system)
    // In a real scenario, you'd fetch these from the post-service and user-service
    const samplePostId = new mongoose.Types.ObjectId();
    const sampleAuthorId1 = new mongoose.Types.ObjectId();
    const sampleAuthorId2 = new mongoose.Types.ObjectId();

    // Clear existing comments (optional - comment out if you want to keep existing data)
    // await Comment.deleteMany({});

    // Create sample comments
    const comments = [
      {
        postId: samplePostId,
        authorId: sampleAuthorId1,
        content: 'This is a great post! Thanks for sharing.',
      },
      {
        postId: samplePostId,
        authorId: sampleAuthorId2,
        content: 'I have a different perspective on this topic. Let me share my thoughts...',
      },
      {
        postId: samplePostId,
        authorId: sampleAuthorId1,
        content: 'Looking forward to more content like this!',
      },
    ];

    await Comment.insertMany(comments);
    logger.info(`Created ${comments.length} sample comments`);

    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error: error.message }, 'Seeding error');
    process.exit(1);
  }
};

seedComments();

