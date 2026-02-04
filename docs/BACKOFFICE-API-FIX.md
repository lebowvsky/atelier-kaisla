# Backoffice API Network Error - Fix Applied

## Problem

The backoffice was experiencing a network error when trying to fetch products from the backend API:

```
Error Loading Products
[GET] "http://backend:4000/api/products": <no response>
NetworkError when attempting to fetch resource.
```

## Root Cause

The issue was that the backoffice's `useProducts.ts` composable was using a hardcoded `apiUrl` value from the runtime configuration, which was set to `http://backend:4000/api`.

This works fine for **Server-Side Rendering (SSR)** because the Nuxt server runs inside Docker and can resolve the `backend` hostname through the Docker network.

However, when the code runs in the **browser (client-side)**, the browser cannot resolve the `backend` hostname because it's not part of the Docker network. The browser needs to use `http://localhost:4000/api` instead.

## Solution Applied

Implemented environment-aware API URL resolution in `/apps/backoffice/app/composables/useProducts.ts`:

### 1. Added `getApiUrl()` Function

```typescript
/**
 * Get the correct API URL based on environment (server vs client)
 * Pattern: Adapter Pattern for environment-specific configuration
 *
 * In Docker:
 * - Server (SSR): http://backend:4000/api (internal Docker network)
 * - Client (browser): http://localhost:4000/api (host machine)
 */
const getApiUrl = (): string => {
  if (import.meta.server) {
    // Server-side (SSR): use internal Docker network address
    return config.public.apiUrl || 'http://backend:4000/api'
  } else {
    // Client-side (browser): use localhost for browser requests
    return 'http://localhost:4000/api'
  }
}
```

### 2. Updated All API Calls

Replaced all hardcoded `apiUrl` references with dynamic `getApiUrl()` calls:

- `fetchProducts()` - GET /products with query params
- `fetchProductById()` - GET /products/:id
- `fetchByCategory()` - GET /products/category/:category
- `createProduct()` - POST /products
- `updateProduct()` - PATCH /products/:id
- `deleteProduct()` - DELETE /products/:id
- `fetchStatistics()` - GET /products/statistics

### 3. Added Debug Logging

Added console logs to track which URL is being used and whether the request is server or client-side:

```typescript
console.log(`[useProducts] Fetching from: ${url} (${import.meta.server ? 'server' : 'client'})`)
```

## How It Works

1. **SSR (Server-Side)**
   - When Nuxt renders the page on the server (inside Docker)
   - `import.meta.server` is `true`
   - Uses `http://backend:4000/api` (Docker network)
   - Backend container is directly accessible

2. **Client-Side (Browser)**
   - When the page is hydrated or client navigates
   - `import.meta.server` is `false`
   - Uses `http://localhost:4000/api` (host machine)
   - Browser connects to backend through Docker port mapping

## Environment Configuration

Updated `.env.dev.example` with clearer documentation:

```bash
# Configuration Frontend & Backoffice (Nuxt)
# This URL is used for SSR (server-side rendering) only
# When running in Docker, use: http://backend:4000/api (internal Docker network)
# When running locally, use: http://localhost:4000/api
# Note: Client-side requests automatically use http://localhost:4000/api
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

## Testing

To verify the fix is working:

1. **Check Docker containers are running:**
   ```bash
   make dev-logs-backoffice
   ```

2. **Open backoffice in browser:**
   ```
   http://localhost:3001
   ```

3. **Navigate to Products page**

4. **Check browser console for logs:**
   ```
   [useProducts] Fetching from: http://localhost:4000/api/products (client)
   ```

5. **Check server logs for SSR:**
   ```bash
   docker compose -f docker-compose.dev.yml logs backoffice
   ```
   Look for:
   ```
   [useProducts] Fetching from: http://backend:4000/api/products (server)
   ```

## Related Files Modified

- `/apps/backoffice/app/composables/useProducts.ts` - Main fix implementation
- `/.env.dev.example` - Updated documentation

## Pattern Applied

**Adapter Pattern** - Environment-specific configuration adapter
- Adapts the API URL based on the execution context (server vs client)
- Ensures correct network resolution in different environments
- Maintains type safety and clean API

## Notes

This is the same fix that was previously applied to the frontend's `useProducts.ts` composable. Both frontend and backoffice now use the same pattern for environment-aware API URL resolution.
