# Products Management Implementation

## Overview

This document describes the implementation of the products management feature in the Atelier Kaisla backoffice application.

## Architecture

The implementation follows functional programming patterns and Vue 3 Composition API best practices:

### Design Patterns Applied

1. **Facade Pattern**: `useProducts` composable provides a simplified interface for complex API operations
2. **Adapter Pattern**: Transforms backend API responses to frontend-compatible format
3. **Decorator Pattern**: Wraps async operations with loading/error state management
4. **Strategy Pattern**: Multiple filtering and sorting strategies for products
5. **Observer Pattern**: Reactive state updates from API responses

## File Structure

```
apps/backoffice/
├── app/
│   ├── types/
│   │   └── product.d.ts              # TypeScript type definitions
│   ├── composables/
│   │   └── useProducts.ts            # Product management composable
│   └── pages/
│       └── products.vue              # Products management page
```

## Type Definitions

### Location
`app/types/product.d.ts`

### Key Types
- `Product`: Complete product entity (aligned with backend)
- `CreateProductDto`: DTO for creating products
- `UpdateProductDto`: DTO for updating products (all fields optional)
- `ProductQueryParams`: Query parameters for filtering
- `ProductStatistics`: Product statistics structure

All types are aligned with the backend NestJS entities and DTOs.

## Composable: useProducts

### Location
`app/composables/useProducts.ts`

### Features

#### State Management (Reactive)
- `products`: List of all products
- `currentProduct`: Currently selected product
- `statistics`: Product statistics
- `loading`: Loading state indicator
- `error`: Error state with detailed information

#### Core Methods

```typescript
// Fetch all products with optional filters
const { products } = useProducts()
await fetchProducts({ category: 'wall-hanging', status: 'available' })

// Fetch single product by ID
await fetchProductById('uuid-here')

// Fetch by category
await fetchByCategory('rug')

// Create new product
await createProduct({
  name: 'Beautiful Wall Hanging',
  category: 'wall-hanging',
  price: 149.99
})

// Update product
await updateProduct('uuid-here', { price: 129.99 })

// Delete product
await deleteProduct('uuid-here')

// Fetch statistics
await fetchStatistics()
```

#### Helper Composable: useProductFormatting

Pure utility functions for formatting:
- `formatPrice()`: Currency formatting
- `formatCategory()`: Category label formatting
- `formatStatus()`: Status label formatting
- `getStatusColor()`: Status badge color classes
- `getStockColor()`: Stock quantity color classes
- `formatDimensions()`: Dimension formatting

### Error Handling

All API calls are wrapped with automatic error handling:
- Loading states are managed automatically
- Errors are captured and transformed to a standard format
- Error messages are displayed to users

## Products Page

### Location
`app/pages/products.vue`

### Features

#### Statistics Dashboard
Three key metrics displayed at the top:
- Total Products
- Low Stock Alert (≤ 5 items)
- Draft Products

#### Filtering System
- **Search**: Full-text search across name, description, and materials
- **Category Filter**: Filter by wall-hanging or rug
- **Status Filter**: Filter by available, sold, or draft
- **Sort Options**: Sort by name, price, or creation date
- **Sort Order**: Toggle ascending/descending

#### Product Table
Professional table with columns:
- **Image**: Product thumbnail with placeholder fallback
- **Product**: Name and description (truncated)
- **Category**: Formatted category label
- **Price**: Currency-formatted price
- **Stock**: Stock quantity with color-coded warnings
- **Status**: Status badge with appropriate colors
- **Actions**: View, Edit, Delete buttons

#### State Management
- **Loading State**: Animated spinner during data fetch
- **Empty State**: User-friendly message when no products exist
- **Error State**: Alert banner with error details

## Configuration

### Environment Variables

Set in `docker-compose.dev.yml` or `.env`:

```yaml
NUXT_PUBLIC_API_URL: http://backend:4000/api  # Docker
# or
NUXT_PUBLIC_API_URL: http://localhost:4000/api  # Local
```

### Nuxt Config

Added to `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  },
}
```

## API Integration

### Backend Endpoints Used

- `GET /products` - Fetch all products with optional filters
- `GET /products/:id` - Fetch single product
- `GET /products/category/:category` - Fetch by category
- `GET /products/statistics` - Fetch statistics
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Request/Response Flow

1. Component mounts → `fetchProducts()` called
2. Composable sets `loading = true`
3. API request via `$fetch`
4. Response data populates `products` ref
5. Loading state set to `false`
6. UI automatically updates (reactive)

## Type Safety

100% TypeScript coverage with:
- No `any` types used
- Strict null checks
- Interface validation
- Generic type constraints
- Discriminated unions for statuses

## Performance Optimizations

1. **Readonly State**: State refs are exposed as readonly to prevent external mutations
2. **Computed Properties**: Filtering/sorting use computed properties for automatic caching
3. **Lazy Loading**: Images load on-demand
4. **Efficient Filtering**: Client-side filtering for instant results

## Usage Example

```vue
<script setup lang="ts">
// Import composable
const {
  products,
  loading,
  error,
  fetchProducts,
  deleteProduct
} = useProducts()

// Load products on mount
onMounted(async () => {
  await fetchProducts({ status: 'available' })
})

// Delete a product
const handleDelete = async (id: string) => {
  const success = await deleteProduct(id)
  if (success) {
    console.log('Product deleted')
  }
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <div v-for="product in products" :key="product.id">
      {{ product.name }} - {{ formatPrice(product.price) }}
    </div>
  </div>
</template>
```

## Testing Recommendations

### Unit Tests
- Test composable functions in isolation
- Mock `$fetch` for API calls
- Verify state updates
- Test error handling

### Integration Tests
- Test full page rendering
- Verify filtering/sorting logic
- Test user interactions

### E2E Tests
- Test complete user workflows
- Verify API integration
- Test error scenarios

## Future Enhancements

1. **Pagination**: Add server-side pagination when backend supports it
2. **Image Upload**: Implement image upload functionality
3. **Bulk Actions**: Select multiple products for bulk operations
4. **Advanced Filters**: Date range, price range filters
5. **Export**: Export product list to CSV/Excel
6. **Product Details Modal**: View full product details in modal
7. **Toast Notifications**: Replace console.log with toast notifications
8. **Optimistic Updates**: Update UI before API confirmation

## Troubleshooting

### Products not loading
1. Check backend is running: `http://localhost:4000/api/products`
2. Verify API URL in environment: `echo $NUXT_PUBLIC_API_URL`
3. Check browser console for errors
4. Verify CORS is configured on backend

### Type errors
1. Ensure types are imported from `@/types/product`
2. Check TypeScript version compatibility
3. Rebuild project: `npm run dev`

### Styling issues
1. Verify Tailwind CSS is loaded
2. Check shadcn-vue components are installed
3. Clear Nuxt cache: `rm -rf .nuxt`

## References

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Backend API Documentation](http://localhost:4000/api-docs)
