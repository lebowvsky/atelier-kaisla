<script setup lang="ts">
/**
 * ArtworkCard Integration Example
 *
 * This example demonstrates how to integrate the ArtworkCard component
 * into a product listing page (Wall Hanging or Rugs).
 *
 * Design Patterns:
 * - Factory Pattern: Creating artwork objects with consistent structure
 * - Strategy Pattern: Different display configurations per use case
 * - Facade Pattern: Simplified data management through composable
 *
 * Usage:
 * Copy the relevant parts to your actual page (wall-hanging.vue or rugs.vue)
 */

import type { Artwork, ArtworkCardConfig } from '~/types/artwork'

/**
 * Factory Pattern: Create artwork data
 * In production, this would come from an API or CMS
 */
const wallHangings = ref<Artwork[]>([
  {
    id: 'wh-001',
    title: 'Desert Bloom',
    imageSrc: '/images/wall-hangings/desert-bloom.jpg',
    imageAlt: 'Handwoven wall hanging featuring warm desert tones with subtle floral patterns',
    dimensions: {
      width: 45,
      height: 60,
      unit: 'cm'
    },
    material: 'Merino wool and silk on cotton warp',
    description: 'Inspired by the delicate beauty of desert flowers blooming after rain. Soft earth tones create a warm, inviting atmosphere.',
    price: 245,
    available: true,
    category: 'wall-hanging',
    detailUrl: '/wall-hanging/desert-bloom'
  },
  {
    id: 'wh-002',
    title: 'Mountain Mist',
    imageSrc: '/images/wall-hangings/mountain-mist.jpg',
    imageAlt: 'Gray and white wall hanging with misty mountain landscape motif',
    dimensions: {
      width: 60,
      height: 80,
      unit: 'cm'
    },
    material: 'Alpaca wool blend',
    description: 'Capturing the serene beauty of foggy mountain mornings. Cool grays and whites bring tranquility to your space.',
    price: 295,
    available: true,
    category: 'wall-hanging',
    detailUrl: '/wall-hanging/mountain-mist'
  },
  {
    id: 'wh-003',
    title: 'Ocean Waves',
    imageSrc: '/images/wall-hangings/ocean-waves.jpg',
    imageAlt: 'Blue and teal wall hanging with abstract ocean wave patterns',
    dimensions: {
      width: 50,
      height: 70,
      unit: 'cm'
    },
    material: 'Organic cotton and recycled denim',
    description: 'The rhythmic movement of ocean waves transformed into textile art. Deep blues and teals evoke coastal serenity.',
    price: 275,
    available: false,
    category: 'wall-hanging',
    detailUrl: '/wall-hanging/ocean-waves'
  },
  {
    id: 'wh-004',
    title: 'Forest Path',
    imageSrc: '/images/wall-hangings/forest-path.jpg',
    imageAlt: 'Green and brown wall hanging depicting a forest trail',
    dimensions: {
      width: 55,
      height: 75,
      unit: 'cm'
    },
    material: '100% wool on linen warp',
    description: 'A peaceful walk through the woods captured in natural fibers. Rich greens and earthy browns create a grounding presence.',
    price: 265,
    available: true,
    category: 'wall-hanging',
    detailUrl: '/wall-hanging/forest-path'
  },
  {
    id: 'wh-005',
    title: 'Sunset Dreams',
    imageSrc: '/images/wall-hangings/sunset-dreams.jpg',
    imageAlt: 'Warm-toned wall hanging with sunset color gradients',
    dimensions: {
      width: 70,
      height: 90,
      unit: 'cm'
    },
    material: 'Merino wool and mohair',
    description: 'Golden hour hues woven into a statement piece. Warm oranges, pinks, and purples create a dreamy atmosphere.',
    price: 325,
    available: true,
    category: 'wall-hanging',
    detailUrl: '/wall-hanging/sunset-dreams'
  },
  {
    id: 'wh-006',
    title: 'Nordic Nights',
    imageSrc: '/images/wall-hangings/nordic-nights.jpg',
    imageAlt: 'Minimalist black and white wall hanging with geometric patterns',
    dimensions: {
      width: 40,
      height: 50,
      unit: 'cm'
    },
    material: 'Icelandic wool',
    description: 'Clean lines and stark contrasts inspired by Nordic design. A modern piece that complements minimalist interiors.',
    price: 215,
    available: true,
    category: 'wall-hanging',
    detailUrl: '/wall-hanging/nordic-nights'
  }
])

/**
 * Strategy Pattern: Configuration for product listing display
 */
const productCardConfig: ArtworkCardConfig = {
  clickable: true,
  showPrice: true,
  showAvailability: true,
  enableHover: true,
  imageAspectRatio: '4/3'
}

/**
 * Strategy Pattern: Alternative configuration for featured items
 */
const featuredCardConfig: ArtworkCardConfig = {
  clickable: true,
  showPrice: false,
  showAvailability: false,
  enableHover: true,
  imageAspectRatio: '3/4'
}

/**
 * Filter available artworks
 * Pure function for filtering
 */
const availableArtworks = computed(() => {
  return wallHangings.value.filter(artwork => artwork.available !== false)
})

/**
 * Count total artworks
 */
const totalCount = computed(() => wallHangings.value.length)
const availableCount = computed(() => availableArtworks.value.length)

/**
 * SEO Meta
 */
useHead({
  title: 'Wall Hanging Collection'
})

useSeoMeta({
  title: 'Wall Hanging Collection | Atelier Kaisla',
  description: `Explore our collection of ${totalCount.value} handcrafted wall hangings. Unique pieces designed to transform your space.`,
  ogTitle: 'Wall Hanging Collection | Atelier Kaisla',
  ogDescription: 'Explore our collection of handcrafted wall hangings. Unique pieces designed to transform your space.',
  ogImage: '/images/og-wall-hanging-collection.jpg'
})
</script>

<template>
  <div class="wall-hanging-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-header__title">
          Wall Hanging Collection
        </h1>
        <p class="page-header__description">
          Each piece is handcrafted with care, using traditional weaving techniques
          and sustainable materials. Transform your space with timeless textile art.
        </p>
        <p class="page-header__count">
          {{ availableCount }} of {{ totalCount }} artworks available
        </p>
      </header>

      <!-- Artwork Grid -->
      <section
        class="artwork-section"
        aria-label="Wall hanging collection"
      >
        <div class="artwork-grid">
          <ArtworkCard
            v-for="artwork in wallHangings"
            :key="artwork.id"
            :artwork="artwork"
            :config="productCardConfig"
          />
        </div>
      </section>

      <!-- Optional: Featured Section -->
      <section
        class="featured-section"
        aria-label="Featured wall hangings"
      >
        <h2 class="featured-section__title">
          Featured Pieces
        </h2>
        <div class="featured-grid">
          <ArtworkCard
            v-for="artwork in availableArtworks.slice(0, 3)"
            :key="`featured-${artwork.id}`"
            :artwork="artwork"
            :config="featuredCardConfig"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wall-hanging-page {
  @include page-wrapper;
}

.container {
  @include container;
}

// Page Header
.page-header {
  margin-bottom: $spacing-3xl;
  text-align: center;

  @include tablet {
    margin-bottom: $spacing-2xl;
  }
}

.page-header__title {
  font-size: $font-size-3xl;
  font-weight: 700;
  line-height: $line-height-tight;
  color: $color-gray-900;
  margin: 0 0 $spacing-md;

  @include tablet {
    font-size: $font-size-4xl;
  }
}

.page-header__description {
  font-size: $font-size-lg;
  line-height: $line-height-base;
  color: $color-gray-600;
  margin: 0 auto $spacing-sm;
  max-width: $container-content-width;
}

.page-header__count {
  font-size: $font-size-base;
  color: $color-gray-600;
  font-weight: 500;
  margin: $spacing-sm 0 0;
}

// Artwork Grid Section
.artwork-section {
  margin-bottom: $spacing-3xl;
}

.artwork-grid {
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

// Featured Section
.featured-section {
  padding-top: $spacing-3xl;
  border-top: 1px solid $color-gray-200;
}

.featured-section__title {
  font-size: $font-size-2xl;
  font-weight: 600;
  color: $color-gray-900;
  margin: 0 0 $spacing-xl;
  text-align: center;

  @include tablet {
    font-size: $font-size-3xl;
    margin-bottom: $spacing-2xl;
  }
}

.featured-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;

  @include tablet {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-lg;
  }
}

// Responsive spacing adjustments
@include tablet {
  .wall-hanging-page {
    padding-top: $spacing-3xl;
  }
}

@include desktop {
  .artwork-section {
    margin-bottom: $spacing-2xl;
  }
}
</style>
