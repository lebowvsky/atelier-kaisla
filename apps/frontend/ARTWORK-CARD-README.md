# ArtworkCard Component - Complete Implementation

## Overview

The `ArtworkCard` component is a production-ready, pattern-driven Vue 3 component for displaying artwork pieces (wall hangings and rugs) in the Atelier Kaisla e-commerce platform.

## Design Patterns Applied

This implementation systematically applies three GoF design patterns:

### 1. **Strategy Pattern** (Behavioral)
**Purpose**: Configurable display behavior without component modification

**Implementation**:
- `ArtworkCardConfig` interface defines behavior strategies
- Component adapts rendering based on configuration
- Supports multiple display modes (clickable, pricing, hover effects)

**Benefits**:
- Highly reusable across different contexts
- Easy to add new display strategies
- No code duplication for variants

### 2. **Adapter Pattern** (Structural)
**Purpose**: Transform raw data into user-friendly formats

**Implementation**:
- `formattedDimensions`: Adapts dimension data to "50 × 70 cm" format
- `formattedPrice`: Converts number to localized currency string
- `useArtworks` composable: Adapts API data to internal Artwork type

**Benefits**:
- Consistent data presentation
- Easy to change formatting without touching UI
- Localization-ready

### 3. **Facade Pattern** (Structural)
**Purpose**: Simplify complex artwork data presentation

**Implementation**:
- Component provides single interface for complex data
- `ariaLabel` computed property aggregates all data for accessibility
- `useArtworks` composable simplifies data management

**Benefits**:
- Simplified component API
- Encapsulated complexity
- Easy to maintain and extend

## File Structure

```
apps/frontend/app/
├── components/
│   ├── ArtworkCard.vue                          # Main component
│   ├── ArtworkCard.example.md                   # Usage documentation
│   ├── ArtworkCard.integration-example.vue      # Full page example
│   └── __tests__/
│       └── ArtworkCard.spec.ts                  # Comprehensive tests
├── composables/
│   └── useArtworks.ts                           # Data management composable
└── types/
    └── artwork.d.ts                             # TypeScript definitions
```

## Quick Start

### 1. Basic Display Card

```vue
<script setup lang="ts">
import type { Artwork } from '~/types/artwork'

const artwork: Artwork = {
  id: '1',
  title: 'Desert Bloom',
  imageSrc: '/images/desert-bloom.jpg',
  imageAlt: 'Handwoven wall hanging with desert colors',
  dimensions: { width: 50, height: 70 },
  material: 'Merino wool on cotton warp',
  description: 'Beautiful desert-inspired wall hanging.',
  category: 'wall-hanging'
}
</script>

<template>
  <ArtworkCard :artwork="artwork" />
</template>
```

### 2. E-commerce Product Card

```vue
<script setup lang="ts">
const artwork: Artwork = {
  // ... artwork data
  price: 245,
  available: true,
  detailUrl: '/wall-hanging/desert-bloom'
}

const config = {
  clickable: true,
  showPrice: true,
  showAvailability: true
}
</script>

<template>
  <ArtworkCard :artwork="artwork" :config="config" />
</template>
```

### 3. Product Gallery Page

```vue
<script setup lang="ts">
const { filterByCategory } = useArtworks()
const wallHangings = filterByCategory('wall-hanging')

const cardConfig = {
  clickable: true,
  showPrice: true,
  showAvailability: true,
  imageAspectRatio: '4/3'
}
</script>

<template>
  <div class="gallery-grid">
    <ArtworkCard
      v-for="artwork in wallHangings"
      :key="artwork.id"
      :artwork="artwork"
      :config="cardConfig"
    />
  </div>
</template>

<style lang="scss" scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
```

## Component API

### Props

#### `artwork` (required)
Type: `Artwork`

The artwork data to display.

```typescript
interface Artwork {
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

#### `config` (optional)
Type: `ArtworkCardConfig`

Configuration for card behavior and display.

```typescript
interface ArtworkCardConfig {
  showPrice?: boolean              // Default: false
  showAvailability?: boolean       // Default: false
  clickable?: boolean              // Default: false
  imageAspectRatio?: string        // Default: '4/3'
  enableHover?: boolean            // Default: true
}
```

## Composable API

### `useArtworks()`

Centralized artwork data management with filtering and sorting utilities.

```typescript
const {
  // State
  artworks,           // readonly Ref<Artwork[]>
  isLoading,          // readonly Ref<boolean>
  error,              // readonly Ref<Error | null>

  // Getters
  getArtworkById,     // (id: string) => Artwork | null
  getCountByCategory, // () => { 'wall-hanging': number, 'rug': number, ... }

  // Filters
  filterByCategory,   // (category) => Artwork[]
  filterAvailable,    // () => Artwork[]
  filterByPriceRange, // (min, max) => Artwork[]

  // Sorting
  sortByPrice,        // (order) => Artwork[]
  sortByTitle,        // (order) => Artwork[]

  // Actions
  fetchArtworks       // () => Promise<Artwork[]>
} = useArtworks()
```

## Pattern Implementation Examples

### Factory Pattern (Composable)

```typescript
// useArtworks.ts
export function createArtwork(data: Artwork): Artwork {
  return {
    ...data,
    dimensions: {
      ...data.dimensions,
      unit: data.dimensions.unit || 'cm'
    },
    available: data.available ?? true
  }
}

// Usage
const artwork = createArtwork({
  id: '1',
  title: 'Test',
  // ... other fields
})
```

### Strategy Pattern (Configuration)

```typescript
// Different strategies for different contexts
const productListingConfig = {
  clickable: true,
  showPrice: true,
  showAvailability: true
}

const portfolioConfig = {
  clickable: false,
  enableHover: false
}

const featuredConfig = {
  clickable: true,
  imageAspectRatio: '3/4'
}
```

### Adapter Pattern (Data Transformation)

```typescript
// Component internal
const formattedDimensions = computed(() => {
  const { width, height, depth, unit = 'cm' } = props.artwork.dimensions
  return depth
    ? `${width} × ${height} × ${depth} ${unit}`
    : `${width} × ${height} ${unit}`
})

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(props.artwork.price)
})
```

## Accessibility Features

### WCAG 2.1 AA Compliance

✅ **Semantic HTML**
- `<article>` for card container
- `<figure>` for image section
- `<h3>` for title (proper heading hierarchy)

✅ **ARIA Attributes**
- Comprehensive `aria-label` for screen readers
- Descriptive link labels for clickable cards

✅ **Keyboard Navigation**
- Full keyboard support with `@focus-visible` mixin
- Visible focus indicators

✅ **Image Accessibility**
- Required `alt` text for all images
- Descriptive alternative text

✅ **Color Contrast**
- Text meets WCAG AA standards
- Availability badges with sufficient contrast

## Performance Optimizations

### Image Loading
```html
<img
  loading="lazy"      <!-- Lazy loading -->
  decoding="async"    <!-- Async decoding -->
  :src="artwork.imageSrc"
  :alt="artwork.imageAlt"
/>
```

### CSS Performance
- Hardware-accelerated transforms (`transform`, not `top/left`)
- Efficient transitions on specific properties
- No layout thrashing

### Reactivity
- `computed` properties for derived state
- `readonly` for exposed state (prevents external mutations)
- Pure functions for filters and transformations

## Testing

### Run Tests

```bash
# From apps/frontend/
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Coverage

The test suite covers:

✅ **Pattern Implementations**
- Strategy Pattern: Configuration variations
- Adapter Pattern: Data formatting
- Facade Pattern: Availability status

✅ **Component Rendering**
- All props and computed properties
- Conditional rendering logic
- Edge cases and default values

✅ **Accessibility**
- ARIA labels
- Semantic HTML structure
- Keyboard navigation

✅ **Edge Cases**
- Missing optional fields
- Invalid configurations
- Default value fallbacks

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2022 target with polyfills
- CSS Grid and Flexbox support required
- Aspect ratio support (fallback can be added if needed)

## Migration Path

### From Placeholder to Real Images

Currently using placeholder images. To integrate real images:

1. Upload images to `/apps/frontend/public/images/`
2. Update `imageSrc` paths in `useArtworks.ts`
3. Ensure images are optimized (WebP format recommended)
4. Consider using Nuxt Image module for automatic optimization

### From Mock Data to API

To connect to a real API:

1. Update `fetchArtworks()` in `useArtworks.ts`
2. Implement `adaptApiToArtwork()` based on API structure
3. Add error handling and loading states
4. Consider using `useFetch` or `useAsyncData` from Nuxt

Example:
```typescript
const fetchArtworks = async () => {
  const { data, error } = await useFetch('/api/artworks')

  if (error.value) {
    throw error.value
  }

  artworks.value = data.value.map(adaptApiToArtwork)
  return artworks.value
}
```

## Styling Customization

All styles use SCSS variables from `_variables.scss`:

```scss
// Change card spacing
.artwork-card__content {
  padding: $spacing-lg;  // Adjust this variable
}

// Change hover effects
.artwork-card--hoverable:hover {
  transform: translateY(-4px);  // Customize transform
}

// Change image aspect ratio
<ArtworkCard :config="{ imageAspectRatio: '1/1' }" />
```

## Best Practices

### ✅ DO

- Use `createArtwork()` factory for consistency
- Apply appropriate configuration for context
- Provide descriptive alt text for images
- Use `filterByCategory()` for category pages
- Test with real content before deployment

### ❌ DON'T

- Mutate artwork objects directly
- Skip alt text for images
- Use arbitrary aspect ratios (stick to common ones)
- Forget to handle loading/error states
- Ignore accessibility features

## Troubleshooting

### Images Not Displaying

1. Check image path is correct
2. Verify images exist in `/apps/frontend/public/images/`
3. Ensure `imageSrc` starts with `/images/`

### Prices Not Formatting

1. Verify `showPrice: true` in config
2. Check `price` field exists in artwork data
3. Ensure price is a number, not string

### Click Not Working

1. Verify `clickable: true` in config
2. Check `detailUrl` is provided in artwork data
3. Ensure URL is valid and page exists

## Contributing

When adding new features:

1. Follow the established patterns (Strategy, Adapter, Facade)
2. Add TypeScript types to `artwork.d.ts`
3. Update tests in `ArtworkCard.spec.ts`
4. Document pattern usage in code comments
5. Update this README with examples

## Related Documentation

- [Main Architecture Documentation](/apps/frontend/ARCHITECTURE.md)
- [Project Setup Guide](/CLAUDE.md)
- [Component Examples](/apps/frontend/app/components/ArtworkCard.example.md)
- [Integration Example](/apps/frontend/app/components/ArtworkCard.integration-example.vue)

## Support

For questions or issues:
1. Check this README first
2. Review example files in `/components/`
3. Check test file for usage patterns
4. Consult main project documentation

---

**Created with pattern-driven development principles**
Implements: Strategy Pattern, Adapter Pattern, Facade Pattern
Framework: Vue 3 Composition API + TypeScript
Testing: Vitest with comprehensive coverage
Accessibility: WCAG 2.1 AA compliant
