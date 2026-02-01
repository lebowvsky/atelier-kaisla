# Image Gallery - Architecture Overview

## Component Hierarchy

```
Page: index.vue
    │
    └─── ImageGrid.vue (Grid Layout)
            │
            ├─── Grid Items (clickable)
            │       └─── Placeholder boxes (gray background)
            │
            └─── ImageLightbox.vue (Modal)
                    ├─── Close Button
                    ├─── Navigation Buttons (Prev/Next)
                    ├─── Image Display
                    ├─── Image Info (Title/Description)
                    └─── Counter (1/12)
```

## Data Flow

```
useGalleryData (Composable)
    │
    ├─── generateMockGallery() → Creates 12 GalleryImage objects
    │
    └─── galleryImages (Computed)
            ↓
    index.vue (Page)
            ↓
    ImageGrid.vue (Component)
            │
            ├─── Renders grid items
            │
            └─── On click → openLightbox(index)
                    ↓
            useLightbox (Composable)
                    │
                    ├─── isOpen.value = true
                    ├─── currentImageIndex.value = index
                    │
                    └─── Triggers ImageLightbox to show
```

## State Management

```typescript
// Global Singleton State (useLightbox)
┌─────────────────────────────────────┐
│  useLightbox Composable             │
│                                     │
│  State:                             │
│  ├─ isOpen: Ref<boolean>           │
│  └─ currentImageIndex: Ref<number> │
│                                     │
│  Actions:                           │
│  ├─ openLightbox(index)            │
│  ├─ closeLightbox()                │
│  ├─ nextImage(total)               │
│  └─ previousImage(total)           │
└─────────────────────────────────────┘
           ↓         ↑
    ┌──────┴─────────┴──────┐
    ↓                        ↓
ImageGrid.vue        ImageLightbox.vue
(Triggers)           (Observes & Displays)
```

## Type System

```typescript
// gallery.d.ts

GalleryImage {
  id: string
  src: string
  alt: string
  title?: string
  description?: string
  width?: number
  height?: number
}
    ↓ Used by ↓
┌───────────────────────────────────┐
│  useGalleryData                   │
│  ImageGrid                        │
│  ImageLightbox                    │
└───────────────────────────────────┘

GalleryConfig {
  columns?: number
  imageSize?: number
  gap?: string
}
    ↓ Used by ↓
ImageGrid (optional prop)
```

## Responsive Breakpoints

```
Mobile (< 768px)
┌─────────────────┐
│  Image 1        │
├─────────────────┤
│  Image 2        │
├─────────────────┤
│  Image 3        │
└─────────────────┘
1 column, full width

Tablet (768px - 1023px)
┌─────────┬─────────┐
│ Image 1 │ Image 2 │
├─────────┼─────────┤
│ Image 3 │ Image 4 │
└─────────┴─────────┘
2 columns

Desktop (1024px+)
┌─────┬─────┬─────┬─────┐
│ Img1│ Img2│ Img3│ Img4│
├─────┼─────┼─────┼─────┤
│ Img5│ Img6│ Img7│ Img8│
└─────┴─────┴─────┴─────┘
4 columns × 220px each
```

## Event Flow

### Opening Lightbox

```
User Action: Click on grid item
    ↓
ImageGrid.handleImageClick(index)
    ↓
useLightbox.openLightbox(index)
    ↓
State Update:
    ├─ isOpen.value = true
    ├─ currentImageIndex.value = index
    └─ document.body.style.overflow = 'hidden'
    ↓
ImageLightbox reactive update (Observer Pattern)
    ↓
Lightbox renders with Transition animation
```

### Navigation in Lightbox

```
User Action: Click Next or Press Arrow Right
    ↓
ImageLightbox.handleKeydown(event) OR Button @click
    ↓
useLightbox.nextImage(totalImages)
    ↓
currentImageIndex.value = (current + 1) % total
    ↓
Computed property updates: currentImage
    ↓
Lightbox shows next image (reactive)
```

### Closing Lightbox

```
User Action: Press Escape / Click Close / Click Backdrop
    ↓
useLightbox.closeLightbox()
    ↓
State Update:
    ├─ isOpen.value = false
    └─ document.body.style.overflow = ''
    ↓
Lightbox unmounts with Transition animation
```

## SCSS Architecture

```scss
// Variables Used
$spacing-lg: 2rem           → Grid gap
$spacing-md: 1.5rem         → Padding (mobile)
$spacing-xl: 3rem           → Padding (larger screens)
$color-gray-200: #e0e0e0   → Placeholder background
$transition-base: 0.3s ease → Animations

// Mixins Used
@include container           → Max-width + centering
@include tablet             → Media query (768px+)
@include desktop            → Media query (1024px+)
@include focus-visible      → Accessible focus styles
```

## Component Lifecycle

### ImageGrid

```
Setup Phase:
├─ Receive images prop
├─ Initialize useLightbox composable
└─ Define event handlers (pure functions)

Render Phase:
├─ Generate grid with v-for
├─ Apply responsive CSS Grid
└─ Attach event listeners

User Interaction:
├─ Click/Keypress detected
├─ Call openLightbox(index)
└─ Lightbox takes over
```

### ImageLightbox

```
Setup Phase:
├─ Receive images prop
├─ Subscribe to useLightbox state (Observer)
└─ Define keyboard handler

Mounted:
├─ Add global keydown listener
└─ Wait for isOpen to become true

When isOpen = true:
├─ Render via v-if
├─ Display currentImage (computed)
├─ Lock body scroll
└─ Show with transition

Unmounted:
├─ Remove keydown listener
└─ Restore body scroll
```

## Design Pattern Implementation

### 1. Observer Pattern

```typescript
// Publisher (useLightbox)
const isOpen = ref(false)
const currentImageIndex = ref(0)

// Subscriber (ImageLightbox)
const { isOpen, currentImageIndex } = useLightbox()

// Auto-updates when state changes ✅
```

### 2. Singleton Pattern

```typescript
// Module-level state (single instance)
const isOpen = ref(false)  // Shared across all usages
const currentImageIndex = ref(0)

export const useLightbox = () => {
  return { isOpen, currentImageIndex, ... }
}
```

### 3. Factory Pattern

```typescript
const createMockImage = (
  id: string,
  alt: string,
  title?: string
): GalleryImage => {
  return Object.freeze({
    id,
    src: `/placeholder-${id}.jpg`,
    alt,
    title,
    // ... consistent structure
  })
}
```

### 4. Strategy Pattern

```typescript
// Different strategies for different interactions
const keyActions: Record<string, () => void> = {
  Escape: closeLightbox,
  ArrowLeft: () => previousImage(total),
  ArrowRight: () => nextImage(total),
}

const action = keyActions[event.key]
if (action) action()
```

### 5. Functional Programming

```typescript
// Pure function - no side effects, deterministic
const getNavItemClasses = (image: GalleryImage): string => {
  const baseClass = 'grid-item'
  return baseClass
}

// Immutability
const images = Object.freeze([...])
const image = Object.freeze({ ... })

// Composition
const currentImage = computed(() =>
  props.images[currentImageIndex.value]
)
```

## Performance Optimization

```
Current Optimizations:
├─ CSS Grid (GPU-accelerated)
├─ CSS Transitions (not JavaScript)
├─ Computed properties (cached)
├─ v-if for conditional rendering (not v-show)
├─ Minimal re-renders
└─ No external dependencies

Ready for:
├─ Lazy loading (loading="lazy")
├─ Image prefetching
├─ Progressive image loading
└─ Virtual scrolling (for large galleries)
```

## Accessibility Tree

```
<nav> AppNavbar
<main>
  <section class="hero">
    <h1>Welcome to Atelier Kaisla</h1>
    <p>Subtitle</p>
  </section>

  <section class="gallery-section">
    <header>
      <h2>Our Collection</h2>
      <p>Description</p>
    </header>

    <div class="image-grid">
      <div role="button" tabindex="0">  ← Keyboard accessible
        [Image placeholder]
      </div>
      <!-- ... more items -->
    </div>
  </section>
</main>

[Portal to body]
<div role="dialog" aria-modal="true">  ← Lightbox
  <button aria-label="Close lightbox">×</button>
  <button aria-label="Previous image">←</button>
  <button aria-label="Next image">→</button>
  <img alt="[Descriptive text]" />
</div>
```

## File Dependencies

```
index.vue
  │
  ├─── imports: ImageGrid.vue
  └─── imports: useGalleryData.ts
            │
            └─── imports: types/gallery.d.ts

ImageGrid.vue
  │
  ├─── imports: ImageLightbox.vue
  ├─── imports: useLightbox.ts
  └─── imports: types/gallery.d.ts

ImageLightbox.vue
  │
  ├─── imports: useLightbox.ts
  └─── imports: types/gallery.d.ts

useLightbox.ts
  └─── imports: vue (Ref)

useGalleryData.ts
  └─── imports: types/gallery.d.ts

types/gallery.d.ts
  └─── (No dependencies)
```

## Testing Strategy

```
Unit Tests:
├─ useLightbox.ts
│   ├─ State transitions
│   ├─ Navigation logic (circular)
│   └─ Body scroll locking
│
├─ useGalleryData.ts
│   ├─ Factory function
│   ├─ Generated image structure
│   └─ Immutability

Component Tests:
├─ ImageGrid.vue
│   ├─ Renders correct grid
│   ├─ Click handling
│   ├─ Keyboard navigation
│   └─ Responsive layout
│
└─ ImageLightbox.vue
    ├─ Opens/closes correctly
    ├─ Navigation works
    ├─ Keyboard shortcuts
    └─ Displays correct image

Integration Tests:
└─ Full user flow
    ├─ Click grid item → Lightbox opens
    ├─ Navigate images
    └─ Close and return to grid

E2E Tests:
└─ Real browser testing
    ├─ Different viewports
    ├─ Keyboard-only navigation
    └─ Screen reader compatibility
```

## Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Type-safe TypeScript
- ✅ Reactive state management
- ✅ Reusable composables
- ✅ Accessible by default
- ✅ Responsive design
- ✅ Extensible for future features
- ✅ Well-documented code
- ✅ Production-ready quality
