# Image Gallery System - Documentation

## Overview

This document describes the image gallery system implementation for Atelier Kaisla. The system provides a responsive, accessible grid of clickable images with a full-screen lightbox viewer.

## Components Created

### 1. **ImageGrid.vue** (`/app/components/ImageGrid.vue`)

The main grid component that displays images in a responsive layout.

#### Features
- **Responsive Grid Layout**:
  - Mobile: 1 column
  - Tablet (768px+): 2 columns
  - Desktop (1024px+): 4 columns
- **Square Images**: All images maintain a 1:1 aspect ratio
- **Spacing**: 2rem (`$spacing-lg`) between grid items (approximately 20px as specified)
- **Desktop Sizing**: Maximum grid width of ~940px (4 × 220px + gaps)
- **Interactive**: Click or keyboard navigation to open lightbox
- **Accessibility**: Full keyboard support, ARIA labels, focus management

#### Props
```typescript
interface Props {
  images: GalleryImage[]      // Array of images to display
  config?: GalleryConfig      // Optional configuration
}
```

#### Usage Example
```vue
<template>
  <ImageGrid :images="galleryImages" />
</template>

<script setup lang="ts">
const { galleryImages } = useGalleryData()
</script>
```

---

### 2. **ImageLightbox.vue** (`/app/components/ImageLightbox.vue`)

A full-screen modal component for viewing images in detail.

#### Features
- **Full-Screen Display**: Images displayed at optimal size
- **Navigation**:
  - Previous/Next buttons
  - Keyboard arrows (← →)
  - Escape key to close
  - Click backdrop to close
- **Image Information**: Displays title and description
- **Counter**: Shows current image position (e.g., "3 / 12")
- **Smooth Transitions**: Fade and scale animations
- **Accessibility**:
  - Focus trap when open
  - ARIA labels and roles
  - Prevents body scroll when active
  - Keyboard navigation support

#### Props
```typescript
interface Props {
  images: GalleryImage[]      // Same image array as grid
}
```

#### Usage Example
```vue
<template>
  <ImageLightbox :images="galleryImages" />
</template>
```

---

## Composables

### 1. **useLightbox.ts** (`/app/composables/useLightbox.ts`)

Manages lightbox state globally using the **Observer Pattern** and **Singleton Pattern**.

#### API
```typescript
const {
  isOpen,              // Ref<boolean> - Is lightbox visible
  currentImageIndex,   // Ref<number> - Current image index
  openLightbox,        // (index: number) => void
  closeLightbox,       // () => void
  nextImage,           // (totalImages: number) => void
  previousImage        // (totalImages: number) => void
} = useLightbox()
```

#### Design Patterns
- **Observer Pattern**: Components reactively subscribe to state changes
- **Singleton Pattern**: Single source of truth for lightbox state
- **Functional Programming**: Pure functions, immutable operations

#### Features
- Body scroll lock when lightbox is open
- Circular navigation (wraps around at start/end)
- Type-safe state management

---

### 2. **useGalleryData.ts** (`/app/composables/useGalleryData.ts`)

Provides mock gallery data for development. Uses the **Factory Pattern**.

#### API
```typescript
const {
  galleryImages,           // Computed<readonly GalleryImage[]> - 12 images
  createMockImage,         // Factory function for single image
  getGalleryImages         // (count: number) => readonly GalleryImage[]
} = useGalleryData()
```

#### Factory Function
```typescript
createMockImage(
  id: string,              // Unique identifier
  alt: string,             // Alt text
  title?: string,          // Optional title
  description?: string     // Optional description
): GalleryImage
```

#### Future Enhancement
This composable will be replaced with actual API calls to fetch real image data from the backend.

---

## Type Definitions

### **gallery.d.ts** (`/app/types/gallery.d.ts`)

#### GalleryImage Interface
```typescript
interface GalleryImage {
  id: string              // Unique identifier
  src: string             // Image URL/path
  alt: string             // Accessibility text
  title?: string          // Optional title
  description?: string    // Optional description
  width?: number          // Image width in pixels
  height?: number         // Image height in pixels
}
```

#### GalleryConfig Interface
```typescript
interface GalleryConfig {
  columns?: number        // Desktop columns (default: 4)
  imageSize?: number      // Square size in px (default: 220)
  gap?: string           // Spacing variable (default: $spacing-lg)
}
```

---

## Design Patterns Implemented

### 1. **Observer Pattern**
- **Where**: `useLightbox` composable
- **Why**: Enables reactive state management - components automatically update when lightbox state changes
- **Benefit**: Decoupled components, single source of truth

### 2. **Singleton Pattern**
- **Where**: `useLightbox` state (ref/reactive at module level)
- **Why**: Ensures only one lightbox instance controls state globally
- **Benefit**: Consistent state across all components

### 3. **Factory Pattern**
- **Where**: `useGalleryData` composable (`createMockImage`)
- **Why**: Centralizes creation of properly structured gallery image objects
- **Benefit**: Consistency, type safety, easy to maintain

### 4. **Strategy Pattern**
- **Where**: ImageLightbox keyboard navigation, responsive grid layouts
- **Why**: Different behaviors based on context (keyboard vs click, mobile vs desktop)
- **Benefit**: Flexible, extensible interaction patterns

### 5. **Functional Programming Principles**
- **Pure Functions**: All utility functions return consistent outputs
- **Immutability**: Using `Object.freeze()`, `readonly` types, computed properties
- **Composition**: Building complex features from simple, reusable functions
- **No Side Effects**: State changes are explicit and contained

---

## Responsive Behavior

### Breakpoints (from `_mixins.scss`)
- **Mobile**: < 768px
- **Tablet**: ≥ 768px
- **Desktop**: ≥ 1024px

### Grid Layout
| Breakpoint | Columns | Gap | Image Size |
|------------|---------|-----|------------|
| Mobile     | 1       | 2rem | ~100% width |
| Tablet     | 2       | 2rem | ~50% width each |
| Desktop    | 4       | 2rem | ~220px each |

### Lightbox Controls
- **Mobile**: Smaller navigation buttons (48px), reduced padding
- **Tablet/Desktop**: Larger buttons (56px), more spacing

---

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate through grid items
- **Enter/Space**: Open lightbox on focused image
- **Arrow Left/Right**: Navigate between images in lightbox
- **Escape**: Close lightbox

### Screen Reader Support
- Proper ARIA labels on all interactive elements
- `role="button"` on clickable grid items
- `role="dialog"` and `aria-modal="true"` on lightbox
- Image counter announced to screen readers

### Focus Management
- Focus trap in lightbox
- Visible focus indicators (`@mixin focus-visible`)
- Body scroll prevention when lightbox is open

### Semantic HTML
- Proper heading hierarchy (h1 → h2)
- Semantic `<section>` elements
- `<header>` for section headers

---

## SEO Considerations

### Image SEO
- All images have descriptive `alt` attributes
- Lazy loading support (commented out, ready for real images)
- Structured semantic markup

### Page Structure
- Proper heading hierarchy maintained
- Semantic HTML5 elements throughout
- OpenGraph and Twitter Card meta tags configured

### Server-Side Rendering (SSR)
- Components are SSR-compatible
- Client-only code properly guarded with `import.meta.client`
- No hydration mismatches

---

## SCSS Variables Used

From `/app/assets/styles/_variables.scss`:

```scss
// Colors
$color-white: #ffffff
$color-black: #000000
$color-gray-900: #1f2937
$color-gray-600: #4b5563
$color-gray-200: #e0e0e0

// Spacing (gap = $spacing-lg = 2rem ≈ 20px)
$spacing-xs: 0.5rem
$spacing-sm: 1rem
$spacing-md: 1.5rem
$spacing-lg: 2rem     // Used for grid gaps
$spacing-xl: 3rem
$spacing-2xl: 4rem
$spacing-3xl: 6rem

// Typography
$font-size-base: 1rem
$font-size-lg: 1.125rem
$font-size-xl: 1.5rem
$font-size-2xl: 2rem
$font-size-3xl: 2.5rem

// Transitions
$transition-fast: 0.2s ease
$transition-base: 0.3s ease

// Layout
$border-radius-base: 0.5rem
```

---

## Integration Example

The gallery has been integrated into the home page (`/app/pages/index.vue`):

```vue
<template>
  <section class="gallery-section">
    <div class="container">
      <header class="gallery-section__header">
        <h2 class="gallery-section__title">Our Collection</h2>
        <p class="gallery-section__description">
          Explore our handcrafted pieces. Click on any image to view it in full size.
        </p>
      </header>

      <ImageGrid :images="galleryImages" />
    </div>
  </section>
</template>

<script setup lang="ts">
const { galleryImages } = useGalleryData()
</script>
```

---

## Future Enhancements

### Phase 1: Real Images
1. Replace mock data with API calls
2. Uncomment lazy loading in ImageGrid
3. Add image optimization (Nuxt Image module)
4. Implement loading states and skeletons

### Phase 2: Advanced Features
1. **Image Categories/Filters**: Filter gallery by type (rugs, wall hangings)
2. **Infinite Scroll**: Load more images as user scrolls
3. **Image Zoom**: Pinch-to-zoom on mobile, scroll-to-zoom on desktop
4. **Thumbnails**: Show thumbnail strip in lightbox
5. **Sharing**: Add social sharing buttons in lightbox
6. **Favorites**: Allow users to save favorite pieces

### Phase 3: Performance
1. **Progressive Loading**: Load low-res placeholder, then high-res
2. **Prefetching**: Preload next/previous images in lightbox
3. **WebP/AVIF**: Modern image formats with fallbacks
4. **CDN Integration**: Serve images from CDN

---

## File Structure

```
apps/frontend/app/
├── components/
│   ├── ImageGrid.vue          # Grid component
│   └── ImageLightbox.vue      # Lightbox modal
├── composables/
│   ├── useLightbox.ts         # Lightbox state management
│   └── useGalleryData.ts      # Mock data provider
├── types/
│   └── gallery.d.ts           # TypeScript interfaces
└── pages/
    └── index.vue              # Home page integration
```

---

## Testing Recommendations

### Unit Tests
- Test `useLightbox` state transitions
- Test `useGalleryData` factory functions
- Test keyboard navigation handlers
- Test image index calculations (circular navigation)

### Component Tests
- Test ImageGrid rendering with different image counts
- Test lightbox open/close functionality
- Test navigation between images
- Test responsive layout changes

### E2E Tests
- Test full user flow: click image → view in lightbox → navigate → close
- Test keyboard navigation flow
- Test accessibility with screen reader
- Test on different viewport sizes

---

## Performance Considerations

### Current Implementation
- Minimal bundle size impact (pure Vue components)
- No external dependencies
- CSS-only transitions (GPU-accelerated)
- Lazy-loading ready (commented out)

### Lighthouse Metrics Expected
- **Performance**: 95+ (with optimized images)
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

---

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (latest)

---

## Questions or Issues?

Refer to the codebase comments for detailed implementation notes. Each component and composable includes comprehensive JSDoc comments explaining design decisions and usage patterns.
