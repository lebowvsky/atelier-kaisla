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
import type { PageContentBlock } from '~/types/page-content'
import { adaptProductToArtwork } from '~/composables/useProducts'

const RUGS_INFO_FALLBACK: PageContentBlock[] = [
  {
    id: 'fallback-traditional-craftsmanship',
    title: 'Traditional Craftsmanship',
    description: 'Every rug is hand-knotted using centuries-old techniques, ensuring exceptional durability and quality. Each piece takes weeks to complete and is built to last generations.',
    sortOrder: 0,
  },
  {
    id: 'fallback-premium-natural-fibers',
    title: 'Premium Natural Fibers',
    description: 'We exclusively use the finest natural materials including pure new wool, organic cotton, and linen. Many rugs feature natural plant-based dyes for rich, lasting color.',
    sortOrder: 1,
  },
  {
    id: 'fallback-custom-commissions',
    title: 'Custom Commissions',
    description: 'Looking for a specific size or color palette? We create custom rugs tailored to your space and style preferences. Contact us to discuss your unique project.',
    sortOrder: 2,
  },
]

// Page content composables - intro powers the page header (eyebrow + title +
// description), info powers the lower information section.
const { content: introContent, fetchSection: fetchIntro } = usePageContent('rugs', 'intro')
const { content: infoContent, fetchSection: fetchInfo } = usePageContent('rugs', 'info')

// Intro computed values with static fallback if API returns nothing.
const headerEyebrow = computed(() => introContent.value?.eyebrow || 'Collection')
const introTitle = computed(() => introContent.value?.title || 'Rugs Collection')

// Info section computed values with static fallbacks if API returns nothing.
const infoEyebrow = computed(() => infoContent.value?.eyebrow || 'Why Atelier Kaisla')
const infoTitle = computed(() => infoContent.value?.title || 'About our rugs')

const infoBlocks = computed<PageContentBlock[]>(() =>
  infoContent.value?.blocks?.length ? infoContent.value.blocks : RUGS_INFO_FALLBACK,
)

const defaultIntroDescription = '<p>Each rug is meticulously hand-knotted using traditional weaving techniques passed down through generations. Premium natural fibers, timeless patterns, and exceptional craftsmanship come together to create pieces that bring warmth, comfort, and enduring beauty to your living space.</p>'

const introDescription = computed(() => {
  const raw = introContent.value?.content
  return sanitizeHtml(raw || defaultIntroDescription)
})

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
const { apiFetch } = useApi()

await Promise.all([
  fetchIntro(),
  fetchInfo(),
])

const { data: products, error, pending: loading } = await useAsyncData(
  'rug-products',
  () => apiFetch<Product[]>('/products/category/rug'),
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
  title: 'Handcrafted Rugs',
  description:
    "Handcrafted rugs by Atelier Kaisla. Traditional knotting, exceptional natural fibres and contemporary design to dress your home with longevity.",
  image: '/logo-kaisla.png',
  type: 'website'
})

useCollectionPageSchema('Rugs')
</script>

<template>
  <div class="rugs-page">
    <Breadcrumbs :items="[{ name: 'Rugs' }]" />
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
          <div
            v-for="block in infoBlocks"
            :key="block.id ?? block.title"
            class="info-block"
          >
            <h3 class="info-block__title">{{ block.title }}</h3>
            <p class="info-block__text">{{ block.description }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rugs-page {
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
  @include hero-subtitle($font-size-base, $font-size-lg);
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
