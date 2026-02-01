<script setup lang="ts">
/**
 * Wall Hanging Collection Page
 *
 * Displays the complete collection of handcrafted wall hangings.
 * Features responsive grid layout, loading states, and full SEO optimization.
 *
 * Design Patterns Applied:
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Simplifies complex artwork data presentation through composables
 *
 * - @pattern Observer Pattern (implicit through Vue reactivity)
 * - @category Behavioral
 * - @purpose Reactive data updates automatically propagate to child components
 *
 * Features:
 * - Responsive artwork grid with ArtworkList component
 * - Loading state simulation (for future API integration)
 * - SEO optimized with comprehensive meta tags
 * - Accessible page structure with proper headings
 * - Configurable card display (clickable, hover effects)
 *
 * SEO & Accessibility:
 * - Semantic HTML structure with main landmark
 * - Proper heading hierarchy (h1, h2)
 * - Descriptive meta tags for search engines
 * - Open Graph and Twitter Card support
 */

import type { ArtworkCardConfig } from '~/types/artwork'

// Composable: Get artwork data
const { wallHangings } = useArtworkData()

// State: Loading simulation (in production, this would track API call status)
const isLoading = ref(false)

/**
 * Card configuration for wall hanging display
 * Strategy Pattern: Define display behavior for all cards
 */
const cardConfig: ArtworkCardConfig = {
  showPrice: true,
  showAvailability: true,
  clickable: true,
  imageAspectRatio: '4/3',
  enableHover: true,
}

/**
 * Simulate loading state on mount (for development purposes)
 * In production, this would be replaced with actual API call
 */
onMounted(() => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})

// Page-specific SEO meta tags
useHead({
  title: 'Wall Hanging Collection',
})

useSeoMeta({
  title: 'Wall Hanging Collection | Atelier Kaisla',
  description:
    'Explore our collection of handcrafted wall hangings. Each piece is uniquely designed and woven with natural materials to bring warmth and character to your space.',
  ogTitle: 'Wall Hanging Collection | Atelier Kaisla',
  ogDescription:
    'Discover unique handwoven wall art pieces. Sustainable materials, traditional techniques, contemporary designs.',
  ogImage: '/logo-kaisla.png',
  ogUrl: 'https://atelier-kaisla.com/wall-hanging',
  twitterTitle: 'Wall Hanging Collection | Atelier Kaisla',
  twitterDescription:
    'Explore our collection of handcrafted wall hangings made with natural materials.',
  twitterImage: '/logo-kaisla.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="wall-hanging-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-header__title">Wall Hanging Collection</h1>
        <p class="page-header__description">
          Each wall hanging is thoughtfully designed and handwoven using traditional techniques.
          Natural materials, contemporary aesthetics, and timeless craftsmanship come together
          to create pieces that transform your space into a warm, welcoming sanctuary.
        </p>
      </header>

      <!-- Artwork Grid -->
      <section
        class="artwork-section"
        aria-labelledby="collection-heading"
      >
        <h2
          id="collection-heading"
          class="visually-hidden"
        >
          Available Wall Hangings
        </h2>

        <ArtworkList
          :artworks="wallHangings"
          :loading="isLoading"
          :card-config="cardConfig"
          grid-layout="default"
          empty-message="No wall hangings are currently available. Please check back soon for new pieces."
          :skeleton-count="6"
        />
      </section>

      <!-- Additional Information Section -->
      <section
        class="info-section"
        aria-labelledby="info-heading"
      >
        <h2
          id="info-heading"
          class="info-section__title"
        >
          About Our Wall Hangings
        </h2>

        <div class="info-section__content">
          <div class="info-card">
            <h3 class="info-card__title">Handcrafted Quality</h3>
            <p class="info-card__text">
              Every piece is handwoven on a traditional loom, ensuring exceptional quality
              and attention to detail. No two pieces are exactly alike.
            </p>
          </div>

          <div class="info-card">
            <h3 class="info-card__title">Natural Materials</h3>
            <p class="info-card__text">
              We use only natural, sustainable materials including wool, cotton, linen, and jute.
              Many pieces feature plant-based natural dyes.
            </p>
          </div>

          <div class="info-card">
            <h3 class="info-card__title">Made to Order</h3>
            <p class="info-card__text">
              Interested in a custom piece? We offer made-to-order wall hangings in your choice
              of colors and dimensions. Contact us to discuss your vision.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wall-hanging-page {
  min-height: calc(100vh - $navbar-height);
  background-color: $color-white;
  padding: $spacing-2xl 0;

  @include tablet {
    padding: $spacing-3xl 0;
  }
}

.container {
  @include container;
}

// Page Header
.page-header {
  margin-bottom: $spacing-3xl;
  text-align: center;
  max-width: $container-content-width;
  margin-left: auto;
  margin-right: auto;
  padding: 0 $spacing-md;

  @include tablet {
    margin-bottom: $spacing-3xl;
    padding: 0 $spacing-lg;
  }
}

.page-header__title {
  font-size: $font-size-3xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-md;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-4xl;
    margin-bottom: $spacing-lg;
  }
}

.page-header__description {
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
  margin: 0;

  @include tablet {
    font-size: $font-size-lg;
  }
}

// Artwork Section
.artwork-section {
  margin-bottom: $spacing-3xl;
  padding: 0 $spacing-md;

  @include tablet {
    padding: 0 $spacing-lg;
  }
}

// Information Section
.info-section {
  background-color: $color-gray-100;
  padding: $spacing-2xl $spacing-md;
  border-radius: $border-radius-base;
  margin-top: $spacing-3xl;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.info-section__title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-black;
  margin-bottom: $spacing-xl;
  text-align: center;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-3xl;
    margin-bottom: $spacing-2xl;
  }
}

.info-section__content {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-lg;

  @include tablet {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-xl;
  }
}

.info-card {
  background-color: $color-white;
  padding: $spacing-lg;
  border-radius: $border-radius-base;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform $transition-base,
    box-shadow $transition-base;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  @include tablet {
    padding: $spacing-xl;
  }
}

.info-card__title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-black;
  margin-bottom: $spacing-sm;
  line-height: $line-height-tight;

  @include tablet {
    font-size: $font-size-xl;
  }
}

.info-card__text {
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
  margin: 0;
}

// Accessibility - Visually Hidden
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
