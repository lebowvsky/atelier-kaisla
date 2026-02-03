<script setup lang="ts">
/**
 * Rugs Collection Page
 *
 * Displays the complete collection of handcrafted rugs fetched from the backend API.
 * Features responsive grid layout, real API integration, loading states, and full SEO optimization.
 *
 * Design Patterns Applied:
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Simplifies complex API interactions through useProducts composable
 *
 * - @pattern Adapter Pattern
 * - @category Structural
 * - @purpose Converts backend Product entities to frontend Artwork interface
 *
 * - @pattern Observer Pattern (implicit through Vue reactivity)
 * - @category Behavioral
 * - @purpose Reactive data updates automatically propagate to child components
 *
 * Features:
 * - Real-time product fetching from backend API
 * - Responsive artwork grid with ArtworkList component
 * - Loading and error state management
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

import type { Product } from '~/types/product'
import { adaptProductToArtwork } from '~/composables/useProducts'

/**
 * Card configuration for rug display
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
 * Fetch rugs using useAsyncData for proper SSR support
 * Pattern: Decorator Pattern - Loading/error states handled by Nuxt
 */
const config = useRuntimeConfig()

// Get API URL based on environment (server vs client)
const getApiUrl = () => {
  if (import.meta.server) {
    return config.public.apiUrl || 'http://backend:4000/api'
  } else {
    return 'http://localhost:4000/api'
  }
}

const { data: products, error, pending: loading } = await useAsyncData(
  'rug-products',
  () => {
    const url = `${getApiUrl()}/products/category/rug`
    console.log(`[rugs] Fetching from: ${url}`)
    return $fetch<Product[]>(url)
  }
)

// Convert products to artworks using adapter pattern
const artworks = computed(() => {
  if (!products.value || !Array.isArray(products.value)) {
    return []
  }
  return products.value.map(adaptProductToArtwork)
})

// Page-specific SEO meta tags
useHead({
  title: 'Rugs Collection',
})

useSeoMeta({
  title: 'Rugs Collection | Atelier Kaisla',
  description:
    'Explore our collection of handcrafted rugs. Each piece is hand-knotted with premium materials to bring lasting beauty, warmth, and character to your home.',
  ogTitle: 'Rugs Collection | Atelier Kaisla',
  ogDescription:
    'Discover unique handwoven rugs. Premium natural materials, traditional knotting techniques, timeless designs.',
  ogImage: '/logo-kaisla.png',
  ogUrl: 'https://atelier-kaisla.com/rugs',
  twitterTitle: 'Rugs Collection | Atelier Kaisla',
  twitterDescription:
    'Explore our collection of handcrafted rugs made with premium natural materials.',
  twitterImage: '/logo-kaisla.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class="rugs-page">
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-header__title">Rugs Collection</h1>
        <p class="page-header__description">
          Each rug is meticulously hand-knotted using traditional weaving techniques passed down
          through generations. Premium natural fibers, timeless patterns, and exceptional
          craftsmanship come together to create pieces that bring warmth, comfort, and enduring
          beauty to your living space.
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
          Available Rugs
        </h2>

        <!-- Error State -->
        <div
          v-if="error"
          class="error-message"
          role="alert"
        >
          <p>Unable to load rugs. Please try again later.</p>
          <button
            class="retry-button"
            @click="() => refreshNuxtData('rug-products')"
          >
            Retry
          </button>
        </div>

        <!-- Product Grid -->
        <ArtworkList
          v-else
          :artworks="artworks"
          :loading="loading"
          :card-config="cardConfig"
          grid-layout="default"
          empty-message="No rugs are currently available. Please check back soon for new pieces."
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
          About Our Rugs
        </h2>

        <div class="info-section__content">
          <div class="info-card">
            <h3 class="info-card__title">Traditional Craftsmanship</h3>
            <p class="info-card__text">
              Every rug is hand-knotted using centuries-old techniques, ensuring exceptional
              durability and quality. Each piece takes weeks to complete and is built to last
              generations.
            </p>
          </div>

          <div class="info-card">
            <h3 class="info-card__title">Premium Natural Fibers</h3>
            <p class="info-card__text">
              We exclusively use the finest natural materials including pure new wool, organic
              cotton, and linen. Many rugs feature natural plant-based dyes for rich, lasting
              color.
            </p>
          </div>

          <div class="info-card">
            <h3 class="info-card__title">Custom Commissions</h3>
            <p class="info-card__text">
              Looking for a specific size or color palette? We create custom rugs tailored to your
              space and style preferences. Contact us to discuss your unique project.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rugs-page {
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

// Error Message
.error-message {
  text-align: center;
  padding: $spacing-2xl;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: $border-radius-base;
  margin: $spacing-xl 0;

  p {
    color: #c33;
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
  }
}

.retry-button {
  background-color: $color-black;
  color: $color-white;
  padding: $spacing-sm $spacing-lg;
  border: none;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: 600;
  cursor: pointer;
  transition: background-color $transition-base;

  &:hover {
    background-color: $color-gray-900;
  }

  &:focus {
    outline: 2px solid $color-black;
    outline-offset: 2px;
  }
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
