# User Service

Microservice for user management and authentication in the Nimbus Blog platform.

## Features

- User registration and authentication
- JWT-based authentication
- Password hashing with bcrypt
- User CRUD operations
- Role-based access (user, admin)
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
MONGO_URI=mongodb://localhost:27017/userdb
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

Create initial admin and sample users:
```bash
npm run seed
```

This creates:
- Admin user: `admin@nimbus.com` / `admin123`
- Sample user: `user@nimbus.com` / `user123`

## API Endpoints

### Health Check
```
GET /health
```
Returns: `{ "status": "ok" }`

### Authentication

#### Register
```
POST /api/v1/auth/register
Body: {
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
```
POST /api/v1/auth/login
Body: {
  "email": "string",
  "password": "string"
}
```

### Users

#### Get All Users
```
GET /api/v1/users
```

#### Get User by ID
```
GET /api/v1/users/:id
```

#### Update User
```
PUT /api/v1/users/:id
Body: {
  "username": "string" (optional),
  "email": "string" (optional)
}
```

#### Delete User
```
DELETE /api/v1/users/:id
```

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
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/userdb |
| JWT_SECRET | Secret key for JWT tokens | (required) |
| NODE_ENV | Environment | development |
| LOG_LEVEL | Logging level | info |

