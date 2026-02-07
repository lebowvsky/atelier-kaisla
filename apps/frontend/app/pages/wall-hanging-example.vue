<script setup lang="ts">
/**
 * Wall Hanging Collection Page - Production Example
 *
 * This is a complete, production-ready example showing how to use:
 * - ArtworkCard component
 * - useArtworks composable
 * - Pattern-driven filtering and sorting
 *
 * To use this page:
 * 1. Rename to wall-hanging.vue (replacing the existing one)
 * 2. Or copy the relevant parts to the existing page
 *
 * Design Patterns:
 * - Strategy Pattern: Different card configurations
 * - Observer Pattern: Reactive filtering and sorting
 * - Facade Pattern: Simplified data management
 */

import type { ArtworkCardConfig } from '~/types/artwork'

// Composable for artwork data management
const { filterByCategory, getCountByCategory } = useArtworks()

// Filter wall hangings
const wallHangings = computed(() => filterByCategory('wall-hanging'))

// Get category counts
const counts = getCountByCategory()

// Strategy Pattern: Card configuration for product listing
const cardConfig: ArtworkCardConfig = {
  clickable: true,
  showPrice: true,
  showAvailability: true,
  enableHover: true,
  imageAspectRatio: '4/3'
}

// Sorting and filtering state
const sortOrder = ref<'asc' | 'desc' | 'title-asc' | 'title-desc'>('asc')
const showAvailableOnly = ref(false)

// Computed filtered and sorted artworks
const displayedArtworks = computed(() => {
  let artworks = wallHangings.value

  // Filter by availability
  if (showAvailableOnly.value) {
    artworks = artworks.filter(a => a.available !== false)
  }

  // Sort by selected order
  if (sortOrder.value === 'asc') {
    return [...artworks].sort((a, b) => (a.price || 0) - (b.price || 0))
  } else if (sortOrder.value === 'desc') {
    return [...artworks].sort((a, b) => (b.price || 0) - (a.price || 0))
  } else if (sortOrder.value === 'title-asc') {
    return [...artworks].sort((a, b) => a.title.localeCompare(b.title))
  } else {
    return [...artworks].sort((a, b) => b.title.localeCompare(a.title))
  }
})

// SEO metadata
useHead({
  title: 'Wall Hanging Collection'
})

useSeoMeta({
  title: 'Wall Hanging Collection | Atelier Kaisla',
  description: `Discover ${counts.value['wall-hanging']} unique handcrafted wall hangings. Each piece is woven with care using traditional techniques and sustainable materials.`,
  ogTitle: 'Wall Hanging Collection | Atelier Kaisla',
  ogDescription: 'Discover unique handcrafted wall hangings. Each piece is woven with care using traditional techniques.',
  ogImage: '/images/og-wall-hanging-collection.jpg',
  ogType: 'website'
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
      </header>

      <!-- Filters and Sort Controls -->
      <div class="controls">
        <div class="controls__info">
          <p class="controls__count">
            {{ displayedArtworks.length }} {{ displayedArtworks.length === 1 ? 'pièce' : 'pièces' }}
          </p>
        </div>

        <div class="controls__actions">
          <!-- Availability Filter -->
          <label class="controls__checkbox">
            <input
              v-model="showAvailableOnly"
              type="checkbox"
            >
            <span>Disponibles uniquement</span>
          </label>

          <!-- Sort Dropdown -->
          <select
            v-model="sortOrder"
            class="controls__select"
            aria-label="Trier les œuvres"
          >
            <option value="asc">
              Prix croissant
            </option>
            <option value="desc">
              Prix décroissant
            </option>
            <option value="title-asc">
              A-Z
            </option>
            <option value="title-desc">
              Z-A
            </option>
          </select>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="displayedArtworks.length === 0"
        class="empty-state"
      >
        <p class="empty-state__text">
          Aucune œuvre ne correspond à vos critères.
        </p>
        <button
          class="empty-state__button"
          @click="showAvailableOnly = false"
        >
          Afficher toutes les œuvres
        </button>
      </div>

      <!-- Artwork Grid -->
      <section
        v-else
        class="artwork-section"
        aria-label="Wall hanging collection"
      >
        <div class="artwork-grid">
          <ArtworkCard
            v-for="artwork in displayedArtworks"
            :key="artwork.id"
            :artwork="artwork"
            :config="cardConfig"
          />
        </div>
      </section>

      <!-- Additional Information Section -->
      <aside class="info-section">
        <h2 class="info-section__title">
          À propos de nos tissages muraux
        </h2>
        <div class="info-section__content">
          <p>
            Chaque tissage mural est une œuvre unique, créée à la main avec des matériaux
            durables et de haute qualité. Nous utilisons des techniques de tissage
            traditionnelles combinées à un design contemporain.
          </p>
          <p>
            Les dimensions indiquées peuvent varier légèrement en raison de la nature
            artisanale de chaque pièce. Pour toute question ou personnalisation,
            n'hésitez pas à nous contacter.
          </p>
        </div>
      </aside>
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
  margin-bottom: $spacing-2xl;
  text-align: center;

  @include tablet {
    margin-bottom: $spacing-3xl;
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
  margin: 0 auto;
  max-width: $container-content-width;
}

// Controls Section
.controls {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  padding: $spacing-md;
  background-color: $color-gray-100;
  border-radius: $border-radius-base;

  @include tablet {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.controls__info {
  flex: 1;
}

.controls__count {
  margin: 0;
  font-size: $font-size-base;
  font-weight: 600;
  color: $color-gray-900;
}

.controls__actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  @include tablet {
    flex-direction: row;
    align-items: center;
    gap: $spacing-md;
  }
}

.controls__checkbox {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-base;
  color: $color-gray-900;
  cursor: pointer;
  user-select: none;

  input[type='checkbox'] {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: $color-gray-600;
  }
}

.controls__select {
  padding: $spacing-xs $spacing-sm;
  font-size: $font-size-base;
  color: $color-gray-900;
  background-color: $color-white;
  border: 1px solid $color-gray-300;
  border-radius: calc($border-radius-base / 2);
  cursor: pointer;
  transition:
    border-color $transition-fast,
    box-shadow $transition-fast;

  @include focus-visible;

  &:hover {
    border-color: $color-gray-600;
  }
}

// Empty State
.empty-state {
  text-align: center;
  padding: $spacing-3xl $spacing-md;
}

.empty-state__text {
  font-size: $font-size-lg;
  color: $color-gray-600;
  margin: 0 0 $spacing-md;
}

.empty-state__button {
  padding: $spacing-sm $spacing-md;
  font-size: $font-size-base;
  font-weight: 500;
  color: $color-white;
  background-color: $color-black;
  border: none;
  border-radius: $border-radius-base;
  cursor: pointer;
  transition:
    background-color $transition-fast,
    transform $transition-fast;

  @include focus-visible;

  &:hover {
    background-color: $color-gray-900;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
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

// Info Section
.info-section {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-gray-100;
  border-radius: $border-radius-base;
  margin-top: $spacing-3xl;

  @include tablet {
    padding: $spacing-2xl $spacing-xl;
  }
}

.info-section__title {
  font-size: $font-size-2xl;
  font-weight: 600;
  color: $color-gray-900;
  margin: 0 0 $spacing-md;
  text-align: center;

  @include tablet {
    font-size: $font-size-3xl;
    margin-bottom: $spacing-lg;
  }
}

.info-section__content {
  max-width: $container-content-width;
  margin: 0 auto;

  p {
    font-size: $font-size-base;
    line-height: $line-height-base;
    color: $color-gray-600;
    margin: 0 0 $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Responsive adjustments
@include tablet {
  .wall-hanging-page {
    padding-top: $spacing-3xl;
  }
}

@include desktop {
  .artwork-section {
    margin-bottom: $spacing-2xl;
  }

  .controls {
    padding: $spacing-md $spacing-lg;
  }
}
</style>
