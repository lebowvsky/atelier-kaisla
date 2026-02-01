<script setup lang="ts">
/**
 * ArtworkList Component
 *
 * Displays a responsive grid of artwork cards for showcasing collections.
 * Handles loading states, empty states, and optimized rendering.
 *
 * Design Patterns Applied:
 * - @pattern Iterator Pattern
 * - @category Behavioral
 * - @purpose Provides a clean interface to traverse and display artwork collections
 *
 * - @pattern Template Method Pattern
 * - @category Behavioral
 * - @purpose Defines the skeleton of rendering algorithm (grid layout, states) while allowing
 *   customization through configuration
 *
 * - @pattern Strategy Pattern
 * - @category Behavioral
 * - @purpose Different grid layout strategies based on viewport and configuration
 *
 * Features:
 * - Responsive CSS Grid layout (1-3 columns based on viewport)
 * - Loading skeleton state with accessible ARIA labels
 * - Empty state with customizable message
 * - Optimized rendering with v-for key binding
 * - Configurable card behavior through ArtworkCardConfig
 * - Full TypeScript type safety
 * - Semantic HTML structure
 *
 * SEO & Accessibility:
 * - ARIA live regions for dynamic content updates
 * - Proper heading hierarchy
 * - Semantic list markup (ul/li) for screen readers
 * - Loading announcements for assistive technologies
 *
 * @example
 * ```typescript
 * <ArtworkList
 *   :artworks="wallHangings"
 *   :loading="isLoading"
 *   :card-config="{ clickable: true, showPrice: true }"
 *   empty-message="No wall hangings available at the moment."
 * />
 * ```
 */

import type { Artwork, ArtworkCardConfig } from '~/types/artwork'

interface Props {
  /**
   * Array of artworks to display
   */
  artworks: Artwork[]

  /**
   * Loading state indicator
   * @default false
   */
  loading?: boolean

  /**
   * Configuration passed to each ArtworkCard
   */
  cardConfig?: ArtworkCardConfig

  /**
   * Message displayed when artworks array is empty
   * @default 'No artworks available at the moment.'
   */
  emptyMessage?: string

  /**
   * Grid layout strategy
   * - 'default': 1 column mobile, 2 tablet, 3 desktop
   * - 'compact': 2 columns mobile, 3 tablet, 4 desktop
   * - 'wide': 1 column mobile, 2 tablet, 2 desktop
   * @default 'default'
   */
  gridLayout?: 'default' | 'compact' | 'wide'

  /**
   * Number of skeleton cards to show during loading
   * @default 6
   */
  skeletonCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'No artworks available at the moment.',
  gridLayout: 'default',
  skeletonCount: 6,
  cardConfig: () => ({
    showPrice: false,
    showAvailability: false,
    clickable: false,
    imageAspectRatio: '4/3',
    enableHover: true,
  }),
})

/**
 * Strategy Pattern: Determine grid CSS class based on layout strategy
 * Pure function - returns appropriate class name
 *
 * @returns CSS class name for grid layout
 */
const gridClass = computed((): string => {
  const layoutMap: Record<typeof props.gridLayout, string> = {
    default: 'artwork-list__grid--default',
    compact: 'artwork-list__grid--compact',
    wide: 'artwork-list__grid--wide',
  }

  return layoutMap[props.gridLayout]
})

/**
 * Template Method Pattern: Determine which state to render
 * Pure function - encapsulates rendering decision logic
 *
 * @returns Current state of the list component
 */
const currentState = computed((): 'loading' | 'empty' | 'content' => {
  if (props.loading) return 'loading'
  if (!props.artworks || props.artworks.length === 0) return 'empty'
  return 'content'
})

/**
 * Iterator Pattern: Generate skeleton array for loading state
 * Pure function - creates array of indices for v-for rendering
 *
 * @returns Array of numbers for skeleton items
 */
const skeletonItems = computed((): number[] => {
  return Array.from({ length: props.skeletonCount }, (_, i) => i)
})

/**
 * Accessibility: Generate ARIA label for grid
 * Pure function - creates descriptive label for screen readers
 *
 * @returns ARIA label string
 */
const gridAriaLabel = computed((): string => {
  if (currentState.value === 'loading') {
    return 'Loading artworks'
  }

  if (currentState.value === 'empty') {
    return 'No artworks available'
  }

  return `Collection of ${props.artworks.length} artwork${props.artworks.length === 1 ? '' : 's'}`
})
</script>

<template>
  <div class="artwork-list">
    <!-- Loading State -->
    <div
      v-if="currentState === 'loading'"
      class="artwork-list__grid"
      :class="gridClass"
      role="status"
      aria-live="polite"
      :aria-label="gridAriaLabel"
    >
      <div
        v-for="index in skeletonItems"
        :key="`skeleton-${index}`"
        class="artwork-list__skeleton"
        aria-hidden="true"
      >
        <div class="skeleton__image" />
        <div class="skeleton__content">
          <div class="skeleton__line skeleton__line--title" />
          <div class="skeleton__line skeleton__line--short" />
          <div class="skeleton__line skeleton__line--medium" />
          <div class="skeleton__line skeleton__line--long" />
        </div>
      </div>
      <span class="visually-hidden">Loading artworks, please wait...</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="currentState === 'empty'"
      class="artwork-list__empty"
      role="status"
      aria-live="polite"
    >
      <p class="artwork-list__empty-message">
        {{ emptyMessage }}
      </p>
    </div>

    <!-- Content State -->
    <ul
      v-else
      class="artwork-list__grid"
      :class="gridClass"
      role="list"
      :aria-label="gridAriaLabel"
    >
      <li
        v-for="artwork in artworks"
        :key="artwork.id"
        class="artwork-list__item"
      >
        <ArtworkCard
          :artwork="artwork"
          :config="cardConfig"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.artwork-list {
  width: 100%;
}

// Grid Layouts - Strategy Pattern Implementation
.artwork-list__grid {
  display: grid;
  gap: $spacing-lg;
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;

  // Default Layout: 1 -> 2 -> 3 columns
  &--default {
    grid-template-columns: 1fr;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-xl;
    }

    @include desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  // Compact Layout: 2 -> 3 -> 4 columns
  &--compact {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;

    @include tablet {
      grid-template-columns: repeat(3, 1fr);
      gap: $spacing-lg;
    }

    @include desktop {
      grid-template-columns: repeat(4, 1fr);
      gap: $spacing-xl;
    }
  }

  // Wide Layout: 1 -> 2 -> 2 columns (larger cards)
  &--wide {
    grid-template-columns: 1fr;
    gap: $spacing-xl;

    @include tablet {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-2xl;
    }

    @include desktop {
      gap: $spacing-2xl;
    }
  }
}

.artwork-list__item {
  // No additional styles needed - grid handles layout
  // ArtworkCard is self-contained
}

// Loading Skeleton Styles
.artwork-list__skeleton {
  display: flex;
  flex-direction: column;
  background-color: $color-white;
  border-radius: $border-radius-base;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.skeleton__image {
  width: 100%;
  aspect-ratio: 4/3;
  background: linear-gradient(
    90deg,
    $color-gray-100 0%,
    $color-gray-200 50%,
    $color-gray-100 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-md;

  @include tablet {
    padding: $spacing-lg;
    gap: $spacing-sm;
  }
}

.skeleton__line {
  height: 1rem;
  background: linear-gradient(
    90deg,
    $color-gray-100 0%,
    $color-gray-200 50%,
    $color-gray-100 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: skeleton-loading 1.5s ease-in-out infinite;

  &--title {
    height: 1.5rem;
    width: 70%;

    @include tablet {
      height: 2rem;
    }
  }

  &--short {
    width: 40%;
  }

  &--medium {
    width: 60%;
  }

  &--long {
    width: 90%;
    margin-top: $spacing-xs;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Empty State Styles
.artwork-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: $spacing-2xl $spacing-md;
  text-align: center;
  background-color: $color-gray-100;
  border-radius: $border-radius-base;

  @include tablet {
    min-height: 400px;
    padding: $spacing-3xl $spacing-lg;
  }
}

.artwork-list__empty-message {
  font-size: $font-size-lg;
  color: $color-gray-600;
  margin: 0;
  max-width: 500px;
  line-height: $line-height-base;

  @include tablet {
    font-size: $font-size-xl;
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
