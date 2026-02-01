# Image Gallery - Quick Start Guide

## What Was Created

A complete, production-ready image gallery system with:
- Responsive grid layout (1/2/4 columns)
- Full-screen lightbox viewer
- Keyboard navigation
- Complete accessibility support
- Type-safe TypeScript implementation

## Files Created

```
app/
├── components/
│   ├── ImageGrid.vue           ✅ Main grid component
│   └── ImageLightbox.vue       ✅ Lightbox modal
├── composables/
│   ├── useLightbox.ts          ✅ State management
│   └── useGalleryData.ts       ✅ Mock data
└── types/
    └── gallery.d.ts            ✅ TypeScript types
```

## How to Use

### Basic Usage

```vue
<template>
  <ImageGrid :images="galleryImages" />
</template>

<script setup lang="ts">
const { galleryImages } = useGalleryData()
</script>
```

That's it! The grid automatically includes the lightbox.

### Custom Number of Images

```vue
<script setup lang="ts">
const { getGalleryImages } = useGalleryData()
const customGallery = getGalleryImages(8) // 8 images instead of 12
</script>

<template>
  <ImageGrid :images="customGallery" />
</template>
```

### Custom Image Data

```vue
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

const myImages: GalleryImage[] = [
  {
    id: '1',
    src: '/path/to/image.jpg',
    alt: 'Description',
    title: 'Artwork Title',
    description: 'Detailed description'
  },
  // ... more images
]
</script>

<template>
  <ImageGrid :images="myImages" />
</template>
```

## Features

### Grid
- ✅ Responsive (1 column mobile, 2 tablet, 4 desktop)
- ✅ Square images (1:1 aspect ratio)
- ✅ 2rem gap between images (~20px)
- ✅ Hover effects
- ✅ Click to open lightbox
- ✅ Keyboard accessible

### Lightbox
- ✅ Full-screen display
- ✅ Previous/Next navigation
- ✅ Image counter (e.g., "3 / 12")
- ✅ Keyboard shortcuts:
  - `Arrow Left/Right` - Navigate
  - `Escape` - Close
- ✅ Click backdrop to close
- ✅ Smooth animations
- ✅ Body scroll lock

## Current State

### Placeholders
Currently showing gray placeholder boxes with image alt text. This makes it easy to:
1. Verify layout and spacing
2. Test interactions
3. Replace with real images later

### Ready for Real Images
To use real images, simply provide proper `src` paths:

```typescript
const realImages: GalleryImage[] = [
  {
    id: 'rug-001',
    src: '/images/rugs/handwoven-blue.jpg',  // ← Real path
    alt: 'Handwoven Blue Rug',
    title: 'Handwoven Blue Rug',
    description: 'Crafted with sustainable materials...'
  }
]
```

Then uncomment the image loading in `ImageGrid.vue` (line ~100).

## Design Patterns Used

- **Observer Pattern**: Reactive lightbox state
- **Singleton Pattern**: Global lightbox control
- **Factory Pattern**: Image object creation
- **Strategy Pattern**: Different interactions (keyboard/click)
- **Functional Programming**: Pure functions, immutability

## SCSS Variables

Uses existing project variables:
- `$spacing-lg` (2rem) for gaps
- `$color-gray-200` for placeholders
- `$transition-base` for animations
- Responsive mixins: `@include tablet`, `@include desktop`

## Accessibility

- ✅ Full keyboard support
- ✅ ARIA labels on all controls
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Semantic HTML

## Next Steps

### Replace Mock Data
1. Create API endpoint for gallery images
2. Update `useGalleryData` to fetch from API
3. Add loading states

### Add Real Images
1. Upload images to `/public/images/` or CDN
2. Update image `src` paths
3. Uncomment lazy loading in `ImageGrid.vue`

### Optional Enhancements
- Add filtering by category
- Add image zoom in lightbox
- Add social sharing
- Add favorites functionality

## Testing

Start the dev server and test:

```bash
cd apps/frontend
npm run dev
```

Navigate to `http://localhost:3000` and:
1. Click any gray placeholder box
2. Lightbox should open
3. Test navigation arrows
4. Press Escape to close
5. Try keyboard navigation (Tab, Enter, Arrows)

## Reference

For detailed documentation, see:
- **Full docs**: `IMAGE-GALLERY-README.md`
- **Component code**: `app/components/ImageGrid.vue`
- **Type definitions**: `app/types/gallery.d.ts`

## Quick Troubleshooting

**Grid not showing?**
- Check that `galleryImages` has data
- Verify container has width

**Lightbox not opening?**
- Check browser console for errors
- Verify `useLightbox` is imported

**Images not loading?**
- Currently using placeholders (expected)
- Verify `src` paths when using real images

**Styling issues?**
- Ensure SCSS variables are imported
- Check browser DevTools for CSS conflicts
