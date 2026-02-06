# API URL Fix - Quick Summary

## Problem
Backoffice tried to use `http://backend:4000/api` from browser → CORS error

## Solution
Smart URL detection based on context and environment

## URL Resolution Logic

```typescript
const getApiUrl = (): string => {
  if (import.meta.client) {
    // Browser
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl  // https://api.lebowvsky.com
    }
    return 'http://localhost:4000/api'  // Dev: hardcoded
  }
  // SSR
  return config.public.apiUrl || 'http://backend:4000/api'
}
```

## URLs Used

| Context | Environment | URL |
|---------|-------------|-----|
| Browser | Dev | `http://localhost:4000/api` |
| Browser | Prod | `https://api.lebowvsky.com` |
| SSR | Dev | `http://backend:4000/api` |
| SSR | Prod | `https://api.lebowvsky.com` |

## Files Modified

- ✅ `/apps/backoffice/app/composables/useAuth.ts`
- ✅ `/apps/backoffice/app/composables/useProducts.ts`
- ✅ `/.env` (added `NUXT_PUBLIC_API_URL`)

## Test

```bash
make dev-up-d
# Open http://localhost:3001
# Check console: should show http://localhost:4000/api
```

## Documentation

- `/QUICK-START-BACKOFFICE.md` - Quick start guide
- `/BACKOFFICE-API-URL-FIX.md` - Detailed explanation
- `/BACKOFFICE-API-URL-COMPLETE.md` - Complete modifications
- `/apps/backoffice/API-URL-DIAGRAM.md` - Architecture diagrams

## Status
✅ Fixed and tested
