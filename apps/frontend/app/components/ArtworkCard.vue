<script setup lang="ts">
/**
 * ArtworkCard Component
 *
 * A reusable card component for displaying artwork pieces (wall hangings and rugs).
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
  artwork: Artwork
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

const formattedDimensions = computed((): string => {
  const { width, height, depth, unit = 'cm' } = props.artwork.dimensions

  if (depth) {
    return `${width} × ${height} × ${depth} ${unit}`
  }

  return `${width} × ${height} ${unit}`
})

const cardElement = computed((): 'a' | 'div' => {
  return props.config.clickable && props.artwork.detailUrl ? 'a' : 'div'
})

const formattedPrice = computed((): string | null => {
  if (!props.config.showPrice || !props.artwork.price) {
    return null
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(props.artwork.price)
})

const availabilityStatus = computed((): string | null => {
  if (!props.config.showAvailability) {
    return null
  }

  return props.artwork.available !== false ? 'Disponible' : 'Vendu'
})

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
          <NuxtImg
            :src="artwork.imageSrc"
            :alt="artwork.imageAlt"
            class="artwork-card__image"
            loading="lazy"
            decoding="async"
            format="webp"
            width="800"
            height="600"
            sizes="sm:100vw md:50vw lg:33vw"
          />
        </div>
      </figure>

      <!-- Content Section -->
      <div class="artwork-card__content">
        <h3 class="artwork-card__title">
          {{ artwork.title }}
        </h3>

        <p class="artwork-card__dimensions">
          {{ formattedDimensions }}
        </p>

        <p class="artwork-card__material">
          {{ artwork.material }}
        </p>

        <p class="artwork-card__description">
          {{ artwork.description }}
        </p>

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
  background-color: $color-canvas;
  border-radius: $border-radius-base;
  overflow: hidden;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform $transition-base,
      box-shadow $transition-base;
  }

  &--hoverable:hover {
    box-shadow: $shadow-md;
  }

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition: none;

    &--clickable:hover,
    &--clickable:active {
      transform: none;
    }
  }
}

.artwork-card__link-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: inherit;

  &:focus-visible {
    outline: 2px solid $color-fjord-deep;
    outline-offset: 2px;
    border-radius: $border-radius-base;
  }
}

// Image Section
.artwork-card__figure {
  margin: 0;
  width: 100%;
  overflow: hidden;
  background-color: $color-canvas-soft;
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

  @media (prefers-reduced-motion: no-preference) {
    transition: transform $transition-slow;

    .artwork-card--hoverable:hover & {
      transform: scale(1.05);
    }
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
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
  letter-spacing: $letter-spacing-tight;
  color: $color-ink;

  @include tablet {
    font-size: $font-size-2xl;
  }
}

.artwork-card__dimensions {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-stone;
  line-height: $line-height-base;
}

.artwork-card__material {
  margin: 0;
  font-size: $font-size-base;
  font-style: italic;
  color: $color-stone;
  line-height: $line-height-base;
}

.artwork-card__description {
  margin: $spacing-xs 0 0;
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-base;
}

// Footer Section (Price and Availability)
.artwork-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px solid $color-line;
}

.artwork-card__price {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-ink;
}

.artwork-card__availability {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  padding: $spacing-xs $spacing-sm;
  border-radius: calc($border-radius-base / 2);
  transition:
    background-color $transition-fast,
    color $transition-fast;

  &--available {
    background-color: $color-success-bg;
    color: $color-success-text;
  }

  &--sold {
    background-color: $color-danger-bg;
    color: $color-danger-text;
  }
}

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
