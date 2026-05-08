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

// Page content composables - intro powers the page header (eyebrow + title +
// description), info powers the lower information section.
const { content: introContent, fetchSection: fetchIntro } = usePageContent('wall-hanging', 'intro')
const { content: infoContent, fetchSection: fetchInfo } = usePageContent('wall-hanging', 'info')

// Intro computed values with static fallback if API returns nothing.
const headerEyebrow = computed(() => introContent.value?.eyebrow || 'Collection')
const introTitle = computed(() => introContent.value?.title || 'Wall Hanging Collection')

// Info section computed values with static fallbacks if API returns nothing.
const infoEyebrow = computed(() => infoContent.value?.eyebrow || 'Why Atelier Kaisla')
const infoTitle = computed(() => infoContent.value?.title || 'About our wall hangings')

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

await Promise.all([
  fetchIntro(),
  fetchInfo(),
])

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
useSeo({
  title: 'Handcrafted Wall Hangings',
  description:
    'Collection of handcrafted wall hangings by Atelier Kaisla. Unique pieces in natural materials, contemporary design inspired by organic forms.',
  image: '/logo-kaisla.png',
  type: 'website'
})

useCollectionPageSchema('Wall Hangings')
</script>

<template>
  <div class="wall-hanging-page">
    <Breadcrumbs :items="[{ name: 'Wall Hangings' }]" />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="page-header__heading">
          <span class="page-header__eyebrow">{{ headerEyebrow }}</span>
          <h1 class="page-header__title">{{ introTitle }}</h1>
          <span class="page-header__hairline" aria-hidden="true" />
        </div>
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
        <header class="info-section__header">
          <span class="info-section__eyebrow">{{ infoEyebrow }}</span>
          <h2
            id="info-heading"
            class="info-section__title"
          >
            {{ infoTitle }}
          </h2>
          <span class="info-section__hairline" aria-hidden="true" />
        </header>

        <div class="info-section__content">
          <div class="info-block">
            <h3 class="info-block__title">Handcrafted Quality</h3>
            <p class="info-block__text">
              Every piece is handwoven on a traditional loom, ensuring exceptional quality
              and attention to detail. No two pieces are exactly alike.
            </p>
          </div>

          <div class="info-block">
            <h3 class="info-block__title">Natural Materials</h3>
            <p class="info-block__text">
              We use only natural, sustainable materials including wool, cotton, linen, and jute.
              Many pieces feature plant-based natural dyes.
            </p>
          </div>

          <div class="info-block">
            <h3 class="info-block__title">Made to Order</h3>
            <p class="info-block__text">
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
  background-color: $color-canvas;
  padding-bottom: $spacing-2xl;

  @include tablet {
    padding-bottom: $spacing-3xl;
  }
}

.container {
  @include container;
}

// --- Page Header ---
.page-header {
  margin-bottom: $spacing-3xl;
  padding: $spacing-2xl $spacing-md 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  @include tablet {
    padding: $spacing-3xl $spacing-lg 0;
    display: grid;
    grid-template-columns: 2fr 3fr;
    gap: $spacing-2xl;
    align-items: start;
  }
}

.page-header__heading {
  display: flex;
  flex-direction: column;
}

.page-header__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.page-header__title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;

  @include tablet {
    font-size: $font-size-display;
  }
}

.page-header__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
}

.page-header__description {
  @include reading-column;
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;

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
    font-weight: $font-weight-bold;
  }

  :deep(em) {
    font-style: italic;
  }
}

// --- Artwork Section ---
.artwork-section {
  margin-bottom: $spacing-3xl;
  padding: 0 $spacing-md;

  @include tablet {
    padding: 0 $spacing-lg;
  }
}

// --- Information Section ---
.info-section {
  background-color: $color-canvas;
  padding: $spacing-2xl $spacing-md;
  margin-top: $spacing-3xl;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }
}

.info-section__header {
  margin-bottom: $spacing-2xl;
  display: flex;
  flex-direction: column;

  @include tablet {
    margin-bottom: $spacing-3xl;
  }
}

.info-section__eyebrow {
  @include eyebrow;
  margin: 0 0 $spacing-sm;
}

.info-section__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;

  @include tablet {
    font-size: $font-size-3xl;
  }
}

.info-section__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
}

.info-section__content {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;

  @include tablet {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-2xl;
  }
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.info-block__title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-ink;
  margin: 0;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;

  @include tablet {
    font-size: $font-size-xl;
  }
}

.info-block__text {
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-relaxed;
  margin: 0;
}

// --- Error Message ---
.error-message {
  text-align: left;
  padding: $spacing-2xl;
  background-color: $color-danger-bg;
  border: 1px solid $color-danger-border;
  border-radius: $border-radius-base;
  margin: $spacing-xl 0;

  p {
    color: $color-danger-text;
    font-size: $font-size-lg;
    margin-bottom: $spacing-md;
  }
}

.retry-button {
  background-color: $color-ink;
  color: $color-canvas;
  padding: $spacing-sm $spacing-lg;
  border: none;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  cursor: pointer;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 2px;
  }
}

// --- Accessibility ---
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

// --- Reduced motion ---
@media (prefers-reduced-motion: reduce) {
  .retry-button {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
