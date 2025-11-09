# Testing Guide

This document describes how to run tests for the Nimbus Blog microservices platform.

## Prerequisites

- All services running (via `make up` or `docker-compose up -d`)
- Node.js 18+ (for smoke and load test scripts)
- Artillery (optional, for advanced load testing)

## Seed Scripts

Seed scripts populate the databases with initial test data.

### Running Individual Seed Scripts

```bash
# User service
cd user-service
npm run seed

# Post service
cd post-service
npm run seed

# Comment service
cd comment-service
npm run seed
```

### Running All Seed Scripts

```bash
# Using Make (recommended)
make seed

# Or manually via Docker Compose
docker-compose exec user-service npm run seed
docker-compose exec post-service npm run seed
docker-compose exec comment-service npm run seed
```

### Seed Data Created

**User Service:**
- Admin user: `admin@nimbus.com` / `admin123` (role: admin)
- Sample user: `user@nimbus.com` / `user123` (role: user)

**Post Service:**
- 5 sample blog posts with various topics

**Comment Service:**
- Sample comments (requires posts and users to exist)

**Note:** Seed scripts are idempotent - they check if data already exists before creating.

## Smoke Tests

Smoke tests verify the basic functionality of the entire system by testing the full flow.

### Running Smoke Tests

```bash
# Using Make
make test-smoke

# Or directly
node scripts/smoke-test.js

# With custom gateway URL
GATEWAY_URL=http://localhost:8080 node scripts/smoke-test.js
```

### What Smoke Tests Cover

1. **Health Check** - Verifies gateway is responding
2. **User Registration** - Creates a new user account
3. **User Login** - Authenticates with credentials
4. **Create Post** - Creates a blog post (authenticated)
5. **Create Comment** - Adds a comment to the post
6. **Fetch Post** - Retrieves post details
7. **Fetch Comments** - Retrieves comments for the post

### Expected Output

```
=== Nimbus Blog Smoke Test ===

[1] Checking gateway health...
✓ Gateway is healthy

[2] Registering new user...
✓ User registered: test_1234567890@nimbus.com

[3] Logging in...
✓ Login successful

[4] Creating a post...
✓ Post created: 507f1f77bcf86cd799439011

[5] Creating a comment...
✓ Comment created: 507f191e810c19729de860ea

[6] Fetching post with comments...
✓ Post fetched successfully
✓ Comments fetched: 1 comment(s)

=== Smoke Test Summary ===
✓ All tests passed!
```

## Load Tests

Load tests demonstrate service isolation and system resilience under concurrent load.

### Simple Load Test (Node.js)

```bash
# Using Make
make test-load

# Or directly
node scripts/load-test.js

# With custom configuration
CONCURRENT_REQUESTS=20 TOTAL_REQUESTS=200 node scripts/load-test.js
```

**Configuration:**
- `CONCURRENT_REQUESTS` - Number of concurrent requests (default: 10)
- `TOTAL_REQUESTS` - Total number of requests (default: 100)
- `GATEWAY_URL` - Gateway URL (default: http://localhost:8080)

### Artillery Load Test

Artillery provides more advanced load testing capabilities.

#### Installation

```bash
npm install -g artillery
```

#### Running Artillery Tests

```bash
# Using Make
make test-artillery

# Or directly
artillery run artillery-config.yml

# With custom target
artillery run --target http://localhost:8080 artillery-config.yml
```

#### Artillery Configuration

The `artillery-config.yml` file defines:
- **Phases**: Warm-up, sustained load, cool-down
- **Scenarios**: 
  - Fetch posts (read-heavy)
  - Health checks (lightweight)
  - Create post and comment flow (write-heavy)

#### Customizing Artillery Tests

Edit `artillery-config.yml` to adjust:
- `arrivalRate`: Requests per second
- `duration`: How long each phase runs
- `weight`: Probability of each scenario

Example:
```yaml
phases:
  - duration: 60
    arrivalRate: 10    # 10 requests/second
  - duration: 120
    arrivalRate: 50    # 50 requests/second (sustained)
```

## Running Tests Safely

### Development Environment

✅ **Safe to run:**
- Smoke tests
- Light load tests (< 100 requests)
- Tests against local Docker Compose setup

### Production Environment

⚠️ **Use caution:**
- Never run load tests against production without permission
- Start with low concurrency and gradually increase
- Monitor service health during tests
- Use rate limiting to prevent overwhelming services

### Best Practices

1. **Start Small**: Begin with low concurrency and gradually increase
2. **Monitor Services**: Watch logs and metrics during tests
3. **Clean Up**: Remove test data after testing if needed
4. **Isolated Environment**: Use dedicated test environment when possible
5. **Time Limits**: Set reasonable timeouts for test scripts

### Monitoring During Tests

```bash
# Watch service logs
make logs

# Or individual service logs
docker-compose logs -f user-service
docker-compose logs -f post-service
docker-compose logs -f comment-service
docker-compose logs -f api-gateway

# Check service health
curl http://localhost:8080/health
curl http://localhost:8080/status
curl http://localhost:8080/metrics
```

## Troubleshooting

### Smoke Test Failures

1. **Gateway not responding**
   - Ensure all services are running: `make up`
   - Check service health: `docker-compose ps`

2. **Authentication errors**
   - Verify JWT_SECRET matches across services
   - Check user-service is running and accessible

3. **Database connection errors**
   - Ensure MongoDB containers are running
   - Check MONGO_URI in service configurations

### Load Test Issues

1. **High failure rate**
   - Reduce concurrent requests
   - Check service resource limits
   - Verify rate limiting isn't blocking requests

2. **Slow response times**
   - Check service logs for errors
   - Monitor database performance
   - Verify network connectivity

3. **Connection errors**
   - Ensure gateway can handle load
   - Check Docker resource allocation
   - Verify all services are healthy

## Test Data Cleanup

Test scripts create temporary data. To clean up:

```bash
# Option 1: Reset databases (removes all data)
make clean
make up
make seed

# Option 2: Manual cleanup via API
# Delete test posts, comments, and users created during testing
```

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Smoke Tests
  run: |
    make up
    sleep 10  # Wait for services to start
    make seed
    make test-smoke
```

## Performance Benchmarks

Expected performance (local Docker setup):
- **Health Check**: < 10ms
- **Post Fetch**: < 50ms
- **Post Create**: < 100ms
- **Comment Create**: < 80ms

Actual performance depends on:
- Hardware resources
- Network latency
- Database performance
- Concurrent load

