# Image Gallery - Code Examples

## Basic Usage Examples

### Example 1: Simple Gallery (Default)

```vue
<!-- pages/gallery.vue -->
<script setup lang="ts">
const { galleryImages } = useGalleryData()
</script>

<template>
  <div class="page">
    <h1>Gallery</h1>
    <ImageGrid :images="galleryImages" />
  </div>
</template>
```

### Example 2: Custom Number of Images

```vue
<!-- pages/portfolio.vue -->
<script setup lang="ts">
const { getGalleryImages } = useGalleryData()

// Show only 8 images
const portfolioImages = getGalleryImages(8)
</script>

<template>
  <div class="page">
    <h1>Portfolio</h1>
    <ImageGrid :images="portfolioImages" />
  </div>
</template>
```

### Example 3: Multiple Galleries

```vue
<!-- pages/collections.vue -->
<script setup lang="ts">
const { getGalleryImages } = useGalleryData()

const rugsGallery = getGalleryImages(6)
const wallHangingsGallery = getGalleryImages(6)
</script>

<template>
  <div class="page">
    <section class="collection-section">
      <h2>Rugs</h2>
      <ImageGrid :images="rugsGallery" />
    </section>

    <section class="collection-section">
      <h2>Wall Hangings</h2>
      <ImageGrid :images="wallHangingsGallery" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.collection-section {
  margin-bottom: $spacing-3xl;
}
</style>
```

---

## Custom Image Data Examples

### Example 4: Hardcoded Images

```vue
<!-- pages/featured.vue -->
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

const featuredImages: GalleryImage[] = [
  {
    id: 'featured-1',
    src: '/images/featured/rug-blue-waves.jpg',
    alt: 'Blue Waves Handwoven Rug',
    title: 'Blue Waves',
    description: 'A stunning handwoven rug featuring oceanic blue tones and wave patterns.',
    width: 1200,
    height: 1200,
  },
  {
    id: 'featured-2',
    src: '/images/featured/wall-hanging-sunset.jpg',
    alt: 'Sunset Wall Hanging',
    title: 'Desert Sunset',
    description: 'Warm earth tones inspired by desert sunsets.',
    width: 1200,
    height: 1200,
  },
  // Add more images...
]
</script>

<template>
  <div class="page">
    <h1>Featured Works</h1>
    <ImageGrid :images="featuredImages" />
  </div>
</template>
```

### Example 5: Images from API (Future)

```vue
<!-- pages/shop.vue -->
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

// Fetch images from API
const { data: shopImages } = await useAsyncData<GalleryImage[]>(
  'shop-images',
  () => $fetch('/api/products')
)

// Provide fallback
const images = computed(() => shopImages.value || [])
</script>

<template>
  <div class="page">
    <h1>Shop</h1>
    <div v-if="images.length === 0">Loading...</div>
    <ImageGrid v-else :images="images" />
  </div>
</template>
```

### Example 6: Images from CMS (Strapi/Contentful)

```vue
<!-- pages/blog.vue -->
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

// Fetch from Strapi/Contentful
const { data: cmsData } = await useAsyncData('blog-images', async () => {
  const response = await $fetch('/api/cms/gallery')
  return response
})

// Transform CMS data to GalleryImage format
const galleryImages = computed<GalleryImage[]>(() => {
  if (!cmsData.value) return []

  return cmsData.value.map((item: any) => ({
    id: item.id.toString(),
    src: item.image.url,
    alt: item.image.alternativeText || item.title,
    title: item.title,
    description: item.description,
    width: item.image.width,
    height: item.image.height,
  }))
})
</script>

<template>
  <div class="page">
    <h1>Blog Gallery</h1>
    <ImageGrid :images="galleryImages" />
  </div>
</template>
```

---

## Using Custom Factory Functions

### Example 7: Create Images Dynamically

```vue
<script setup lang="ts">
const { createMockImage } = useGalleryData()

// Create custom images programmatically
const customGallery = [
  createMockImage(
    'custom-1',
    'Custom Artwork 1',
    'The First Piece',
    'A beautiful custom piece'
  ),
  createMockImage(
    'custom-2',
    'Custom Artwork 2',
    'The Second Piece',
    'Another stunning creation'
  ),
]
</script>

<template>
  <ImageGrid :images="customGallery" />
</template>
```

### Example 8: Generate from Array

```vue
<script setup lang="ts">
const { createMockImage } = useGalleryData()

const artworkTitles = [
  'Mountain Serenity',
  'Ocean Breeze',
  'Desert Dreams',
  'Forest Whispers',
]

const generatedGallery = artworkTitles.map((title, index) =>
  createMockImage(
    `artwork-${index + 1}`,
    `${title} Artwork`,
    title,
    `A handcrafted piece titled "${title}"`
  )
)
</script>

<template>
  <ImageGrid :images="generatedGallery" />
</template>
```

---

## Advanced Composable Usage

### Example 9: Programmatic Lightbox Control

```vue
<script setup lang="ts">
const { galleryImages } = useGalleryData()
const { openLightbox, closeLightbox, isOpen } = useLightbox()

// Open specific image programmatically
const showFirstImage = () => {
  openLightbox(0)
}

const showRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * galleryImages.value.length)
  openLightbox(randomIndex)
}
</script>

<template>
  <div class="page">
    <div class="controls">
      <button @click="showFirstImage">Show First Image</button>
      <button @click="showRandomImage">Show Random Image</button>
      <button v-if="isOpen" @click="closeLightbox">Close Lightbox</button>
    </div>

    <ImageGrid :images="galleryImages" />
  </div>
</template>
```

### Example 10: Watching Lightbox State

```vue
<script setup lang="ts">
const { galleryImages } = useGalleryData()
const { isOpen, currentImageIndex } = useLightbox()

// Track when lightbox opens/closes
watch(isOpen, (newValue) => {
  if (newValue) {
    console.log('Lightbox opened')
    // Analytics tracking
    // trackEvent('lightbox_opened')
  } else {
    console.log('Lightbox closed')
    // trackEvent('lightbox_closed')
  }
})

// Track current image changes
watch(currentImageIndex, (newIndex) => {
  const currentImage = galleryImages.value[newIndex]
  console.log('Viewing:', currentImage?.title)
  // trackEvent('image_viewed', { title: currentImage?.title })
})
</script>

<template>
  <ImageGrid :images="galleryImages" />
</template>
```

---

## Styling Examples

### Example 11: Custom Grid Spacing

```vue
<template>
  <ImageGrid :images="galleryImages" class="custom-grid" />
</template>

<style lang="scss" scoped>
.custom-grid :deep(.image-grid__container) {
  gap: $spacing-xl; // Larger gap (3rem instead of 2rem)
}
</style>
```

### Example 12: Custom Container Width

```vue
<template>
  <div class="narrow-container">
    <ImageGrid :images="galleryImages" />
  </div>
</template>

<style lang="scss" scoped>
.narrow-container {
  max-width: 900px;
  margin: 0 auto;
  padding: $spacing-md;
}
</style>
```

### Example 13: Custom Hover Effects

```vue
<template>
  <ImageGrid :images="galleryImages" class="fancy-grid" />
</template>

<style lang="scss" scoped>
.fancy-grid :deep(.grid-item) {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05) rotate(2deg);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
}
</style>
```

---

## Conditional Rendering Examples

### Example 14: Show/Hide Grid

```vue
<script setup lang="ts">
const { galleryImages } = useGalleryData()
const showGallery = ref(true)
</script>

<template>
  <div class="page">
    <button @click="showGallery = !showGallery">
      {{ showGallery ? 'Hide' : 'Show' }} Gallery
    </button>

    <Transition name="fade">
      <ImageGrid v-if="showGallery" :images="galleryImages" />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-base;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### Example 15: Loading State

```vue
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

const isLoading = ref(true)
const images = ref<GalleryImage[]>([])

onMounted(async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))

  const { galleryImages } = useGalleryData()
  images.value = galleryImages.value as GalleryImage[]
  isLoading.value = false
})
</script>

<template>
  <div class="page">
    <div v-if="isLoading" class="loading">
      <p>Loading gallery...</p>
    </div>

    <ImageGrid v-else :images="images" />
  </div>
</template>

<style lang="scss" scoped>
.loading {
  text-align: center;
  padding: $spacing-3xl;
  color: $color-gray-600;
}
</style>
```

### Example 16: Empty State

```vue
<script setup lang="ts">
const images = ref<GalleryImage[]>([])

const hasImages = computed(() => images.value.length > 0)
</script>

<template>
  <div class="page">
    <div v-if="!hasImages" class="empty-state">
      <h2>No Images Yet</h2>
      <p>Check back soon for new artwork!</p>
    </div>

    <ImageGrid v-else :images="images" />
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: $spacing-3xl;

  h2 {
    color: $color-gray-900;
    margin-bottom: $spacing-sm;
  }

  p {
    color: $color-gray-600;
  }
}
</style>
```

---

## Integration with Other Components

### Example 17: With Filtering

```vue
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

const { galleryImages } = useGalleryData()

const categories = ['All', 'Rugs', 'Wall Hangings', 'Cushions']
const selectedCategory = ref('All')

const filteredImages = computed(() => {
  if (selectedCategory.value === 'All') {
    return galleryImages.value
  }

  // Filter based on title (in real app, use proper category field)
  return galleryImages.value.filter((img: GalleryImage) =>
    img.title?.includes(selectedCategory.value)
  )
})
</script>

<template>
  <div class="page">
    <div class="filters">
      <button
        v-for="category in categories"
        :key="category"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <ImageGrid :images="filteredImages" />
  </div>
</template>

<style lang="scss" scoped>
.filters {
  display: flex;
  gap: $spacing-sm;
  justify-content: center;
  margin-bottom: $spacing-xl;

  button {
    padding: $spacing-xs $spacing-md;
    background: $color-gray-100;
    border: 1px solid $color-gray-300;
    border-radius: $border-radius-base;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: $color-gray-200;
    }

    &.active {
      background: $color-black;
      color: $color-white;
      border-color: $color-black;
    }
  }
}
</style>
```

### Example 18: With Search

```vue
<script setup lang="ts">
const { galleryImages } = useGalleryData()
const searchQuery = ref('')

const searchResults = computed(() => {
  if (!searchQuery.value) return galleryImages.value

  const query = searchQuery.value.toLowerCase()
  return galleryImages.value.filter((img: GalleryImage) =>
    img.title?.toLowerCase().includes(query) ||
    img.description?.toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="page">
    <div class="search">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search artworks..."
        class="search-input"
      />
    </div>

    <p v-if="searchQuery" class="results-count">
      Found {{ searchResults.length }} result(s)
    </p>

    <ImageGrid :images="searchResults" />
  </div>
</template>

<style lang="scss" scoped>
.search {
  max-width: 600px;
  margin: 0 auto $spacing-xl;
}

.search-input {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $color-gray-300;
  border-radius: $border-radius-base;
  font-size: $font-size-base;

  &:focus {
    outline: 2px solid $color-black;
    outline-offset: 2px;
  }
}

.results-count {
  text-align: center;
  color: $color-gray-600;
  margin-bottom: $spacing-md;
}
</style>
```

---

## TypeScript Examples

### Example 19: Custom Type Guards

```vue
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

// Type guard to check if image has title
const hasTitle = (image: GalleryImage): image is GalleryImage & { title: string } => {
  return Boolean(image.title)
}

const { galleryImages } = useGalleryData()

// Filter only images with titles
const titledImages = computed(() =>
  galleryImages.value.filter(hasTitle)
)
</script>

<template>
  <ImageGrid :images="titledImages" />
</template>
```

### Example 20: Custom Interface Extension

```vue
<script setup lang="ts">
import type { GalleryImage } from '~/types/gallery'

// Extend GalleryImage with custom properties
interface ProductImage extends GalleryImage {
  price: number
  inStock: boolean
  category: string
}

const productImages: ProductImage[] = [
  {
    id: 'product-1',
    src: '/images/product-1.jpg',
    alt: 'Handwoven Rug',
    title: 'Blue Rug',
    description: 'Beautiful handwoven rug',
    price: 299.99,
    inStock: true,
    category: 'rugs',
  },
  // ... more products
]

// Can still use with ImageGrid (it accepts base GalleryImage)
const galleryImages = computed<GalleryImage[]>(() => productImages)
</script>

<template>
  <div class="page">
    <ImageGrid :images="galleryImages" />

    <!-- Additional product info can be displayed separately -->
    <div class="product-info">
      <div v-for="product in productImages" :key="product.id">
        <h3>{{ product.title }}</h3>
        <p>${{ product.price }}</p>
        <span :class="{ 'in-stock': product.inStock }">
          {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
        </span>
      </div>
    </div>
  </div>
</template>
```

---

## Summary

These examples demonstrate:

1. **Basic Usage**: Simple gallery integration
2. **Custom Data**: Using your own images
3. **API Integration**: Fetching from backend
4. **Programmatic Control**: Controlling lightbox via code
5. **Styling**: Custom appearance
6. **Conditional Logic**: Loading, empty states
7. **Advanced Features**: Filtering, searching
8. **TypeScript**: Type safety and extensions

All examples follow Vue 3 Composition API, TypeScript best practices, and the design patterns established in the codebase.
