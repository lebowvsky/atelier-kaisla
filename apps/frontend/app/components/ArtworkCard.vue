<script setup lang="ts">
/**
 * ArtworkCard Component
 *
 * A reusable card component for displaying artwork pieces (wall hangings and rugs).
 * Showcases artwork image, title, dimensions, materials, and description in a visually
 * appealing and accessible format.
 *
 * Design Patterns Applied:
 * - @pattern Strategy Pattern
 * - @category Behavioral
 * - @purpose Configurable display behavior (clickable, pricing, hover effects)
 *
 * - @pattern Adapter Pattern
 * - @category Structural
 * - @purpose Adapts dimension data to user-friendly display format
 *
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Simplifies complex artwork data presentation into a single interface
 *
 * Features:
 * - Responsive image display with aspect ratio preservation
 * - Configurable pricing and availability display
 * - Optional click-to-detail navigation
 * - Keyboard accessible
 * - ARIA compliant for screen readers
 * - Lazy loading for images
 * - Hover effects for enhanced UX
 *
 * SEO & Accessibility:
 * - Semantic HTML structure (article, figure, figcaption)
 * - Proper heading hierarchy
 * - Descriptive alt text
 * - ARIA labels for interactive elements
 * - Focus-visible states
 *
 * @example
 * ```typescript
 * <ArtworkCard
 *   :artwork="artworkData"
 *   :config="{ clickable: true, showPrice: true }"
 * />
 * ```
 */

import type { Artwork, ArtworkCardConfig } from '~/types/artwork'

interface Props {
  /**
   * Artwork data to display
   */
  artwork: Artwork

  /**
   * Optional configuration for card behavior and display
   */
  config?: ArtworkCardConfig
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    showPrice: false,
    showAvailability: false,
    clickable: false,
    imageAspectRatio: '4/3',
    enableHover: true,
  }),
})

/**
 * Facade Pattern: Simplify dimension formatting
 * Adapts raw dimension data to human-readable format
 *
 * @returns Formatted dimension string (e.g., "50 × 70 cm")
 */
const formattedDimensions = computed((): string => {
  const { width, height, depth, unit = 'cm' } = props.artwork.dimensions

  if (depth) {
    return `${width} × ${height} × ${depth} ${unit}`
  }

  return `${width} × ${height} ${unit}`
})

/**
 * Strategy Pattern: Determine card interactivity
 * Returns appropriate element tag based on configuration
 *
 * @returns HTML element tag ('a' for clickable, 'div' otherwise)
 */
const cardElement = computed((): 'a' | 'div' => {
  return props.config.clickable && props.artwork.detailUrl ? 'a' : 'div'
})

/**
 * Adapter Pattern: Format price for display
 * Pure function - transforms number to localized currency string
 *
 * @returns Formatted price string or null
 */
const formattedPrice = computed((): string | null => {
  if (!props.config.showPrice || !props.artwork.price) {
    return null
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(props.artwork.price)
})

/**
 * Determine availability status display
 * Pure function - returns availability label or null
 *
 * @returns Availability status string or null
 */
const availabilityStatus = computed((): string | null => {
  if (!props.config.showAvailability) {
    return null
  }

  return props.artwork.available !== false ? 'Disponible' : 'Vendu'
})

/**
 * Generate CSS classes for card container
 * Pure function - returns class string based on configuration
 *
 * @returns Space-separated class names
 */
const cardClasses = computed((): string => {
  const classes: string[] = ['artwork-card']

  if (props.config.clickable && props.artwork.detailUrl) {
    classes.push('artwork-card--clickable')
  }

  if (props.config.enableHover) {
    classes.push('artwork-card--hoverable')
  }

  return classes.join(' ')
})

/**
 * Generate ARIA label for card
 * Pure function - creates descriptive label for screen readers
 *
 * @returns ARIA label string
 */
const ariaLabel = computed((): string => {
  const parts: string[] = [
    props.artwork.title,
    formattedDimensions.value,
    props.artwork.material,
  ]

  if (formattedPrice.value) {
    parts.push(formattedPrice.value)
  }

  if (availabilityStatus.value) {
    parts.push(availabilityStatus.value)
  }

  return parts.join(', ')
})
</script>

<template>
  <article
    :class="cardClasses"
    :aria-label="ariaLabel"
  >
    <component
      :is="cardElement"
      :href="config.clickable ? artwork.detailUrl : undefined"
      class="artwork-card__link-wrapper"
      :aria-label="config.clickable ? `View details of ${artwork.title}` : undefined"
    >
      <!-- Image Section -->
      <figure class="artwork-card__figure">
        <div
          class="artwork-card__image-container"
          :style="{ aspectRatio: config.imageAspectRatio }"
        >
          <img
            :src="artwork.imageSrc"
            :alt="artwork.imageAlt"
            class="artwork-card__image"
            loading="lazy"
            decoding="async"
          />
        </div>
      </figure>

      <!-- Content Section -->
      <div class="artwork-card__content">
        <!-- Title -->
        <h3 class="artwork-card__title">
          {{ artwork.title }}
        </h3>

        <!-- Dimensions -->
        <p class="artwork-card__dimensions">
          {{ formattedDimensions }}
        </p>

        <!-- Material -->
        <p class="artwork-card__material">
          {{ artwork.material }}
        </p>

        <!-- Description -->
        <p class="artwork-card__description">
          {{ artwork.description }}
        </p>

        <!-- Optional: Price and Availability -->
        <div
          v-if="formattedPrice || availabilityStatus"
          class="artwork-card__footer"
        >
          <span
            v-if="formattedPrice"
            class="artwork-card__price"
          >
            {{ formattedPrice }}
          </span>

          <span
            v-if="availabilityStatus"
            class="artwork-card__availability"
            :class="{
              'artwork-card__availability--available': artwork.available !== false,
              'artwork-card__availability--sold': artwork.available === false,
            }"
          >
            {{ availabilityStatus }}
          </span>
        </div>
      </div>
    </component>
  </article>
</template>

<style lang="scss" scoped>
.artwork-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: $color-white;
  border-radius: $border-radius-base;
  overflow: hidden;
  transition:
    transform $transition-base,
    box-shadow $transition-base;

  // Hoverable state
  &--hoverable:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  // Clickable state
  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
    }

    &:active {
      transform: translateY(-2px);
    }
  }
}

.artwork-card__link-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: inherit;

  @include focus-visible;

  &:focus-visible {
    border-radius: $border-radius-base;
  }
}

// Image Section
.artwork-card__figure {
  margin: 0;
  width: 100%;
  overflow: hidden;
  background-color: $color-gray-100;
}

.artwork-card__image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.artwork-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform $transition-slow;

  .artwork-card--hoverable:hover & {
    transform: scale(1.05);
  }
}

// Content Section
.artwork-card__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-md;
  flex: 1;
}

.artwork-card__title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: 600;
  line-height: $line-height-tight;
  color: $color-gray-900;
  transition: color $transition-fast;

  .artwork-card--clickable:hover & {
    color: $color-gray-600;
  }

  @include tablet {
    font-size: $font-size-2xl;
  }
}

.artwork-card__dimensions {
  margin: 0;
  font-size: $font-size-base;
  font-weight: 500;
  color: $color-gray-600;
  line-height: $line-height-base;
}

.artwork-card__material {
  margin: 0;
  font-size: $font-size-base;
  font-style: italic;
  color: $color-gray-600;
  line-height: $line-height-base;
}

.artwork-card__description {
  margin: $spacing-xs 0 0;
  font-size: $font-size-base;
  color: $color-gray-900;
  line-height: $line-height-base;
}

// Footer Section (Price and Availability)
.artwork-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px solid $color-gray-200;
}

.artwork-card__price {
  font-size: $font-size-lg;
  font-weight: 700;
  color: $color-gray-900;
}

.artwork-card__availability {
  font-size: $font-size-base;
  font-weight: 500;
  padding: $spacing-xs $spacing-sm;
  border-radius: calc($border-radius-base / 2);
  transition:
    background-color $transition-fast,
    color $transition-fast;

  &--available {
    background-color: rgba(34, 197, 94, 0.1);
    color: rgb(21, 128, 61);
  }

  &--sold {
    background-color: rgba(239, 68, 68, 0.1);
    color: rgb(185, 28, 28);
  }
}

// Responsive adjustments
@include tablet {
  .artwork-card__content {
    padding: $spacing-lg;
    gap: $spacing-sm;
  }

  .artwork-card__description {
    margin-top: $spacing-sm;
  }
}

@include desktop {
  .artwork-card__content {
    gap: $spacing-sm;
  }

  .artwork-card__footer {
    margin-top: $spacing-md;
  }
}
</style>
