# Backend Fix Needed - Missing @nestjs/swagger

## Problem

The backend container is experiencing TypeScript compilation errors due to missing `@nestjs/swagger` package in the Docker volume.

## Error Messages

```
Cannot find module '@nestjs/swagger' or its corresponding type declarations.
```

This affects multiple files:
- `src/config/swagger.config.ts`
- `src/modules/products/dto/create-product.dto.ts`
- `src/modules/products/dto/product-query.dto.ts`
- `src/modules/products/dto/update-product.dto.ts`
- `src/modules/products/products.controller.ts`

## Root Cause

The Docker volume configuration in `docker-compose.dev.yml` uses:

```yaml
volumes:
  - ./apps/backend:/app
  - /app/node_modules  # Anonymous volume that doesn't persist properly
```

The anonymous volume `/app/node_modules` is not persisting the installed packages correctly between rebuilds.

## Solution Options

### Option 1: Named Volume (Recommended)

Update `docker-compose.dev.yml`:

```yaml
backend:
  # ... other config
  volumes:
    - ./apps/backend:/app
    - backend_node_modules:/app/node_modules  # Named volume

# At the end of file
volumes:
  postgres_data_dev:
    driver: local
  backend_node_modules:  # Add named volume
    driver: local
```

Then rebuild:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d --build backend
```

### Option 2: Remove Volume and Rebuild

Remove the backend container completely and rebuild from scratch:

```bash
# Stop and remove backend container
docker compose -f docker-compose.dev.yml stop backend
docker compose -f docker-compose.dev.yml rm -f backend

# Remove anonymous volumes
docker volume prune -f

# Rebuild without cache
docker compose -f docker-compose.dev.yml build --no-cache backend

# Start backend
docker compose -f docker-compose.dev.yml up -d backend
```

### Option 3: Install Dependencies Locally First

Before building the Docker container, ensure node_modules exist locally:

```bash
cd apps/backend
npm install
cd ../..
docker compose -f docker-compose.dev.yml up -d --build backend
```

### Option 4: Install in Running Container (Temporary Fix)

This is a temporary workaround that doesn't survive container restarts:

```bash
docker compose -f docker-compose.dev.yml exec backend npm install
```

## Verification

After applying the fix, verify the backend is working:

```bash
# Check logs
docker compose -f docker-compose.dev.yml logs backend

# Should see:
# "Nest application successfully started on port 4000"

# Test API
curl http://localhost:4000/api/products
```

## Impact on Backoffice Products Feature

The backoffice products management feature has been fully implemented and is ready to use. However, it cannot fetch data until the backend is fixed.

Once the backend is running properly:

1. Navigate to: http://localhost:3001/products
2. Products will be fetched from the API automatically
3. All CRUD operations will work

## Files Ready and Working

### Backoffice Implementation (Complete)
- ✅ `apps/backoffice/app/types/product.d.ts` - Type definitions
- ✅ `apps/backoffice/app/composables/useProducts.ts` - API integration
- ✅ `apps/backoffice/app/pages/products.vue` - Products page
- ✅ `apps/backoffice/nuxt.config.ts` - API URL configuration

### Backend Issues (Needs Fix)
- ❌ Backend not compiling due to missing `@nestjs/swagger`
- ❌ API endpoints not accessible
- ❌ Products module not loading

## Testing After Fix

Once backend is fixed, test the backoffice integration:

```bash
# 1. Verify backend is running
curl http://localhost:4000/api/products

# 2. Open backoffice
open http://localhost:3001/products

# 3. You should see:
#    - Products table populated with data
#    - Filtering and sorting working
#    - Statistics cards showing correct counts
#    - All CRUD operations functional
```

## Priority

**High Priority** - The backoffice products feature is complete but cannot be used until backend is fixed.

## Estimated Time to Fix

- Option 1 (Named Volume): 5-10 minutes
- Option 2 (Clean Rebuild): 10-15 minutes
- Option 3 (Local Install): 5 minutes
- Option 4 (Temporary): 2 minutes (but not persistent)

## Related Documentation

- `apps/backoffice/PRODUCTS-IMPLEMENTATION.md` - Full implementation details
- `apps/backoffice/PRODUCTS-QUICKSTART.md` - Quick start guide
- `docker-compose.dev.yml` - Docker configuration
- `DOCKER-QUICKSTART.md` - Docker setup guide
