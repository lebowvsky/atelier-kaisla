# ArtworkList Component Implementation

## Overview

This document describes the implementation of the artwork listing functionality for Atelier Kaisla's frontend application. The implementation includes a reusable `ArtworkList` component, a data composable for managing artwork collections, and an updated Wall Hanging collection page.

## Implementation Summary

### Components Created

1. **ArtworkList.vue** (`/apps/frontend/app/components/ArtworkList.vue`)
   - Responsive grid layout component for displaying artwork collections
   - Supports three grid layout strategies: default, compact, and wide
   - Includes loading skeleton states with animated placeholders
   - Empty state with customizable message
   - Full TypeScript type safety
   - WCAG 2.1 AA accessibility compliance

2. **useArtworkData.ts** (`/apps/frontend/app/composables/useArtworkData.ts`)
   - Composable for managing artwork data
   - Contains mock data for 6 wall hangings and 2 rugs
   - Factory methods for filtering by category and finding by ID
   - Type-safe with readonly refs for data immutability
   - Easy migration path to API integration

3. **Wall Hanging Page** (`/apps/frontend/app/pages/wall-hanging.vue`)
   - Updated to use ArtworkList component
   - Comprehensive SEO optimization
   - Informational section about wall hangings
   - Loading state simulation for development

### Assets Created

Six SVG placeholder images (`/apps/frontend/public/`):
- `placeholder-artwork-1.svg` - Organic Waves (gray gradient)
- `placeholder-artwork-2.svg` - Desert Sunset (warm tones)
- `placeholder-artwork-3.svg` - Forest Whispers (green gradient)
- `placeholder-artwork-4.svg` - Minimalist Lines (geometric design)
- `placeholder-artwork-5.svg` - Coastal Dreams (blue concentric circles)
- `placeholder-artwork-6.svg` - Terra Collection (terracotta curves)

## Design Patterns Applied

### ArtworkList Component

1. **Iterator Pattern** (Behavioral)
   - Provides clean interface to traverse artwork collections
   - Skeleton items generation for loading states

2. **Template Method Pattern** (Behavioral)
   - Defines rendering algorithm skeleton
   - Customizable through configuration props

3. **Strategy Pattern** (Behavioral)
   - Three grid layout strategies (default, compact, wide)
   - Dynamic grid class selection based on layout prop

### useArtworkData Composable

1. **Factory Pattern** (Creational)
   - Creates consistent artwork objects
   - Methods: `getArtworksByCategory()`, `getArtworkById()`

2. **Singleton Pattern** (Creational)
   - Ensures consistent data across components
   - Mock data cache for development

### Wall Hanging Page

1. **Facade Pattern** (Structural)
   - Simplifies complex artwork data presentation
   - Uses composables to abstract data management

2. **Observer Pattern** (Behavioral - implicit via Vue reactivity)
   - Reactive data updates propagate automatically
   - Vue's reactivity system handles state observation

## Component API

### ArtworkList Props

```typescript
interface Props {
  artworks: Artwork[]           // Array of artworks to display
  loading?: boolean             // Loading state (default: false)
  cardConfig?: ArtworkCardConfig // ArtworkCard configuration
  emptyMessage?: string         // Empty state message
  gridLayout?: 'default' | 'compact' | 'wide' // Grid strategy
  skeletonCount?: number        // Number of skeleton cards (default: 6)
}
```

### Grid Layout Strategies

- **Default**: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- **Compact**: 2 columns (mobile) → 3 columns (tablet) → 4 columns (desktop)
- **Wide**: 1 column (mobile) → 2 columns (tablet/desktop) - larger cards

### Card Configuration

```typescript
interface ArtworkCardConfig {
  showPrice?: boolean           // Display price (default: false)
  showAvailability?: boolean    // Display availability (default: false)
  clickable?: boolean           // Enable click navigation (default: false)
  imageAspectRatio?: string     // Image aspect ratio (default: '4/3')
  enableHover?: boolean         // Enable hover effects (default: true)
}
```

## Usage Examples

### Basic Usage

```vue
<template>
  <ArtworkList
    :artworks="wallHangings"
    :loading="isLoading"
  />
</template>

<script setup lang="ts">
const { wallHangings } = useArtworkData()
const isLoading = ref(false)
</script>
```

### Advanced Configuration

```vue
<template>
  <ArtworkList
    :artworks="artworks"
    :loading="isLoading"
    :card-config="{
      showPrice: true,
      showAvailability: true,
      clickable: true,
      enableHover: true
    }"
    grid-layout="compact"
    empty-message="No artworks found matching your criteria."
    :skeleton-count="8"
  />
</template>
```

### Data Composable Usage

```typescript
// Get all wall hangings
const { wallHangings } = useArtworkData()

// Get all rugs
const { rugs } = useArtworkData()

// Get all artworks
const { allArtworks } = useArtworkData()

// Get only available artworks
const { availableArtworks } = useArtworkData()

// Filter by category
const { getArtworksByCategory } = useArtworkData()
const wallHangings = getArtworksByCategory('wall-hanging')

// Find by ID
const { getArtworkById } = useArtworkData()
const artwork = getArtworkById('wh-001')
```

## Responsive Behavior

### Mobile (< 768px)
- Default layout: Single column grid
- Compact layout: 2 columns
- Wide layout: Single column
- Padding: $spacing-md
- Card content padding: $spacing-md

### Tablet (768px - 1023px)
- Default layout: 2 columns
- Compact layout: 3 columns
- Wide layout: 2 columns
- Padding: $spacing-lg
- Card content padding: $spacing-lg
- Increased gap spacing

### Desktop (≥ 1024px)
- Default layout: 3 columns
- Compact layout: 4 columns
- Wide layout: 2 columns (larger cards)
- Maximum container width: 1280px
- Padding: $spacing-lg

## Accessibility Features

1. **Semantic HTML**
   - `<ul>` and `<li>` for artwork list
   - `<article>` for each artwork card
   - Proper heading hierarchy (h1, h2, h3)

2. **ARIA Attributes**
   - `role="status"` for loading/empty states
   - `aria-live="polite"` for dynamic content updates
   - `aria-label` for grid and individual cards
   - `aria-hidden="true"` for decorative skeleton elements

3. **Screen Reader Support**
   - Descriptive labels for all interactive elements
   - Visually hidden text for context
   - Loading announcements
   - Meaningful alternative text for images

4. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Focus-visible states with outline
   - Logical tab order

## SEO Optimization

### Wall Hanging Page

```typescript
useSeoMeta({
  title: 'Wall Hanging Collection | Atelier Kaisla',
  description: 'Explore our collection of handcrafted wall hangings...',
  ogTitle: 'Wall Hanging Collection | Atelier Kaisla',
  ogDescription: 'Discover unique handwoven wall art pieces...',
  ogImage: '/logo-kaisla.png',
  ogUrl: 'https://atelier-kaisla.com/wall-hanging',
  twitterCard: 'summary_large_image',
  // ... additional meta tags
})
```

### Structured Data
- Semantic HTML provides clear content structure
- Future enhancement: Add JSON-LD for Product schema

## Performance Optimizations

1. **Image Loading**
   - `loading="lazy"` on all artwork images
   - `decoding="async"` for non-blocking decode
   - SVG placeholders are lightweight

2. **Computed Properties**
   - All derivations use Vue's `computed()` for caching
   - Pure functions for predictable behavior
   - No unnecessary re-computations

3. **CSS Grid**
   - Native browser grid implementation
   - Hardware-accelerated transforms
   - Efficient responsive breakpoints

4. **Component Architecture**
   - Readonly refs prevent accidental mutations
   - Minimal re-renders through proper reactivity
   - Scoped styles prevent CSS bloat

## Loading States

### Skeleton Animation
```scss
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

- Duration: 1.5s
- Easing: ease-in-out
- Infinite loop
- Gradient sweep effect

### Skeleton Structure
Each skeleton card includes:
- Image placeholder (4/3 aspect ratio)
- Title line (70% width)
- Short line (40% width)
- Medium line (60% width)
- Long line (90% width)

## Future Enhancements

### Backend Integration
Replace mock data with API calls:

```typescript
export function useArtworkData() {
  const { data, pending, error } = useFetch('/api/artworks')

  const wallHangings = computed(() =>
    data.value?.filter(a => a.category === 'wall-hanging') || []
  )

  return {
    wallHangings: readonly(wallHangings),
    loading: pending,
    error
  }
}
```

### Additional Features
1. **Filtering**
   - Price range slider
   - Material selection
   - Availability toggle

2. **Sorting**
   - Price: low to high / high to low
   - Newest first
   - Name: A-Z / Z-A

3. **Pagination**
   - Load more button
   - Infinite scroll
   - Page numbers

4. **Search**
   - Full-text search
   - Filter by title or description

5. **Favorites**
   - Save artworks to wishlist
   - Persistent storage (localStorage/API)

## Testing Recommendations

### Unit Tests

```typescript
describe('ArtworkList', () => {
  it('should render artworks in grid', () => {
    // Test grid rendering
  })

  it('should show loading skeleton when loading prop is true', () => {
    // Test loading state
  })

  it('should show empty state when artworks array is empty', () => {
    // Test empty state
  })

  it('should apply correct grid layout class', () => {
    // Test strategy pattern
  })
})

describe('useArtworkData', () => {
  it('should return wall hangings filtered by category', () => {
    // Test factory pattern
  })

  it('should find artwork by ID', () => {
    // Test finder method
  })
})
```

### E2E Tests

```typescript
test('Wall Hanging page displays artwork collection', async ({ page }) => {
  await page.goto('/wall-hanging')

  // Check page title
  await expect(page.locator('h1')).toHaveText('Wall Hanging Collection')

  // Check artworks are visible
  const cards = page.locator('.artwork-card')
  await expect(cards).toHaveCount(6)

  // Check clickable cards navigate correctly
  await cards.first().click()
  await expect(page).toHaveURL(/\/wall-hanging\//)
})
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 14+
- Chrome Mobile: Latest 2 versions

### CSS Features Used
- CSS Grid (full support in target browsers)
- CSS Custom Properties (full support)
- CSS Transforms (full support)
- CSS Animations (full support)

## Files Modified/Created

### Created
- `/apps/frontend/app/components/ArtworkList.vue`
- `/apps/frontend/app/composables/useArtworkData.ts`
- `/apps/frontend/public/placeholder-artwork-1.svg`
- `/apps/frontend/public/placeholder-artwork-2.svg`
- `/apps/frontend/public/placeholder-artwork-3.svg`
- `/apps/frontend/public/placeholder-artwork-4.svg`
- `/apps/frontend/public/placeholder-artwork-5.svg`
- `/apps/frontend/public/placeholder-artwork-6.svg`

### Modified
- `/apps/frontend/app/pages/wall-hanging.vue`

## Conclusion

The ArtworkList implementation provides a production-ready, accessible, and performant solution for displaying artwork collections. It follows Vue 3 best practices, implements proven design patterns, and is fully prepared for backend integration when the API is ready.

The component is highly configurable, responsive across all device sizes, and maintains excellent code quality with full TypeScript coverage and comprehensive documentation.
