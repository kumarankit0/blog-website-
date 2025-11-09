# Nimbus Blog Frontend

A vanilla JavaScript single-page application for the Nimbus Blog platform.

## Features

- Dark-themed modern UI
- Responsive design (sidebar on desktop, bottom nav on mobile)
- JWT authentication with localStorage
- Optimistic UI updates
- Client-side form validation
- Pagination support
- Smooth transitions and animations
- Toast notifications

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── css/
│   └── styles.css     # Dark theme styles
└── js/
    ├── api.js         # API client with correlation ID support
    ├── auth.js        # Authentication management
    ├── ui.js          # UI utilities and helpers
    └── app.js         # Main application logic and routing
```

## Serving the Frontend

### Option 1: Serve via API Gateway (Recommended)

Configure your API Gateway to serve static files from the `frontend` directory.

**For Express.js API Gateway:**

```javascript
// In api-gateway/src/index.js
const path = require('path');
const express = require('express');

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// API routes should come before the catch-all
app.use('/api', apiRoutes);

// Catch-all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});
```

Then access the application at: `http://localhost:8080`

### Option 2: Simple Static Server

Using Python (if installed):

```bash
cd frontend
python -m http.server 8000
```

Using Node.js `http-server`:

```bash
npm install -g http-server
cd frontend
http-server -p 8000 -c-1
```

Using PHP (if installed):

```bash
cd frontend
php -S localhost:8000
```

Then access at: `http://localhost:8000`

**Note:** When using a separate static server, you'll need to configure CORS in your API Gateway to allow requests from the frontend origin.

### Option 3: Docker with Nginx

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Update `docker-compose.yml` to build and serve the frontend.

## Configuration

The frontend makes API calls to relative paths (e.g., `/api/v1/auth/login`). Ensure:

1. **API Gateway is accessible** at the same origin when serving statically, OR
2. **CORS is configured** in the API Gateway to allow requests from your frontend origin
3. **JWT_SECRET matches** between frontend token validation and backend services

## Environment Setup

No build step required! The frontend is pure vanilla JavaScript and can be served directly.

For production, you may want to:
- Minify CSS and JavaScript
- Enable gzip compression
- Set appropriate cache headers
- Use a CDN for static assets

## API Integration

The frontend expects the API Gateway to be available at the same origin or configured with CORS. All API calls include:

- `Authorization: Bearer <token>` header when authenticated
- `x-correlation-id` header for request tracking
- JSON request/response format

## Pages/Views

- **Login** - User authentication
- **Register** - New user registration
- **Feed** - Paginated list of all posts
- **Post Detail** - View post with comments and add comment form
- **Create Post** - Create new blog post (authenticated only)
- **Edit Post** - Edit existing post (author only)
- **Profile** - View user's own posts (authenticated only)

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development

1. Serve the frontend using one of the methods above
2. Ensure API Gateway is running and accessible
3. Open browser and navigate to the frontend URL
4. Use browser DevTools for debugging

## Troubleshooting

### CORS Errors

If you see CORS errors, ensure your API Gateway has CORS enabled:

```javascript
app.use(cors({
  origin: 'http://localhost:8000', // Your frontend URL
  credentials: true
}));
```

### Authentication Issues

- Check that JWT tokens are being stored in localStorage
- Verify `JWT_SECRET` matches across all services
- Check browser console for token-related errors

### API Connection Issues

- Verify API Gateway is running
- Check network tab for failed requests
- Ensure correlation IDs are being sent/received

