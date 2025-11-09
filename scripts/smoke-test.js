#!/usr/bin/env node

/**
 * Smoke Test Script
 * Tests the full flow: health check, register, login, create post, create comment, fetch post with comments
 */

const BASE_URL = process.env.GATEWAY_URL || 'http://localhost:8080';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

async function runSmokeTest() {
  log('\n=== Nimbus Blog Smoke Test ===\n', 'yellow');

  let token = null;
  let userId = null;
  let postId = null;
  let commentId = null;

  try {
    // Step 1: Health Check
    logStep('1', 'Checking gateway health...');
    const healthResponse = await makeRequest('GET', '/health');
    if (healthResponse.status === 200 && healthResponse.data.status === 'ok') {
      logSuccess('Gateway is healthy');
    } else {
      throw new Error('Gateway health check failed');
    }

    // Step 2: Register User
    logStep('2', 'Registering new user...');
    const registerData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@nimbus.com`,
      password: 'test123456',
    };

    const registerResponse = await makeRequest('POST', '/api/v1/auth/register', registerData);
    if (registerResponse.status === 201 && registerResponse.data.status === 'success') {
      token = registerResponse.data.data.token;
      userId = registerResponse.data.data.user._id;
      logSuccess(`User registered: ${registerData.email}`);
    } else {
      throw new Error(`Registration failed: ${registerResponse.data.message || 'Unknown error'}`);
    }

    // Step 3: Login
    logStep('3', 'Logging in...');
    const loginResponse = await makeRequest('POST', '/api/v1/auth/login', {
      email: registerData.email,
      password: registerData.password,
    });
    if (loginResponse.status === 200 && loginResponse.data.status === 'success') {
      token = loginResponse.data.data.token; // Use token from login
      logSuccess('Login successful');
    } else {
      throw new Error(`Login failed: ${loginResponse.data.message || 'Unknown error'}`);
    }

    // Step 4: Create Post
    logStep('4', 'Creating a post...');
    const postData = {
      title: 'Smoke Test Post',
      content: 'This is a test post created by the smoke test script.',
    };

    const postResponse = await makeRequest('POST', '/api/v1/posts', postData, token);
    if (postResponse.status === 201 && postResponse.data.status === 'success') {
      postId = postResponse.data.data.post._id;
      logSuccess(`Post created: ${postId}`);
    } else {
      throw new Error(`Post creation failed: ${postResponse.data.message || 'Unknown error'}`);
    }

    // Step 5: Create Comment
    logStep('5', 'Creating a comment...');
    const commentData = {
      postId: postId,
      content: 'This is a test comment created by the smoke test script.',
    };

    const commentResponse = await makeRequest('POST', '/api/v1/comments', commentData, token);
    if (commentResponse.status === 201 && commentResponse.data.status === 'success') {
      commentId = commentResponse.data.data.comment._id;
      logSuccess(`Comment created: ${commentId}`);
    } else {
      throw new Error(`Comment creation failed: ${commentResponse.data.message || 'Unknown error'}`);
    }

    // Step 6: Fetch Post with Comments
    logStep('6', 'Fetching post with comments...');
    const getPostResponse = await makeRequest('GET', `/api/v1/posts/${postId}`, null, token);
    if (getPostResponse.status === 200 && getPostResponse.data.status === 'success') {
      logSuccess('Post fetched successfully');
      const post = getPostResponse.data.data.post;
      log(`  Title: ${post.title}`);
      log(`  Author: ${post.authorId?.username || 'Unknown'}`);
    } else {
      throw new Error(`Failed to fetch post: ${getPostResponse.data.message || 'Unknown error'}`);
    }

    const getCommentsResponse = await makeRequest('GET', `/api/v1/comments?postId=${postId}`, null, token);
    if (getCommentsResponse.status === 200 && getCommentsResponse.data.status === 'success') {
      const comments = getCommentsResponse.data.data.comments || [];
      logSuccess(`Comments fetched: ${comments.length} comment(s)`);
      comments.forEach((comment, index) => {
        log(`  Comment ${index + 1}: ${comment.content.substring(0, 50)}...`);
      });
    } else {
      throw new Error(`Failed to fetch comments: ${getCommentsResponse.data.message || 'Unknown error'}`);
    }

    // Summary
    log('\n=== Smoke Test Summary ===', 'yellow');
    logSuccess('All tests passed!');
    log(`\nTest Data Created:`, 'blue');
    log(`  User ID: ${userId}`);
    log(`  Post ID: ${postId}`);
    log(`  Comment ID: ${commentId}`);
    log(`\nYou can clean up test data manually if needed.`, 'yellow');

    process.exit(0);
  } catch (error) {
    logError(`\nSmoke test failed: ${error.message}`);
    log(`\nFailed at step with:`, 'red');
    if (token) log(`  Token: ${token.substring(0, 20)}...`);
    if (postId) log(`  Post ID: ${postId}`);
    if (commentId) log(`  Comment ID: ${commentId}`);
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  logError('This script requires Node.js 18+ or install node-fetch');
  process.exit(1);
}

runSmokeTest();

