# Frontend API Integration

This document explains how the frontend integrates with the backend API to fetch and display products.

## Architecture Overview

The frontend uses a **pattern-driven approach** to integrate with the backend API:

1. **Adapter Pattern**: Converts backend `Product` entities to frontend `Artwork` interfaces
2. **Facade Pattern**: Simplifies API interactions through the `useProducts` composable
3. **Observer Pattern**: Vue's reactivity system propagates data changes to components

## Files Structure

```
apps/frontend/
├── app/
│   ├── composables/
│   │   ├── useProducts.ts          # API integration composable (Facade + Adapter)
│   │   └── useArtworkData.ts       # Mock data (for development fallback)
│   ├── types/
│   │   ├── product.d.ts            # Backend Product entity types
│   │   └── artwork.d.ts            # Frontend Artwork interface types
│   └── pages/
│       ├── wall-hanging.vue        # Wall hanging collection page
│       └── rugs.vue                # Rugs collection page
├── nuxt.config.ts                  # Runtime config for API URL
└── API-INTEGRATION.md              # This file
```

## Design Patterns Applied

### 1. Adapter Pattern (`adaptProductToArtwork`)

**Purpose**: Convert backend Product entity to frontend Artwork interface

**Location**: `/apps/frontend/app/composables/useProducts.ts`

```typescript
export function adaptProductToArtwork(product: Product): Artwork {
  return {
    id: product.id,
    title: product.name,
    imageSrc: product.images?.[0] || `/placeholder-${product.category}.jpg`,
    imageAlt: `${product.name} - Handcrafted ${product.category}`,
    dimensions: product.dimensions ? {
      width: product.dimensions.width,
      height: product.dimensions.height,
      unit: product.dimensions.unit === 'inch' ? 'in' : 'cm',
    } : { width: 0, height: 0, unit: 'cm' },
    material: product.materials || 'Natural materials',
    description: product.description || '',
    price: Number(product.price),
    available: product.status === 'available' && product.stockQuantity > 0,
    category: product.category,
    detailUrl: `/${product.category}/${product.id}`,
  }
}
```

**Why?** This allows existing UI components (like `ArtworkList` and `ArtworkCard`) to work seamlessly with real backend data without requiring changes to their interfaces.

### 2. Facade Pattern (`useProducts`)

**Purpose**: Simplify complex API interactions into easy-to-use methods

**Location**: `/apps/frontend/app/composables/useProducts.ts`

```typescript
export function useProducts() {
  const { artworks, loading, error, fetchByCategory, refresh } = useProducts()

  // Simple API:
  await fetchByCategory('wall-hanging') // Fetch wall hangings
  await fetchByCategory('rug')          // Fetch rugs
}
```

**Features**:
- Automatic loading state management
- Error handling
- SSR-compatible using Nuxt's `useFetch`
- Caching with 5-minute TTL
- Type-safe API calls

### 3. Decorator Pattern (Implicit)

**Purpose**: Add loading and error state management to async operations

The composable wraps API calls with loading and error state management, effectively decorating the fetch operations with additional functionality.

## API Endpoints Used

### Backend Endpoints

The backend runs on port **4000** and provides these endpoints:

#### Get Products by Category
```
GET /api/products/category/:category
```

**Parameters**:
- `category`: `'wall-hanging'` or `'rug'`

**Response**:
```typescript
Product[] // Array of products matching the category with status 'available'
```

**Example**:
```bash
curl http://localhost:4000/api/products/category/wall-hanging
```

#### Get All Products (with filters)
```
GET /api/products?category=&status=&search=&page=&limit=
```

**Query Parameters**:
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `search` (optional): Search by product name
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response**:
```typescript
{
  data: Product[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}
```

#### Get Product by ID
```
GET /api/products/:id
```

**Parameters**:
- `id`: Product UUID

**Response**:
```typescript
Product
```

## Environment Configuration

### Development (Docker)

In Docker, the frontend needs to communicate with the backend container:

```env
# .env
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

The hostname `backend` is resolved by Docker's internal DNS to the backend container.

### Development (Local)

When running locally without Docker:

```env
# .env
NUXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Production

In production Docker environment:

```env
# .env
NUXT_PUBLIC_API_URL=http://backend:4000/api
```

Or use your production API domain:

```env
NUXT_PUBLIC_API_URL=https://api.atelier-kaisla.com
```

## Usage Examples

### Fetching Products in a Page Component

**Example**: `/apps/frontend/app/pages/wall-hanging.vue`

```vue
<script setup lang="ts">
import type { ArtworkCardConfig } from '~/types/artwork'

// Pattern: Facade Pattern - Use products API composable
const { artworks, loading, error, fetchByCategory } = useProducts()

// Card configuration
const cardConfig: ArtworkCardConfig = {
  showPrice: true,
  showAvailability: true,
  clickable: true,
  imageAspectRatio: '4/3',
  enableHover: true,
}

// Fetch products on mount
onMounted(async () => {
  await fetchByCategory('wall-hanging')
})
</script>

<template>
  <div class="wall-hanging-page">
    <!-- Error State -->
    <div v-if="error" class="error-message" role="alert">
      <p>Unable to load wall hangings. Please try again later.</p>
      <button @click="fetchByCategory('wall-hanging')">Retry</button>
    </div>

    <!-- Product Grid -->
    <ArtworkList
      v-else
      :artworks="artworks"
      :loading="loading"
      :card-config="cardConfig"
      grid-layout="default"
      empty-message="No wall hangings are currently available."
      :skeleton-count="6"
    />
  </div>
</template>
```

### Fetching a Single Product

```typescript
const { fetchById } = useProducts()

const product = await fetchById('uuid-here')
if (product) {
  console.log(product.title)
}
```

### Fetching with Filters

```typescript
const { fetchAll } = useProducts()

await fetchAll({
  category: 'rug',
  status: 'available',
  search: 'wool',
  page: 1,
  limit: 10
})
```

## Type Safety

All API interactions are fully type-safe with TypeScript:

### Product Types

**Backend Entity** (`/apps/frontend/app/types/product.d.ts`):
```typescript
export interface Product {
  id: string
  name: string
  description?: string
  category: 'wall-hanging' | 'rug'
  price: number
  status: 'available' | 'sold' | 'draft'
  stockQuantity: number
  images?: string[]
  dimensions?: ProductDimensions
  materials?: string
  createdAt: string
  updatedAt: string
}
```

### Artwork Types

**Frontend Interface** (`/apps/frontend/app/types/artwork.d.ts`):
```typescript
export interface Artwork {
  id: string
  title: string
  imageSrc: string
  imageAlt: string
  dimensions: ArtworkDimensions
  material: string
  description: string
  price?: number
  available?: boolean
  category?: 'wall-hanging' | 'rug'
  detailUrl?: string
}
```

## Error Handling

The composable handles errors gracefully:

1. **Network Errors**: Caught and stored in `error` ref
2. **API Errors**: HTTP error responses are caught
3. **Empty Results**: Returns empty array instead of throwing
4. **User Feedback**: Pages display error messages with retry button

```typescript
const { error, fetchByCategory } = useProducts()

if (error.value) {
  // Show error UI
  console.error('API Error:', error.value.message)
}
```

## Loading States

Loading states are managed automatically:

```typescript
const { loading, artworks, fetchByCategory } = useProducts()

// loading.value is true during fetch
await fetchByCategory('wall-hanging')
// loading.value is false after fetch completes
```

Components can use this to show skeleton loaders:

```vue
<ArtworkList
  :artworks="artworks"
  :loading="loading"
  :skeleton-count="6"
/>
```

## Caching Strategy

The composable implements a **5-minute cache** for API responses:

```typescript
getCachedData: (key) => {
  const cached = useNuxtData(key)
  if (!cached.data.value) return null

  const timestamp = cached.data.value._timestamp || 0
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000

  if (now - timestamp > fiveMinutes) return null

  return cached.data.value
}
```

**Benefits**:
- Reduces unnecessary API calls
- Improves performance
- Better user experience (instant page navigation)

To force a refresh:

```typescript
const { refresh } = useProducts()
await refresh('wall-hanging')
```

## SSR Compatibility

The composable uses Nuxt's `useFetch` which is **SSR-compatible**:

- Data is fetched on the server during SSR
- Hydrated on the client without refetching
- Provides better SEO and initial load performance

## Testing

### Test the API Connection

1. Start the backend:
```bash
make dev-up
```

2. Check backend health:
```bash
curl http://localhost:4000/api/health
```

3. Test products endpoint:
```bash
curl http://localhost:4000/api/products/category/wall-hanging
```

### Expected Backend Response

```json
[
  {
    "id": "uuid-string",
    "name": "Organic Waves",
    "description": "A flowing composition...",
    "category": "wall-hanging",
    "price": "450.00",
    "status": "available",
    "stockQuantity": 1,
    "images": ["/images/product1.jpg"],
    "dimensions": {
      "width": 60,
      "height": 80,
      "unit": "cm"
    },
    "materials": "100% wool on cotton warp",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

## Migration from Mock Data

The integration maintains **backward compatibility** with the existing mock data structure:

### Before (Mock Data)
```typescript
const { wallHangings } = useArtworkData()
```

### After (Real API)
```typescript
const { artworks, fetchByCategory } = useProducts()
await fetchByCategory('wall-hanging')
```

The `Artwork` interface remains unchanged, so existing components work without modifications.

## Troubleshooting

### Frontend can't connect to backend

**Symptom**: Error message "Unable to load products"

**Solution**:
1. Check backend is running: `docker ps`
2. Verify API URL in `.env`: `NUXT_PUBLIC_API_URL=http://backend:4000/api`
3. Test backend directly: `curl http://localhost:4000/api/products/category/wall-hanging`

### No products returned

**Symptom**: Empty state message shown

**Solution**:
1. Check database has products with `status = 'available'`
2. Run database migrations: `make backend-shell` → `npm run migration:run`
3. Seed database with test data

### CORS errors

**Symptom**: Browser console shows CORS error

**Solution**: Backend needs CORS configuration in `apps/backend/src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3002', 'http://frontend:3002'],
  credentials: true,
})
```

### Type errors in pages

**Symptom**: TypeScript errors about missing properties

**Solution**: Ensure both type files are present:
- `/apps/frontend/app/types/product.d.ts`
- `/apps/frontend/app/types/artwork.d.ts`

## Performance Optimization

### Current Optimizations

1. **Caching**: 5-minute cache reduces API calls
2. **SSR**: Data fetched on server, hydrated on client
3. **Lazy Loading**: Components use lazy loading for images
4. **Keyed Requests**: Nuxt caches by unique keys

### Future Optimizations

1. **Pagination**: Implement infinite scroll for large catalogs
2. **Image Optimization**: Use Nuxt Image for responsive images
3. **Service Worker**: Cache API responses offline
4. **WebSocket**: Real-time product updates

## Security Considerations

1. **API URL**: Stored in environment variables, not hardcoded
2. **Input Validation**: Backend validates all inputs with DTOs
3. **XSS Prevention**: Vue automatically escapes template content
4. **HTTPS**: Use HTTPS in production for API calls

## Next Steps

To extend the integration:

1. **Add Product Detail Pages**: Use `fetchById` for single product views
2. **Implement Search**: Use `fetchAll` with search parameter
3. **Add Filtering**: Allow users to filter by price, material, etc.
4. **Shopping Cart**: Integrate with cart functionality
5. **Favorites**: Let users save favorite products
6. **Real-time Updates**: WebSocket for live inventory updates

## Support

For questions or issues with the API integration:

1. Check this documentation
2. Review backend API documentation: `/apps/backend/README.md`
3. Check backend Swagger docs: `http://localhost:4000/api/docs`
4. Examine composable source: `/apps/frontend/app/composables/useProducts.ts`
