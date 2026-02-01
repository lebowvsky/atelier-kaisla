# Image Gallery - Visual Guide

## Component Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ATELIER KAISLA                              │
│                           [NAVBAR]                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│              Welcome to Atelier Kaisla (h1)                         │
│        Handcrafted wall art and rugs, designed with passion         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Our Collection (h2)                          │
│         Explore our handcrafted pieces. Click to view full size.   │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │          │  │          │  │          │  │          │          │
│  │  Image 1 │  │  Image 2 │  │  Image 3 │  │  Image 4 │          │
│  │  220x220 │  │  220x220 │  │  220x220 │  │  220x220 │          │
│  │          │  │          │  │          │  │          │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│       ↑ 2rem gap →                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │          │  │          │  │          │  │          │          │
│  │  Image 5 │  │  Image 6 │  │  Image 7 │  │  Image 8 │          │
│  │  220x220 │  │  220x220 │  │  220x220 │  │  220x220 │          │
│  │          │  │          │  │          │  │          │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │          │  │          │  │          │  │          │          │
│  │  Image 9 │  │ Image 10 │  │ Image 11 │  │ Image 12 │          │
│  │  220x220 │  │  220x220 │  │  220x220 │  │  220x220 │          │
│  │          │  │          │  │          │  │          │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Hover State

```
┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐
│          │  │          │  │           │  │          │
│  Image 1 │  │  Image 2 │  │  Image 3  │  │  Image 4 │
│          │  │          │  │ (HOVERED) │  │          │
│          │  │          │  │  Scale↑   │  │          │
└──────────┘  └──────────┘  └─Shadow────┘  └──────────┘
                                 ↑
                           Cursor: pointer
                           Transform: scale(1.02)
                           Box-shadow: elevated
```

## Lightbox Opened (Full Screen)

```
╔═══════════════════════════════════════════════════════════════════╗
║ Background: rgba(0,0,0,0.95) - Full viewport                    [×]
║                                                                     ║
║                                                                     ║
║        [←]                                                    [→]   ║
║        Prev                                                   Next  ║
║                                                                     ║
║                      ┌──────────────────┐                          ║
║                      │                  │                          ║
║                      │                  │                          ║
║                      │   IMAGE DISPLAY  │                          ║
║                      │   Max-width 100% │                          ║
║                      │   Max-height calc│                          ║
║                      │                  │                          ║
║                      │                  │                          ║
║                      └──────────────────┘                          ║
║                                                                     ║
║                      Artwork Title (h2)                             ║
║                 This is the image description...                    ║
║                                                                     ║
║                         ┌──────┐                                   ║
║                         │ 3/12 │  ← Counter                         ║
║                         └──────┘                                   ║
║                                                                     ║
╚═══════════════════════════════════════════════════════════════════╝

Keyboard shortcuts:
- Escape: Close
- Arrow Left: Previous
- Arrow Right: Next
- Click backdrop: Close
```

## Responsive Layouts

### Mobile (< 768px)

```
┌─────────────────────┐
│     Our Collection  │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │    Image 1    │  │
│  │   Full Width  │  │
│  │               │  │
│  └───────────────┘  │
│         ↓           │
│      2rem gap       │
│         ↓           │
│  ┌───────────────┐  │
│  │               │  │
│  │    Image 2    │  │
│  │   Full Width  │  │
│  │               │  │
│  └───────────────┘  │
│         ↓           │
│      2rem gap       │
│         ↓           │
│  ┌───────────────┐  │
│  │               │  │
│  │    Image 3    │  │
│  │   Full Width  │  │
│  │               │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘

1 column layout
Images stack vertically
```

### Tablet (768px - 1023px)

```
┌─────────────────────────────────────┐
│         Our Collection              │
│                                     │
│  ┌──────────┐    ┌──────────┐      │
│  │          │    │          │      │
│  │ Image 1  │    │ Image 2  │      │
│  │  ~50%    │    │  ~50%    │      │
│  │          │    │          │      │
│  └──────────┘    └──────────┘      │
│         ↑ 2rem gap →               │
│  ┌──────────┐    ┌──────────┐      │
│  │          │    │          │      │
│  │ Image 3  │    │ Image 4  │      │
│  │  ~50%    │    │  ~50%    │      │
│  │          │    │          │      │
│  └──────────┘    └──────────┘      │
│                                     │
└─────────────────────────────────────┘

2 columns layout
Images side by side
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    useGalleryData()                         │
│                                                             │
│  generateMockGallery(12)                                    │
│         │                                                   │
│         ├─→ createMockImage('image-1', 'Gallery image 1')  │
│         ├─→ createMockImage('image-2', 'Gallery image 2')  │
│         └─→ ... (x12)                                       │
│                                                             │
│  Returns: galleryImages (Computed<GalleryImage[]>)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    index.vue (Page)                         │
│                                                             │
│  <ImageGrid :images="galleryImages" />                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   ImageGrid.vue                             │
│                                                             │
│  v-for image in images:                                     │
│    ┌───────────────────────┐                               │
│    │  <div @click>         │                               │
│    │    [Placeholder]      │                               │
│    │  </div>               │                               │
│    └───────────────────────┘                               │
│             │                                               │
│             │ User clicks                                   │
│             ↓                                               │
│    handleImageClick(index)                                  │
│             │                                               │
│             ↓                                               │
│    useLightbox.openLightbox(index)                          │
│                                                             │
│    <ImageLightbox :images="images" />                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  useLightbox (State)                        │
│                                                             │
│  State:                                                     │
│  ┌─────────────────────────────┐                           │
│  │ isOpen = true               │                           │
│  │ currentImageIndex = index   │                           │
│  └─────────────────────────────┘                           │
│             │                                               │
│             │ Reactive updates                              │
│             ↓                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                 ImageLightbox.vue                           │
│                                                             │
│  Watches: isOpen, currentImageIndex                         │
│  Shows when: isOpen === true                                │
│  Displays: images[currentImageIndex]                        │
│                                                             │
│  User Actions:                                              │
│  - Click [×] → closeLightbox()                              │
│  - Click [→] → nextImage()                                  │
│  - Click [←] → previousImage()                              │
│  - Press Esc → closeLightbox()                              │
└─────────────────────────────────────────────────────────────┘
```

## State Transitions

```
Initial State:
┌──────────────────────┐
│ isOpen = false       │
│ currentImageIndex = 0│
└──────────────────────┘

User clicks Image #3:
         │
         ↓
┌──────────────────────┐
│ openLightbox(2)      │ (index 2 = 3rd image)
└──────────────────────┘
         │
         ↓
┌──────────────────────┐
│ isOpen = true        │
│ currentImageIndex = 2│
│ body.overflow=hidden │
└──────────────────────┘
         │
         ↓
    Lightbox renders
         │
User presses → key:
         │
         ↓
┌──────────────────────┐
│ nextImage(12)        │
└──────────────────────┘
         │
         ↓
┌──────────────────────┐
│ isOpen = true        │
│ currentImageIndex = 3│ (2 + 1) % 12
└──────────────────────┘
         │
         ↓
  Lightbox updates
         │
User presses Esc:
         │
         ↓
┌──────────────────────┐
│ closeLightbox()      │
└──────────────────────┘
         │
         ↓
┌──────────────────────┐
│ isOpen = false       │
│ currentImageIndex = 3│ (preserved)
│ body.overflow = ''   │
└──────────────────────┘
         │
         ↓
   Lightbox unmounts
```

## Component Interaction Flow

```
                    Page Renders
                         ↓
         ┌───────────────────────────┐
         │      index.vue            │
         │  (Imports composables)    │
         └───────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ↓                         ↓
┌──────────────┐          ┌──────────────┐
│ImageGrid.vue │          │ useGalleryData│
│              │←─────────│  composable   │
│ Renders grid │  images  └───────────────┘
│              │
│ Contains:    │
│ ImageLightbox│
└──────┬───────┘
       │
       │ User clicks
       │
       ↓
┌──────────────────┐
│  useLightbox     │
│  composable      │
│                  │
│ - openLightbox() │
│ - isOpen ←────┐  │
│ - index ←─────┤  │
└────────┬───────┘ │
         │         │
         │ Observes│
         ↓         │
┌──────────────────┴──┐
│ ImageLightbox.vue   │
│                     │
│ - Watches state     │
│ - Renders modal     │
│ - Handles keyboard  │
│ - Teleports to body │
└─────────────────────┘
```

## File Dependencies Graph

```
index.vue
    ├─→ ImageGrid.vue
    │       ├─→ ImageLightbox.vue
    │       │       ├─→ useLightbox.ts
    │       │       └─→ types/gallery.d.ts
    │       ├─→ useLightbox.ts
    │       └─→ types/gallery.d.ts
    │
    └─→ useGalleryData.ts
            └─→ types/gallery.d.ts

types/gallery.d.ts (no dependencies)
useLightbox.ts (vue only)
```

## Accessibility Tree

```
<nav> AppNavbar
  <ul role="menubar">
    <li role="menuitem"><a>Home</a></li>
    <li role="menuitem"><a>Wall Hanging</a></li>
    ...

<main id="main-content">
  <section class="hero">
    <h1>Welcome to Atelier Kaisla</h1>  ← Main heading
    <p>Subtitle</p>

  <section class="gallery-section">
    <header>
      <h2>Our Collection</h2>  ← Section heading
      <p>Description</p>

    <div class="image-grid">
      <div role="button" tabindex="0" aria-label="View ... in full size">
        [Image 1]  ← Keyboard accessible
      <div role="button" tabindex="0" aria-label="View ... in full size">
        [Image 2]
      ...

[Teleport to body when lightbox opens]
<div role="dialog" aria-modal="true" aria-label="Image lightbox">
  <button aria-label="Close lightbox">[×]</button>
  <button aria-label="Previous image">[←]</button>
  <button aria-label="Next image">[→]</button>
  <img alt="Descriptive text" />
  <div aria-live="polite">3 / 12</div>  ← Announced to screen readers
```

## CSS Grid Visualization

```
Desktop Grid (grid-template-columns: repeat(4, 1fr)):

  Col 1      Col 2      Col 3      Col 4
┌────────┬─────────┬─────────┬─────────┐
│        │         │         │         │  Row 1
│ Item 1 │ Item 2  │ Item 3  │ Item 4  │
│ 1fr    │ 1fr     │ 1fr     │ 1fr     │
└────────┴─────────┴─────────┴─────────┘
    ↑ gap: 2rem →
┌────────┬─────────┬─────────┬─────────┐
│        │         │         │         │  Row 2
│ Item 5 │ Item 6  │ Item 7  │ Item 8  │
│        │         │         │         │
└────────┴─────────┴─────────┴─────────┘
    ↑ gap: 2rem →
┌────────┬─────────┬─────────┬─────────┐
│        │         │         │         │  Row 3
│ Item 9 │ Item 10 │ Item 11 │ Item 12 │
│        │         │         │         │
└────────┴─────────┴─────────┴─────────┘

Each item: aspect-ratio: 1 (square)
```

## Animation Timeline

```
Lightbox Opening:

0ms:    v-if="true" triggers
        ↓
50ms:   .lightbox-fade-enter-from
        - opacity: 0
        ↓
100ms:  .lightbox-fade-enter-active
        - transition starts
        - opacity: 0 → 1 (300ms)
        ↓
150ms:  .lightbox__content animation
        - transform: scale(0.9) → scale(1)
        - opacity: 0 → 1
        ↓
400ms:  Animation complete
        - Full opacity
        - Normal scale
```

## Summary

This visual guide shows:
- Layout structure at different breakpoints
- Component interaction patterns
- Data flow through the system
- State management visualization
- Accessibility structure
- CSS Grid implementation
- Animation sequences

All diagrams represent the actual implementation in the codebase.
