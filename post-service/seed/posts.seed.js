require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../src/models/Post');
const config = require('../src/config');
const logger = require('../src/logger');

const seedPosts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB for seeding');

    // Sample author IDs (these should exist in your system)
    // In a real scenario, you'd fetch these from the user-service
    const sampleAuthorId1 = new mongoose.Types.ObjectId();
    const sampleAuthorId2 = new mongoose.Types.ObjectId();

    // Clear existing posts (optional - comment out if you want to keep existing data)
    // await Post.deleteMany({});

    // Create sample posts
    const posts = [
      {
        title: 'Welcome to Nimbus Blog',
        content: 'This is the first post on Nimbus Blog. We are excited to share our thoughts and ideas with you. Stay tuned for more content!',
        authorId: sampleAuthorId1,
      },
      {
        title: 'Getting Started with Microservices',
        content: 'Microservices architecture is a powerful way to build scalable applications. In this post, we explore the fundamentals and best practices.',
        authorId: sampleAuthorId1,
      },
      {
        title: 'Building Resilient Systems',
        content: 'Resilience is key in distributed systems. Learn about circuit breakers, retries, and other patterns that help build robust applications.',
        authorId: sampleAuthorId2,
      },
      {
        title: 'API Gateway Patterns',
        content: 'API Gateways serve as the single entry point for client applications. They handle routing, authentication, rate limiting, and more.',
        authorId: sampleAuthorId1,
      },
      {
        title: 'Database Design for Microservices',
        content: 'Each microservice should have its own database. This post discusses database per service pattern and data consistency strategies.',
        authorId: sampleAuthorId2,
      },
    ];

    await Post.insertMany(posts);
    logger.info(`Created ${posts.length} sample posts`);

    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error: error.message }, 'Seeding error');
    process.exit(1);
  }
};

seedPosts();

