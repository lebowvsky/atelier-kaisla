# Frontend-Backend Integration Guide

This document provides a quick guide for the integration between the Nuxt 4 frontend and NestJS backend for the Atelier Kaisla e-commerce platform.

## Overview

The frontend now fetches real product data from the backend API instead of using mock data. This integration uses modern design patterns to ensure type safety, maintainability, and excellent user experience.

## What's Been Implemented

### 1. Backend API (NestJS)

**Location:** `/apps/backend/src/modules/products/`

**Key Endpoints:**
- `GET /api/products/category/:category` - Fetch products by category (wall-hanging or rug)
- `GET /api/products` - Fetch all products with optional filters
- `GET /api/products/:id` - Fetch single product by ID
- `GET /api/products/statistics` - Get product statistics

**Features:**
- TypeORM integration with PostgreSQL
- Data validation with class-validator
- Swagger API documentation
- CORS enabled for frontend/backoffice
- Comprehensive error handling

### 2. Frontend API Integration (Nuxt 4)

**Location:** `/apps/frontend/app/composables/useProducts.ts`

**Design Patterns Applied:**
1. **Adapter Pattern** - Converts backend Product to frontend Artwork interface
2. **Facade Pattern** - Simplifies API interactions through composable
3. **Decorator Pattern** - Adds loading/error state management

**Features:**
- Type-safe API calls with TypeScript
- SSR-compatible using `useFetch`
- Automatic caching (5-minute TTL)
- Loading and error state management
- Backward compatible with existing components

### 3. Updated Pages

**Files Modified:**
- `/apps/frontend/app/pages/wall-hanging.vue` - Now fetches wall hangings from API
- `/apps/frontend/app/pages/rugs.vue` - Now fetches rugs from API

**New Features:**
- Real-time product loading from backend
- Error handling with retry functionality
- Loading skeleton states
- Empty state messages

## File Structure

```
atelier-kaisla/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   │   └── product.entity.ts          # Product database entity
│   │   │   ├── modules/
│   │   │   │   └── products/
│   │   │   │       ├── products.controller.ts  # API endpoints
│   │   │   │       ├── products.service.ts     # Business logic
│   │   │   │       └── dto/                    # Data transfer objects
│   │   │   └── main.ts                         # CORS configuration
│   │   └── README.md                           # Updated with API docs
│   └── frontend/
│       ├── app/
│       │   ├── composables/
│       │   │   └── useProducts.ts              # API integration composable
│       │   ├── types/
│       │   │   ├── product.d.ts                # Backend Product types
│       │   │   └── artwork.d.ts                # Frontend Artwork types
│       │   └── pages/
│       │       ├── wall-hanging.vue            # Updated with API calls
│       │       └── rugs.vue                    # Updated with API calls
│       ├── nuxt.config.ts                      # Runtime config added
│       └── API-INTEGRATION.md                  # Detailed integration guide
├── .env.dev.example                            # Updated with NUXT_PUBLIC_API_URL
├── .env.prod.example                           # Updated with NUXT_PUBLIC_API_URL
└── FRONTEND-BACKEND-INTEGRATION.md             # This file
```

## Environment Configuration

### Development (Docker)

Create or update `.env` file:

```env
# Backend database
POSTGRES_HOST=postgres
POSTGRES_DB=atelier_kaisla_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Frontend API URL (Docker internal network)
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

### Development (Local - without Docker)

```env
# Backend database
POSTGRES_HOST=localhost
POSTGRES_DB=atelier_kaisla_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Frontend API URL (localhost)
NUXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Quick Start

### 1. Start the Development Environment

Using Docker (recommended):

```bash
# Initialize and start all services
make init
make dev-up-d

# View logs
make dev-logs
```

### 2. Seed the Database

Add sample products to the database:

```bash
# Access backend shell
make backend-shell

# Run seeder (inside container)
npm run seed

# Exit shell
exit
```

This creates 18 sample products:
- 8 wall hangings
- 10 rugs

### 3. Verify Backend API

Test the products endpoint:

```bash
# Check health
curl http://localhost:4000/api/health

# Get wall hangings
curl http://localhost:4000/api/products/category/wall-hanging

# Get rugs
curl http://localhost:4000/api/products/category/rug

# View API documentation
open http://localhost:4000/api/docs
```

### 4. Test Frontend

Open the frontend in your browser:

```
http://localhost:3002
```

Navigate to:
- **Wall Hanging Collection**: `http://localhost:3002/wall-hanging`
- **Rugs Collection**: `http://localhost:3002/rugs`

You should see:
- Loading skeleton on initial load
- Real products from the database
- Product images, prices, and details
- Error handling if backend is unavailable

## How It Works

### Data Flow

```
1. User visits /wall-hanging page
   ↓
2. Page component calls useProducts() composable
   ↓
3. Composable fetches data from backend API
   GET http://backend:4000/api/products/category/wall-hanging
   ↓
4. Backend queries PostgreSQL database
   ↓
5. Backend returns Product[] array
   ↓
6. Composable adapts Product → Artwork using Adapter pattern
   ↓
7. Reactive state updates automatically
   ↓
8. ArtworkList component renders products
   ↓
9. User sees product grid
```

### Type Safety

The integration is fully type-safe:

**Backend** (`Product` entity):
```typescript
interface Product {
  id: string
  name: string
  category: 'wall-hanging' | 'rug'
  price: number
  status: 'available' | 'sold' | 'draft'
  images?: string[]
  dimensions?: ProductDimensions
  materials?: string
  // ... more fields
}
```

**Frontend** (`Artwork` interface):
```typescript
interface Artwork {
  id: string
  title: string
  imageSrc: string
  dimensions: ArtworkDimensions
  material: string
  price?: number
  available?: boolean
  category?: 'wall-hanging' | 'rug'
  // ... more fields
}
```

**Adapter** bridges the two:
```typescript
function adaptProductToArtwork(product: Product): Artwork {
  return {
    id: product.id,
    title: product.name,
    imageSrc: product.images?.[0] || '/placeholder.jpg',
    // ... map all fields
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Backend starts successfully
- [ ] Database migrations run
- [ ] Seeder populates sample data
- [ ] Backend API endpoints respond
- [ ] Swagger docs accessible
- [ ] Frontend starts successfully
- [ ] Wall hanging page loads products
- [ ] Rugs page loads products
- [ ] Loading states work
- [ ] Error handling works (stop backend to test)
- [ ] Retry button works
- [ ] Product cards display correctly
- [ ] Prices show correctly
- [ ] No console errors

### API Testing

```bash
# Get all wall hangings
curl -X GET http://localhost:4000/api/products/category/wall-hanging

# Get all rugs
curl -X GET http://localhost:4000/api/products/category/rug

# Get products with filters
curl -X GET "http://localhost:4000/api/products?category=rug&status=available&limit=5"

# Get statistics
curl -X GET http://localhost:4000/api/products/statistics
```

### Frontend Testing

Open browser console and run:

```javascript
// Check if API URL is configured
console.log(useRuntimeConfig().public.apiUrl)

// Test composable
const { artworks, loading, error, fetchByCategory } = useProducts()
await fetchByCategory('wall-hanging')
console.log(artworks.value)
```

## Troubleshooting

### Problem: "Unable to load products"

**Cause:** Frontend can't connect to backend

**Solution:**
1. Check backend is running: `docker ps`
2. Verify backend logs: `make dev-logs-backend`
3. Test API directly: `curl http://localhost:4000/api/products/category/wall-hanging`
4. Check `.env` has correct `NUXT_PUBLIC_API_URL`

### Problem: Empty product list

**Cause:** Database has no products

**Solution:**
```bash
make backend-shell
npm run seed
exit
```

### Problem: CORS errors in browser console

**Cause:** Frontend URL not allowed by backend

**Solution:** Backend `main.ts` already includes:
- `http://localhost:3002` (local frontend)
- `http://frontend:3002` (Docker frontend)

If using different URL, add it to CORS configuration.

### Problem: TypeScript errors

**Cause:** Missing type definitions

**Solution:**
1. Ensure `/apps/frontend/app/types/product.d.ts` exists
2. Ensure `/apps/frontend/app/types/artwork.d.ts` exists
3. Restart TypeScript server in your IDE

### Problem: 404 Not Found on API calls

**Cause:** Wrong API URL or prefix

**Solution:** All endpoints must use `/api` prefix:
- ✅ `http://localhost:4000/api/products`
- ❌ `http://localhost:4000/products`

## Performance

### Caching

The frontend implements a 5-minute cache:
- First request fetches from API
- Subsequent requests (within 5 minutes) use cached data
- After 5 minutes, cache expires and refetches

To force refresh:
```typescript
const { refresh } = useProducts()
await refresh('wall-hanging')
```

### SSR Benefits

Using Nuxt's `useFetch` provides:
- Data fetched on server during initial page load
- Faster perceived load time
- Better SEO (search engines see content)
- No loading state on initial visit

## Next Steps

To extend the integration:

1. **Product Detail Pages**
   - Create `/products/[id].vue`
   - Use `fetchById()` from composable
   - Display full product information

2. **Search Functionality**
   - Add search input to pages
   - Use `fetchAll({ search: query })`
   - Debounce search input

3. **Filtering**
   - Add filter controls (price, material, size)
   - Update API calls with filter params
   - Persist filters in URL query params

4. **Shopping Cart**
   - Create cart store (Pinia)
   - Add to cart functionality
   - Cart persistence

5. **Real-time Updates**
   - WebSocket integration
   - Live inventory updates
   - Sold status notifications

## Documentation

For more details, see:

- **Frontend Integration**: `/apps/frontend/API-INTEGRATION.md`
- **Backend API**: `/apps/backend/README.md`
- **Backend Swagger Docs**: `http://localhost:4000/api/docs`
- **Project Architecture**: `/apps/frontend/ARCHITECTURE.md`
- **Docker Setup**: `/DOCKER-QUICKSTART.md`

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed documentation files
3. Check Docker logs: `make dev-logs`
4. Verify environment variables in `.env`
5. Test API endpoints directly with curl

## Summary

The frontend-backend integration is now complete with:

✅ Real-time data fetching from backend API
✅ Type-safe API calls with TypeScript
✅ Pattern-driven architecture (Adapter, Facade, Decorator)
✅ Loading and error state management
✅ SSR-compatible implementation
✅ Caching for performance
✅ CORS configured correctly
✅ Comprehensive error handling
✅ Backward compatible with existing components
✅ Full documentation

The wall-hanging and rugs pages now display real products from the database, with proper loading states, error handling, and retry functionality.
