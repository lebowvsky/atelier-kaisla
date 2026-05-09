<script setup lang="ts">
/**
 * TheProductGallerySection Component
 *
 * Displays the product image gallery with a main image and a thumbnail strip.
 * Clicking a thumbnail swaps the main image (no carousel, no lightbox).
 *
 * Design Patterns Applied:
 * - @pattern State Pattern (lightweight)
 * - @category Behavioral
 * - @purpose Local UI state (selectedIndex) drives which image is rendered as
 *   the main visual. Reactive and pure.
 *
 * - @pattern Strategy Pattern (sortOrder)
 * - @category Behavioral
 * - @purpose Sorting strategy by ascending sortOrder is encapsulated in a
 *   computed so the parent doesn't have to pre-sort.
 *
 * Accessibility:
 * - Thumbnails are real `<button>` elements (keyboard reachable)
 * - aria-pressed indicates the active thumbnail
 * - Group is wrapped with role="group" + aria-label
 * - Focus visible uses cobalt outline
 */

import type { ProductImage } from '~/types/product'

interface Props {
  images: ProductImage[]
  productName: string
}

const props = defineProps<Props>()

const selectedIndex = ref(0)

/**
 * Strategy Pattern: deterministic ordering
 * Sort images by their `sortOrder` ascending so the gallery is stable.
 */
const sortedImages = computed<ProductImage[]>(() => {
  return [...props.images].sort((a, b) => a.sortOrder - b.sortOrder)
})

const activeImage = computed<ProductImage | null>(() => {
  return sortedImages.value[selectedIndex.value] ?? sortedImages.value[0] ?? null
})

const mainImageAlt = computed<string>(() => {
  if (activeImage.value && sortedImages.value.length > 1) {
    return `${props.productName} — vue ${selectedIndex.value + 1}`
  }
  return props.productName
})

const selectImage = (index: number): void => {
  if (index >= 0 && index < sortedImages.value.length) {
    selectedIndex.value = index
  }
}
</script>

<template>
  <section
    class="product-gallery"
    aria-label="Galerie d'images du produit"
  >
    <!-- Main image -->
    <figure class="product-gallery__main">
      <div class="product-gallery__main-frame">
        <NuxtImg
          v-if="activeImage"
          :key="activeImage.id"
          :src="activeImage.url"
          :alt="mainImageAlt"
          class="product-gallery__main-image"
          loading="eager"
          decoding="async"
          fetchpriority="high"
          format="webp"
          width="1200"
          height="1500"
          sizes="100vw md:50vw lg:60vw"
        />
        <div
          v-else
          class="product-gallery__placeholder"
          aria-hidden="true"
        />
      </div>
    </figure>

    <!-- Thumbnail strip (only when more than one image) -->
    <div
      v-if="sortedImages.length > 1"
      class="product-gallery__thumbs"
      role="group"
      aria-label="Sélection des vues du produit"
    >
      <button
        v-for="(image, index) in sortedImages"
        :key="image.id"
        type="button"
        class="product-gallery__thumb"
        :class="{ 'product-gallery__thumb--active': index === selectedIndex }"
        :aria-pressed="index === selectedIndex"
        :aria-label="`Voir la vue ${index + 1} de ${productName}`"
        @click="selectImage(index)"
      >
        <NuxtImg
          :src="image.url"
          :alt="''"
          class="product-gallery__thumb-image"
          loading="lazy"
          decoding="async"
          format="webp"
          width="200"
          height="200"
          sizes="120px"
        />
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  width: 100%;
}

.product-gallery__main {
  margin: 0;
  width: 100%;
}

.product-gallery__main-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background-color: $color-canvas-soft;
  border-radius: $border-radius-base;
}

.product-gallery__main-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity $transition-fast;
  }
}

.product-gallery__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    $color-canvas-soft 0%,
    $color-line 100%
  );
}

// --- Thumbnail strip ---
.product-gallery__thumbs {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: $spacing-xs;
  padding: $spacing-xs 0;
  overflow-x: auto;
  scroll-snap-type: x mandatory;

  // Hide scrollbar visually but keep accessibility
  scrollbar-width: thin;
  scrollbar-color: $color-line transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: $color-line;
    border-radius: $border-radius-sm;
  }

  @include tablet {
    gap: $spacing-sm;
    flex-wrap: wrap;
    overflow-x: visible;
  }
}

.product-gallery__thumb {
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
  padding: 0;
  margin: 0;
  border: 2px solid transparent;
  border-radius: $border-radius-base;
  background-color: $color-canvas-soft;
  cursor: pointer;
  overflow: hidden;
  scroll-snap-align: start;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      border-color $transition-fast,
      transform $transition-fast;
  }

  @include tablet {
    width: 88px;
    height: 88px;
  }

  &:hover {
    border-color: $color-line;
  }

  @include focus-visible;

  &--active {
    border-color: $color-fjord;
    outline: 2px solid $color-fjord;
    outline-offset: 4px;
  }
}

.product-gallery__thumb-image {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

@media (prefers-reduced-motion: reduce) {
  .product-gallery__thumb {
    transition: none;
  }
}
</style>
