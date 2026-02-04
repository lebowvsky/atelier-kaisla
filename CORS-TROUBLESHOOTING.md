# CORS Troubleshooting Guide

## Problem Fixed

The backoffice (`https://bokaisla.lebowvsky.com`) was unable to make requests to the API (`https://api.lebowvsky.com`) due to CORS (Cross-Origin Resource Sharing) errors blocking browser requests.

## Solution Implemented

The CORS configuration in `/apps/backend/src/main.ts` has been enhanced with:

### 1. Explicit HTTP Methods
```typescript
methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
```
This ensures preflight OPTIONS requests are properly handled.

### 2. Comprehensive Allowed Headers
```typescript
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'Accept',
  'Origin',
  'X-Requested-With',
  'Access-Control-Request-Method',
  'Access-Control-Request-Headers',
]
```
These headers are essential for modern web applications.

### 3. Origin Validation with Logging
```typescript
origin: (origin, callback) => {
  if (!origin) {
    return callback(null, true);
  }

  if (allowedOrigins.includes(origin)) {
    logger.debug(`✅ CORS allowed for origin: ${origin}`);
    callback(null, true);
  } else {
    logger.warn(`❌ CORS blocked for origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  }
}
```
This logs every CORS decision for easier debugging.

### 4. Preflight Request Optimization
```typescript
maxAge: 86400,              // Cache preflight for 24 hours
preflightContinue: false,   // Handle preflight at CORS middleware level
optionsSuccessStatus: 204,  // Return 204 for successful OPTIONS
```

## Deployment Steps

### 1. Rebuild Backend Container

```bash
# Stop production containers
make prod-down

# Rebuild backend with new CORS configuration
docker compose -f docker-compose.prod.yml build backend --no-cache

# Start production environment
make prod-up
```

### 2. Verify Environment Variables

Check that the backend container has the correct URLs:

```bash
docker exec atelier-kaisla-backend-prod env | grep URL
```

Expected output:
```
FRONTEND_URL=https://kaisla.lebowvsky.com
BACKOFFICE_URL=https://bokaisla.lebowvsky.com
```

### 3. Check CORS Logs

View backend logs to see CORS decisions:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
```

Look for:
- `🌐 CORS enabled for origins: ...` - Shows configured origins at startup
- `✅ CORS allowed for origin: https://bokaisla.lebowvsky.com` - Successful CORS validation
- `❌ CORS blocked for origin: ...` - Blocked requests (shouldn't appear for bokaisla)

## Testing CORS in Browser

### 1. Open Browser DevTools

1. Navigate to `https://bokaisla.lebowvsky.com`
2. Open DevTools (F12)
3. Go to Network tab
4. Try making an API request

### 2. Check Network Request

In the Network tab, look for the API request:

**Preflight Request (OPTIONS)**:
- Request Headers should include:
  ```
  Access-Control-Request-Method: POST (or GET, etc.)
  Access-Control-Request-Headers: content-type, authorization
  Origin: https://bokaisla.lebowvsky.com
  ```
- Response Headers should include:
  ```
  Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com
  Access-Control-Allow-Methods: GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, ...
  Access-Control-Allow-Credentials: true
  ```

**Actual Request (POST/GET/etc.)**:
- Request Headers should include:
  ```
  Origin: https://bokaisla.lebowvsky.com
  ```
- Response Headers should include:
  ```
  Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com
  Access-Control-Allow-Credentials: true
  ```

### 3. Common CORS Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No 'Access-Control-Allow-Origin' header` | Origin not in allowedOrigins list | Check environment variables |
| `CORS policy: The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*'` | Trying to use wildcard with credentials | Use explicit origins (already fixed) |
| `Method not allowed by CORS` | HTTP method not in methods list | Already includes all standard methods |
| `Header not allowed by CORS` | Custom header not in allowedHeaders | Add to allowedHeaders if needed |

## Environment Variable Configuration

Ensure the production environment has the correct URLs:

### In `docker-compose.prod.yml`:

```yaml
backend:
  environment:
    FRONTEND_URL: https://kaisla.lebowvsky.com
    BACKOFFICE_URL: https://bokaisla.lebowvsky.com
```

### In `.env` (if used):

```bash
FRONTEND_URL=https://kaisla.lebowvsky.com
BACKOFFICE_URL=https://bokaisla.lebowvsky.com
```

## Traefik Configuration

If using Traefik as reverse proxy, ensure it's not stripping CORS headers:

```yaml
labels:
  - "traefik.http.middlewares.cors.headers.accesscontrolalloworiginlist=https://kaisla.lebowvsky.com,https://bokaisla.lebowvsky.com"
  - "traefik.http.middlewares.cors.headers.accesscontrolallowmethods=GET,POST,PUT,DELETE,PATCH,OPTIONS"
  - "traefik.http.middlewares.cors.headers.accesscontrolallowcredentials=true"
  - "traefik.http.middlewares.cors.headers.accesscontrolallowheaders=Content-Type,Authorization"
  - "traefik.http.middlewares.cors.headers.accesscontrolmaxage=86400"
```

**Note**: With the NestJS CORS configuration, Traefik CORS middleware is NOT needed and can cause conflicts. Remove any Traefik CORS configuration if present.

## Testing with cURL

Test CORS from command line:

### Preflight Request (OPTIONS):

```bash
curl -X OPTIONS \
  -H "Origin: https://bokaisla.lebowvsky.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i \
  https://api.lebowvsky.com/api/products
```

Expected response includes:
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com
Access-Control-Allow-Methods: GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, ...
Access-Control-Allow-Credentials: true
```

### Actual Request (GET):

```bash
curl -X GET \
  -H "Origin: https://bokaisla.lebowvsky.com" \
  -i \
  https://api.lebowvsky.com/api/products
```

Expected response includes:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com
Access-Control-Allow-Credentials: true
```

## Additional Security Considerations

### 1. HTTPS Only in Production

Both origins use HTTPS, which is correct:
- `https://kaisla.lebowvsky.com`
- `https://bokaisla.lebowvsky.com`

### 2. Strict Origin Validation

The configuration validates origins strictly. To add a new origin:

1. Update `docker-compose.prod.yml`:
   ```yaml
   NEW_ORIGIN_URL: https://new-domain.com
   ```

2. Update `apps/backend/src/main.ts`:
   ```typescript
   const allowedOrigins = [
     // ... existing origins
     process.env.NEW_ORIGIN_URL,
   ].filter(Boolean);
   ```

### 3. Credentials and Cookies

`credentials: true` allows:
- Cookies
- Authorization headers
- TLS client certificates

This is necessary for authentication but requires explicit origins (no wildcards).

## Rollback Plan

If issues persist, rollback to previous version:

```bash
git revert HEAD
docker compose -f docker-compose.prod.yml build backend --no-cache
make prod-up
```

## Support

For additional debugging:

1. Check backend logs: `make prod-logs-backend`
2. Check browser console: F12 > Console tab
3. Check network requests: F12 > Network tab
4. Verify environment variables: `docker exec atelier-kaisla-backend-prod env`

## Related Files

- `/apps/backend/src/main.ts` - CORS configuration
- `/docker-compose.prod.yml` - Environment variables
- `/CORS-TROUBLESHOOTING.md` - This file
