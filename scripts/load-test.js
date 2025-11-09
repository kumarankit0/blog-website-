#!/usr/bin/env node

/**
 * Simple Load Test Script
 * Performs N concurrent requests to demonstrate service isolation
 */

const BASE_URL = process.env.GATEWAY_URL || 'http://localhost:8080';
const CONCURRENT_REQUESTS = parseInt(process.env.CONCURRENT_REQUESTS || '10', 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '100', 10);

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

async function makeRequest(endpoint, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    const duration = Date.now() - startTime;
    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      duration,
      data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      status: 0,
      duration,
      error: error.message,
    };
  }
}

async function createTestUser() {
  const registerData = {
    username: `loadtest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    email: `loadtest_${Date.now()}_${Math.random().toString(36).substring(7)}@nimbus.com`,
    password: 'test123456',
  };

  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
    const data = await response.json();
    if (data.status === 'success') {
      return data.data.token;
    }
  } catch (error) {
    // Ignore registration errors, use existing token or proceed without auth
  }
  return null;
}

async function runConcurrentRequests(endpoint, token, count) {
  const promises = Array(count).fill(null).map(() => makeRequest(endpoint, token));
  return Promise.all(promises);
}

async function runLoadTest() {
  log('\n=== Nimbus Blog Load Test ===\n', 'yellow');
  log(`Configuration:`, 'blue');
  log(`  Gateway URL: ${BASE_URL}`);
  log(`  Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  log(`  Total Requests: ${TOTAL_REQUESTS}`);
  log(`  Endpoint: /api/v1/posts\n`);

  const results = {
    total: 0,
    success: 0,
    failed: 0,
    durations: [],
    statusCodes: {},
  };

  // Create a test user for authenticated requests
  log('Creating test user...', 'blue');
  const token = await createTestUser();
  if (token) {
    log('Test user created\n', 'green');
  } else {
    log('Proceeding without authentication\n', 'yellow');
  }

  const startTime = Date.now();
  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS);

  log(`Running ${batches} batch(es) of ${CONCURRENT_REQUESTS} concurrent requests...\n`, 'blue');

  for (let batch = 0; batch < batches; batch++) {
    const remaining = TOTAL_REQUESTS - results.total;
    const batchSize = Math.min(CONCURRENT_REQUESTS, remaining);

    const batchResults = await runConcurrentRequests('/api/v1/posts', token, batchSize);

    batchResults.forEach((result) => {
      results.total++;
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
      results.durations.push(result.duration);
      const status = result.status || 'error';
      results.statusCodes[status] = (results.statusCodes[status] || 0) + 1;
    });

    const successRate = ((results.success / results.total) * 100).toFixed(2);
    log(`Batch ${batch + 1}/${batches}: ${results.total}/${TOTAL_REQUESTS} requests | Success: ${results.success} | Failed: ${results.failed} | Success Rate: ${successRate}%`, 'blue');
  }

  const totalDuration = Date.now() - startTime;
  const avgDuration = results.durations.reduce((a, b) => a + b, 0) / results.durations.length;
  const minDuration = Math.min(...results.durations);
  const maxDuration = Math.max(...results.durations);
  const requestsPerSecond = (results.total / (totalDuration / 1000)).toFixed(2);

  // Summary
  log('\n=== Load Test Results ===', 'yellow');
  log(`Total Requests: ${results.total}`, 'blue');
  log(`Successful: ${results.success}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'blue');
  log(`Success Rate: ${((results.success / results.total) * 100).toFixed(2)}%`, 'blue');
  log(`\nTiming:`, 'blue');
  log(`  Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
  log(`  Average Response Time: ${avgDuration.toFixed(2)}ms`);
  log(`  Min Response Time: ${minDuration}ms`);
  log(`  Max Response Time: ${maxDuration}ms`);
  log(`  Requests/Second: ${requestsPerSecond}`);
  log(`\nStatus Codes:`, 'blue');
  Object.entries(results.statusCodes).forEach(([status, count]) => {
    log(`  ${status}: ${count}`);
  });

  if (results.failed === 0) {
    log('\n✓ All requests succeeded!', 'green');
  } else {
    log(`\n⚠ ${results.failed} request(s) failed`, 'yellow');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  log('This script requires Node.js 18+ or install node-fetch', 'red');
  process.exit(1);
}

runLoadTest();

