# Comment Service

Microservice for comment management in the Nimbus Blog platform.

## Features

- Create, read, and delete comments
- JWT-based authentication
- Pagination support
- Author and admin authorization
- Structured logging with Pino
- Request validation with Joi
- Health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/commentdb
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
LOG_LEVEL=info
```

## Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Seeding Database

Create initial sample comments:
```bash
npm run seed
```

## API Endpoints

### Health Check
```
GET /health
```
Returns: `{ "status": "ok" }`

### Comments

#### Get Comments for a Post
```
GET /api/v1/comments?postId=<postId>&page=1&limit=10
```
Query Parameters:
- `postId` (required): ID of the post
- `page` (optional): Page number (default: 1)
- `limit` (optional): Comments per page (default: 10)

#### Create Comment
```
POST /api/v1/comments
Headers: Authorization: Bearer <token>
Body: {
  "postId": "string",
  "content": "string"
}
```

#### Delete Comment
```
DELETE /api/v1/comments/:id
Headers: Authorization: Bearer <token>
```
Note: Only the comment author or an admin can delete a comment.

## Response Format

All API responses follow this structure:

**Success:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error message"
}
```

## Authentication

All write operations (POST, DELETE) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Correlation ID

The service supports correlation IDs via the `x-correlation-id` header. If provided, it will be included in the response headers.

## Health Check

To verify the service is running:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/commentdb |
| JWT_SECRET | Secret key for JWT tokens | (required) |
| NODE_ENV | Environment | development |
| LOG_LEVEL | Logging level | info |

