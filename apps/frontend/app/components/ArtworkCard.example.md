# ArtworkCard Component - Usage Examples

## Overview

The `ArtworkCard` component is a flexible, reusable card for displaying artwork pieces (wall hangings and rugs) throughout the Atelier Kaisla e-commerce platform.

## Design Patterns

This component implements three key GoF design patterns:

1. **Strategy Pattern**: Configurable behavior (clickable, pricing, hover effects)
2. **Adapter Pattern**: Transforms raw dimension and price data into user-friendly formats
3. **Facade Pattern**: Provides a simple interface for complex artwork data presentation

## Basic Usage

### Simple Card (Display Only)

```vue
<script setup lang="ts">
import type { Artwork } from '~/types/artwork'

const artwork: Artwork = {
  id: '1',
  title: 'Sunset Dreams',
  imageSrc: '/images/artworks/sunset-dreams.jpg',
  imageAlt: 'Hand-woven wall hanging with warm sunset colors',
  dimensions: {
    width: 50,
    height: 70,
    unit: 'cm'
  },
  material: '100% wool on cotton warp',
  description: 'A warm and inviting wall hanging featuring sunset-inspired hues woven with traditional techniques.',
  category: 'wall-hanging'
}
</script>

<template>
  <ArtworkCard :artwork="artwork" />
</template>
```

### Clickable Card with Navigation

```vue
<script setup lang="ts">
const artwork: Artwork = {
  id: '2',
  title: 'Ocean Waves',
  imageSrc: '/images/artworks/ocean-waves.jpg',
  imageAlt: 'Blue and teal handwoven rug with wave patterns',
  dimensions: {
    width: 120,
    height: 180,
    unit: 'cm'
  },
  material: 'Organic cotton and recycled denim',
  description: 'A contemporary rug inspired by coastal landscapes, perfect for modern living spaces.',
  category: 'rug',
  detailUrl: '/products/ocean-waves'
}

const cardConfig = {
  clickable: true,
  enableHover: true,
  imageAspectRatio: '3/4'
}
</script>

<template>
  <ArtworkCard
    :artwork="artwork"
    :config="cardConfig"
  />
</template>
```

### E-commerce Card (with Price and Availability)

```vue
<script setup lang="ts">
const artwork: Artwork = {
  id: '3',
  title: 'Mountain Mist',
  imageSrc: '/images/artworks/mountain-mist.jpg',
  imageAlt: 'Gray and white wall hanging with mountain-inspired patterns',
  dimensions: {
    width: 60,
    height: 80,
    unit: 'cm'
  },
  material: 'Alpaca wool blend',
  description: 'Inspired by misty mountain mornings, this piece brings tranquility to any space.',
  category: 'wall-hanging',
  price: 295,
  available: true,
  detailUrl: '/products/mountain-mist'
}

const cardConfig = {
  clickable: true,
  showPrice: true,
  showAvailability: true,
  enableHover: true,
  imageAspectRatio: '4/3'
}
</script>

<template>
  <ArtworkCard
    :artwork="artwork"
    :config="cardConfig"
  />
</template>
```

## Grid Layout Example

### Wall Hanging Gallery Page

```vue
<script setup lang="ts">
import type { Artwork } from '~/types/artwork'

const wallHangings: Artwork[] = [
  {
    id: '1',
    title: 'Desert Bloom',
    imageSrc: '/images/wall-hangings/desert-bloom.jpg',
    imageAlt: 'Earth-toned wall hanging with desert flower motifs',
    dimensions: { width: 45, height: 60, unit: 'cm' },
    material: 'Merino wool and silk',
    description: 'Delicate desert flowers captured in soft, natural fibers.',
    price: 245,
    available: true,
    detailUrl: '/wall-hanging/desert-bloom'
  },
  // ... more artworks
]

const cardConfig = {
  clickable: true,
  showPrice: true,
  showAvailability: true,
  imageAspectRatio: '4/3'
}
</script>

<template>
  <div class="artwork-gallery">
    <div class="artwork-gallery__grid">
      <ArtworkCard
        v-for="artwork in wallHangings"
        :key="artwork.id"
        :artwork="artwork"
        :config="cardConfig"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.artwork-gallery {
  @include container;
  @include page-wrapper;
}

.artwork-gallery__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-2xl;
  }

  @include desktop {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-2xl;
  }
}
</style>
```

## Configuration Options

### ArtworkCardConfig Interface

```typescript
interface ArtworkCardConfig {
  // Show price if available (default: false)
  showPrice?: boolean

  // Show availability status (default: false)
  showAvailability?: boolean

  // Enable click to detail page (default: false)
  clickable?: boolean

  // Image aspect ratio (default: '4/3')
  // Common values: '1/1', '4/3', '3/4', '16/9'
  imageAspectRatio?: string

  // Enable hover effects (default: true)
  enableHover?: boolean
}
```

## Dimension Formatting

The component automatically formats dimensions based on the provided data:

```typescript
// 2D artwork (width × height)
dimensions: { width: 50, height: 70, unit: 'cm' }
// Output: "50 × 70 cm"

// 3D artwork (width × height × depth)
dimensions: { width: 120, height: 180, depth: 2, unit: 'cm' }
// Output: "120 × 180 × 2 cm"

// Imperial units
dimensions: { width: 20, height: 28, unit: 'in' }
// Output: "20 × 28 in"
```

## Accessibility Features

- **Semantic HTML**: Uses `<article>`, `<figure>`, `<figcaption>` for proper structure
- **ARIA Labels**: Comprehensive labels for screen readers
- **Keyboard Navigation**: Full keyboard support with focus-visible states
- **Alt Text**: Required for all images
- **Heading Hierarchy**: Proper `<h3>` usage for titles

## Performance Optimizations

- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Async Decoding**: `decoding="async"` prevents blocking
- **CSS Transitions**: Hardware-accelerated transforms
- **Computed Properties**: Efficient reactive formatting

## Testing Example

```typescript
// composables/__tests__/ArtworkCard.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ArtworkCard from '~/components/ArtworkCard.vue'
import type { Artwork } from '~/types/artwork'

describe('ArtworkCard - Pattern Implementation', () => {
  const mockArtwork: Artwork = {
    id: '1',
    title: 'Test Artwork',
    imageSrc: '/test.jpg',
    imageAlt: 'Test alt text',
    dimensions: { width: 50, height: 70, unit: 'cm' },
    material: 'Test material',
    description: 'Test description',
    price: 100,
    available: true,
    detailUrl: '/test-artwork'
  }

  it('should format dimensions correctly (Adapter Pattern)', () => {
    const wrapper = mount(ArtworkCard, {
      props: { artwork: mockArtwork }
    })

    expect(wrapper.text()).toContain('50 × 70 cm')
  })

  it('should render as clickable link when configured (Strategy Pattern)', () => {
    const wrapper = mount(ArtworkCard, {
      props: {
        artwork: mockArtwork,
        config: { clickable: true }
      }
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/test-artwork')
  })

  it('should format price correctly (Adapter Pattern)', () => {
    const wrapper = mount(ArtworkCard, {
      props: {
        artwork: mockArtwork,
        config: { showPrice: true }
      }
    })

    expect(wrapper.text()).toContain('100,00 €')
  })

  it('should display availability status (Facade Pattern)', () => {
    const wrapper = mount(ArtworkCard, {
      props: {
        artwork: mockArtwork,
        config: { showAvailability: true }
      }
    })

    expect(wrapper.text()).toContain('Disponible')
  })
})
```

## Common Use Cases

### 1. Product Listing Page
- Config: `{ clickable: true, showPrice: true, showAvailability: true }`
- Layout: Grid of 2-3 columns
- Image Ratio: `4/3` or `3/4`

### 2. Featured Collection
- Config: `{ clickable: true, enableHover: true }`
- Layout: Grid of 3-4 columns
- Image Ratio: `1/1` (square)

### 3. Artist Portfolio
- Config: `{ clickable: false, enableHover: false }`
- Layout: Masonry or simple grid
- Image Ratio: `4/3`

### 4. Shopping Cart Preview
- Config: `{ clickable: true, showPrice: true, imageAspectRatio: '1/1' }`
- Layout: Horizontal list
- Image Ratio: `1/1` (small thumbnails)

## File Locations

- Component: `/apps/frontend/app/components/ArtworkCard.vue`
- Types: `/apps/frontend/app/types/artwork.d.ts`
- Documentation: `/apps/frontend/app/components/ArtworkCard.example.md`
