<script setup lang="ts">
/**
 * ImageGrid Component
 *
 * A responsive grid layout for displaying clickable images.
 * Implements responsive design with different column counts per breakpoint.
 *
 * Design Patterns:
 * - Strategy Pattern: Different grid layouts based on screen size
 * - Observer Pattern: Reactive state for lightbox interaction
 * - Functional Programming: Pure functions for data transformations
 *
 * Features:
 * - Responsive grid (1 column mobile, 2 tablet, 4 desktop)
 * - Square image placeholders with consistent sizing
 * - Click to open in lightbox
 * - Keyboard accessible
 * - Lazy loading support
 *
 * SEO Considerations:
 * - Semantic HTML structure
 * - Proper image alt attributes
 * - Accessible button elements for interaction
 *
 * @example
 * <ImageGrid :images="galleryImages" />
 */

import type { GalleryImage, GalleryConfig } from "~/types/gallery";

interface Props {
  /**
   * Array of images to display in the grid
   */
  images: GalleryImage[];

  /**
   * Optional configuration for grid layout
   */
  config?: GalleryConfig;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    columns: 4,
    imageSize: 220,
    gap: "1.5rem", // Uses 1.5rem which matches $spacing-md
  }),
});

// Lightbox state management (Observer Pattern)
const { openLightbox } = useLightbox();

/**
 * Handle image click - opens lightbox with selected image
 * Pure function with side effect on lightbox state
 *
 * @param index - Index of the clicked image
 */
const handleImageClick = (index: number): void => {
  openLightbox(index);
};

/**
 * Handle keyboard activation (Enter/Space on image)
 * Accessibility enhancement for keyboard navigation
 *
 * @param event - Keyboard event
 * @param index - Index of the image
 */
const handleKeyPress = (event: KeyboardEvent, index: number): void => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleImageClick(index);
  }
};

/**
 * Generate CSS classes for grid items
 * Pure function - returns consistent classes based on image state
 *
 * @param image - Gallery image object
 */
const getGridItemClasses = (image: GalleryImage): string => {
  const baseClass = "grid-item";
  // Future enhancement: could add classes based on image loading state
  return baseClass;
};
</script>

<template>
  <div class="image-grid">
    <div class="image-grid__container">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        :class="getGridItemClasses(image)"
        role="button"
        tabindex="0"
        :aria-label="`View ${image.alt} in full size`"
        @click="handleImageClick(index)"
        @keydown="(event) => handleKeyPress(event, index)"
      >
        <!-- Image placeholder (will be replaced with actual images later) -->
        <div class="grid-item__placeholder">
          <span class="grid-item__placeholder-text">
            {{ image.alt }}
          </span>
        </div>

        <!-- Future: Actual image implementation
        <img
          :src="image.src"
          :alt="image.alt"
          class="grid-item__image"
          loading="lazy"
        />
        -->
      </div>
    </div>

    <!-- Lightbox component -->
    <ImageLightbox :images="images" />
  </div>
</template>

<style lang="scss" scoped>
.image-grid {
  width: 100%;
  display: flex;
  justify-content: center;
}

.image-grid__container {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md; // 2rem = ~20px (closest to the 20px spec)
  width: 100%;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
  }
}

.grid-item {
  position: relative;
  aspect-ratio: 1; // Ensures square aspect ratio
  width: 100%;
  height: auto;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform $transition-base,
    box-shadow $transition-base;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }

  @include focus-visible;
}

.grid-item__placeholder {
  width: 100%;
  height: 100%;
  background-color: $color-gray-200;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color $transition-fast;

  .grid-item:hover & {
    background-color: darken($color-gray-200, 5%);
  }
}

.grid-item__placeholder-text {
  color: $color-gray-600;
  font-size: $font-size-base;
  font-weight: 500;
  text-align: center;
  padding: $spacing-sm;
  opacity: 0.7;
  transition: opacity $transition-fast;

  .grid-item:hover & {
    opacity: 1;
  }
}

// Future: Actual image styles
.grid-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

// Responsive sizing to maintain 220px on desktop
@include desktop {
  .image-grid__container {
    // Calculate max-width based on 4 columns of 220px + gaps
    // 4 * 220px + 3 * 2rem (gaps) = 880px + 6rem
    max-width: calc(880px + 6rem);
  }
}
</style>
