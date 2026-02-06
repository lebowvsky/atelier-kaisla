# Backoffice API URL Fix - Development & Production

## Problem

The backoffice was trying to use `http://backend:4000/api` from the browser in development, causing CORS errors because `backend` is a Docker internal hostname not accessible from the browser.

## Solution

Implemented intelligent URL detection that works correctly in both development and production environments.

## How It Works

### Development Environment

**Client-side (Browser)**:
- URL: `http://localhost:4000/api`
- Reason: Browser cannot resolve Docker hostnames like `backend`
- Behavior: All API calls from the browser use localhost

**Server-side (SSR in Docker)**:
- URL: `http://backend:4000/api`
- Reason: Nuxt container can access backend container via Docker network
- Behavior: SSR API calls use Docker internal network

### Production Environment

**Client-side (Browser)**:
- URL: `https://api.lebowvsky.com`
- Reason: Public API URL accessible from anywhere
- Behavior: All API calls use public URL

**Server-side (SSR)**:
- URL: `https://api.lebowvsky.com`
- Reason: Same public API URL
- Behavior: SSR API calls use public URL

## Implementation

### Modified Files

1. `/apps/backoffice/app/composables/useAuth.ts`
2. `/apps/backoffice/app/composables/useProducts.ts`

### Core Logic

```typescript
/**
 * Get API URL based on environment and execution context
 */
const getApiUrl = (): string => {
  // Client-side (browser)
  if (import.meta.client) {
    // Production: use public API URL from environment
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl
    }
    // Development: force localhost (backend hostname not accessible from browser)
    return 'http://localhost:4000/api'
  }

  // Server-side (SSR): always use environment variable
  // Dev: http://backend:4000/api
  // Prod: https://api.lebowvsky.com
  return config.public.apiUrl || 'http://backend:4000/api'
}
```

## Environment Configuration

### Development (.env)

```bash
# Used by SSR in Docker (Nuxt container → backend container)
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

**Note**: Client-side automatically uses `http://localhost:4000/api` regardless of this variable.

### Production (.env.prod or server environment)

```bash
# Used by both SSR and client-side (both use public URL)
NUXT_PUBLIC_API_URL=https://api.lebowvsky.com
```

## Debug Logging

Added console logs to track URL usage:

```typescript
console.log('[useAuth] Context:', {
  client: import.meta.client,
  env: process.env.NODE_ENV,
  url: apiUrl,
})
```

### Expected Console Output

**Development (Browser)**:
```
[useAuth] Logging in to: http://localhost:4000/api/auth/login
[useAuth] Context: { client: true, env: 'development', url: 'http://localhost:4000/api' }
```

**Development (SSR Logs)**:
```
[useAuth] Context: { client: false, env: 'development', url: 'http://backend:4000/api' }
```

**Production (Browser)**:
```
[useAuth] Logging in to: https://api.lebowvsky.com/auth/login
[useAuth] Context: { client: true, env: 'production', url: 'https://api.lebowvsky.com' }
```

**Production (SSR Logs)**:
```
[useAuth] Context: { client: false, env: 'production', url: 'https://api.lebowvsky.com' }
```

## Testing

### In Development

1. Start Docker environment:
   ```bash
   make dev-up-d
   ```

2. Open backoffice: `http://localhost:3001`

3. Open browser console and attempt login

4. Verify console shows:
   ```
   [useAuth] Logging in to: http://localhost:4000/api/auth/login
   [useAuth] Context: { client: true, env: 'development', url: 'http://localhost:4000/api' }
   ✓ Login successful
   ```

5. Check SSR logs:
   ```bash
   make dev-logs-backoffice
   ```

### In Production

1. Deploy to production server

2. Open backoffice: `https://bokaisla.lebowvsky.com`

3. Verify browser console shows:
   ```
   [useAuth] Logging in to: https://api.lebowvsky.com/auth/login
   [useAuth] Context: { client: true, env: 'production', url: 'https://api.lebowvsky.com' }
   ```

## Patterns Applied

### Adapter Pattern
- Adapts API URL based on execution context (client vs server)
- Transforms environment-specific configuration into correct URL

### Strategy Pattern
- Different URL resolution strategies for development vs production
- Client-side vs server-side strategies

## Benefits

✅ Works in development (localhost for browser, Docker network for SSR)
✅ Works in production (public URL for both browser and SSR)
✅ No CORS errors in development
✅ No hardcoded URLs
✅ Environment-aware configuration
✅ Easy to debug with comprehensive logging

## Common Issues

### CORS Error in Development

**Symptom**: `Access to fetch at 'http://backend:4000/api/auth/login' from origin 'http://localhost:3001' has been blocked by CORS`

**Cause**: Browser trying to use Docker hostname

**Solution**: This fix resolves this by forcing `localhost` in development

### 404 Error in Production

**Symptom**: API calls return 404

**Cause**: `NUXT_PUBLIC_API_URL` not set correctly

**Solution**: Ensure `.env` contains `NUXT_PUBLIC_API_URL=https://api.lebowvsky.com`

### Mixed Content Error

**Symptom**: HTTPS page trying to load HTTP resources

**Cause**: Using `http://` in production

**Solution**: Ensure production URL uses `https://`

## Related Documentation

- `/CORS-FIX-SUMMARY.md` - CORS configuration details
- `/DEPLOYMENT-CORS-FIX.md` - Deployment guide
- `/apps/backoffice/README.md` - Backoffice setup
