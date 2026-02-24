<script setup lang="ts">
/**
 * Wall Hanging Collection Page
 *
 * Displays the complete collection of handcrafted wall hangings fetched from the backend API.
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

// Page content composable - fetches CMS content for the intro section.
const { content: introContent, fetchSection: fetchIntro } = usePageContent('wall-hanging', 'intro')

// Intro computed values with static fallback if API returns nothing.
const introTitle = computed(() => introContent.value?.title || 'Wall Hanging Collection')

const defaultIntroDescription = '<p>Each wall hanging is thoughtfully designed and handwoven using traditional techniques. Natural materials, contemporary aesthetics, and timeless craftsmanship come together to create pieces that transform your space into a warm, welcoming sanctuary.</p>'

const introDescription = computed(() => {
  const raw = introContent.value?.content
  return sanitizeHtml(raw || defaultIntroDescription)
})

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
 * Fetch wall hangings using useAsyncData for proper SSR support
 * Pattern: Decorator Pattern - Loading/error states handled by Nuxt
 */
const config = useRuntimeConfig()

/**
 * Get API URL based on environment and execution context
 *
 * Development:
 *   - Client-side: http://localhost:4000/api (browser can't access Docker hostnames)
 *   - Server-side: http://backend:4000/api (Nuxt in Docker can access backend container)
 *
 * Production:
 *   - Client-side: https://api.lebowvsky.com (public URL)
 *   - Server-side: https://api.lebowvsky.com (public URL)
 */
const getApiUrl = (): string => {
  // Client-side (browser)
  if (import.meta.client) {
    // Production: use public API URL from environment
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl
    }
    // Development: force localhost (backend hostname not accessible from browser)
    return 'http://localhost:4000/api'
  }

  // Server-side (SSR): always use environment variable
  // Dev: http://backend:4000/api
  // Prod: https://api.lebowvsky.com
  return config.public.apiUrl
}

useAsyncData('wall-hanging-intro', () => fetchIntro(), { server: true })

const { data: products, error, pending: loading } = await useAsyncData(
  'wall-hanging-products',
  () => {
    const url = `${getApiUrl()}/products/category/wall-hanging`
    console.log(`[wall-hanging] Fetching from: ${url}`)
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
        <h1 class="page-header__title">{{ introTitle }}</h1>
        <div class="page-header__description" v-html="introDescription" />
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

        <!-- Error State -->
        <div
          v-if="error"
          class="error-message"
          role="alert"
        >
          <p>Unable to load wall hangings. Please try again later.</p>
          <button
            class="retry-button"
            @click="() => refreshNuxtData('wall-hanging-products')"
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

  @include tablet {
    font-size: $font-size-lg;
  }

  :deep(p) {
    margin: 0 0 $spacing-sm;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(strong) {
    font-weight: 700;
  }

  :deep(em) {
    font-style: italic;
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
