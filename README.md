# Nimbus Blog

A microservices-based blog application built with modern architecture patterns.

## Project Overview

Nimbus Blog is a distributed blog platform that leverages microservices architecture to provide scalable, maintainable, and resilient blog functionality. The system is composed of multiple independent services that communicate through an API gateway.

## Architecture

The project consists of the following microservices:

- **user-service**: Manages user authentication, authorization, and user profile data
- **post-service**: Handles blog post creation, retrieval, updates, and deletion
- **comment-service**: Manages comments on blog posts
- **api-gateway**: Single entry point that routes requests to appropriate microservices
- **frontend**: User-facing web application

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Make (optional, for convenience commands)

### Quick Start with Docker Compose

1. **Start all services:**
```bash
make up
# or
docker-compose up -d
```

This will start:
- 3 MongoDB instances (user-mongo, post-mongo, comment-mongo)
- 3 microservices (user-service, post-service, comment-service)
- API Gateway (exposed on port 8080)
- Frontend (exposed on port 3000)

2. **Check service status:**
```bash
docker-compose ps
```

3. **View logs:**
```bash
make logs
# or
docker-compose logs -f
```

4. **Seed the databases:**
```bash
make seed
```

This will run seed scripts for all services to populate initial data.

5. **Stop all services:**
```bash
make down
# or
docker-compose down
```

### Available Make Commands

```bash
make up          # Start all services in detached mode
make down        # Stop all services
make build       # Build all Docker images
make logs        # Follow logs from all services
make seed        # Run seed scripts for all services
make clean       # Stop services and remove volumes
```

### Service URLs

Once services are running:

- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:3001
- **Post Service**: http://localhost:3002
- **Comment Service**: http://localhost:3003
- **Frontend**: http://localhost:3000

### Health Checks

All services expose a `/health` endpoint. You can check service health:

```bash
# Gateway
curl http://localhost:8080/health

# User Service
curl http://localhost:3001/health

# Post Service
curl http://localhost:3002/health

# Comment Service
curl http://localhost:3003/health
```

### Environment Variables

Create a `.env` file in the project root to customize configuration:

```env
JWT_SECRET=your-secret-key-change-in-production
SERVICE_TOKEN=shared-service-secret
```

These values will be used across all services.

### MongoDB Data Persistence

MongoDB data is persisted in named Docker volumes:
- `user-mongo-data`
- `post-mongo-data`
- `comment-mongo-data`

To remove all data:
```bash
make clean
```

### Development

Each service is independently deployable and can be developed in isolation. Refer to individual service directories for service-specific documentation.

For local development without Docker, see individual service README files for setup instructions.

## License

MIT

