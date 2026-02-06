# CORS Fix Summary

## Problem
The backoffice (`https://bokaisla.lebowvsky.com`) was unable to make requests to the API (`https://api.lebowvsky.com`) due to CORS errors. The browser was blocking all requests from the backoffice to the API.

## Root Cause
The CORS configuration in the backend was too basic:
- Missing explicit HTTP methods configuration
- Missing required headers configuration
- No logging for CORS decisions
- Suboptimal preflight request handling

## Solution

### 1. Enhanced CORS Configuration
Updated `/apps/backend/src/main.ts` with a comprehensive CORS setup:

```typescript
app.enableCors({
  // Dynamic origin validation with logging
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Explicit HTTP methods
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],

  // Required headers for modern web apps
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],

  // Exposed response headers
  exposedHeaders: ['Content-Length', 'Content-Type'],

  // Preflight optimization
  maxAge: 86400,              // 24 hours cache
  preflightContinue: false,   // Handle at middleware level
  optionsSuccessStatus: 204,  // Standard OPTIONS response
});
```

### 2. Added CORS Logging
The backend now logs all CORS decisions:
- Startup log shows all allowed origins
- Debug logs for allowed requests
- Warning logs for blocked requests

### 3. Created Testing Tools

#### `/test-cors.sh`
Automated CORS testing script that validates:
- Preflight OPTIONS requests
- Actual GET/POST requests
- Response headers
- Status codes
- Both authorized and unauthorized origins

Usage:
```bash
./test-cors.sh [API_URL] [BACKOFFICE_URL] [FRONTEND_URL]

# Example (production)
./test-cors.sh https://api.lebowvsky.com https://bokaisla.lebowvsky.com https://kaisla.lebowvsky.com

# Example (local)
./test-cors.sh http://localhost:4000 http://localhost:3001 http://localhost:3002
```

#### `/CORS-TROUBLESHOOTING.md`
Comprehensive troubleshooting guide with:
- Detailed explanation of the fix
- Deployment steps
- Browser testing instructions
- Common CORS errors and solutions
- cURL testing examples
- Environment variable verification

## Deployment

### 1. Rebuild Backend
```bash
make prod-down
docker compose -f docker-compose.prod.yml build backend --no-cache
make prod-up
```

### 2. Verify Environment Variables
```bash
docker exec atelier-kaisla-backend-prod env | grep URL
```

Should output:
```
FRONTEND_URL=https://kaisla.lebowvsky.com
BACKOFFICE_URL=https://bokaisla.lebowvsky.com
```

### 3. Check CORS Logs
```bash
docker compose -f docker-compose.prod.yml logs -f backend | grep CORS
```

Look for:
```
🌐 CORS enabled for origins: https://kaisla.lebowvsky.com, https://bokaisla.lebowvsky.com
✅ CORS allowed for origin: https://bokaisla.lebowvsky.com
```

### 4. Test with Script
```bash
./test-cors.sh
```

## What Changed

### Files Modified
- `/apps/backend/src/main.ts` - Enhanced CORS configuration with logging

### Files Created
- `/CORS-FIX-SUMMARY.md` - This file (fix overview)
- `/CORS-TROUBLESHOOTING.md` - Detailed troubleshooting guide
- `/test-cors.sh` - Automated CORS testing script

## Verification

### Browser Test
1. Open `https://bokaisla.lebowvsky.com`
2. Open DevTools (F12) > Network tab
3. Make an API request
4. Verify no CORS errors in console
5. Check response headers include:
   - `Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com`
   - `Access-Control-Allow-Credentials: true`

### cURL Test
```bash
# Test preflight
curl -X OPTIONS \
  -H "Origin: https://bokaisla.lebowvsky.com" \
  -H "Access-Control-Request-Method: POST" \
  -i https://api.lebowvsky.com/api/products

# Test actual request
curl -X GET \
  -H "Origin: https://bokaisla.lebowvsky.com" \
  -i https://api.lebowvsky.com/api/products
```

Both should return `Access-Control-Allow-Origin: https://bokaisla.lebowvsky.com`

## Benefits

1. **Proper CORS Support**
   - Handles preflight OPTIONS requests correctly
   - Supports all standard HTTP methods
   - Includes all necessary headers

2. **Better Debugging**
   - Logs show which origins are allowed
   - Warnings for blocked requests
   - Easy to identify CORS issues

3. **Production Ready**
   - Optimized preflight caching (24h)
   - Proper status codes (204 for OPTIONS)
   - Secure credential handling

4. **Testing Tools**
   - Automated script for quick verification
   - Comprehensive troubleshooting guide
   - Clear deployment instructions

## Security Notes

- Origins are explicitly validated (no wildcards)
- Credentials require explicit origins (enhanced security)
- Unauthorized origins are logged and blocked
- HTTPS-only in production
- No sensitive data in CORS errors

## Future Improvements

If additional origins need access:

1. Add environment variable in `docker-compose.prod.yml`:
   ```yaml
   NEW_ORIGIN_URL: https://new-domain.com
   ```

2. Add to allowed origins in `main.ts`:
   ```typescript
   const allowedOrigins = [
     // ... existing origins
     process.env.NEW_ORIGIN_URL,
   ].filter(Boolean);
   ```

3. Rebuild and redeploy

## Related Documentation

- `/CORS-TROUBLESHOOTING.md` - Detailed troubleshooting
- `/apps/backend/src/main.ts` - CORS configuration
- `/docker-compose.prod.yml` - Environment variables
- `/test-cors.sh` - Testing script

## Support

For issues:
1. Check backend logs: `make prod-logs-backend`
2. Run test script: `./test-cors.sh`
3. Review `/CORS-TROUBLESHOOTING.md`
4. Check browser DevTools > Console & Network tabs
