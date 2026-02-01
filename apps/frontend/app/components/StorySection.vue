<script setup lang="ts">
/**
 * StorySection Component
 *
 * Reusable component for displaying story sections with image and text content.
 * Used primarily on the About page for creator, project, and book stories.
 *
 * @pattern Template Method Pattern
 * @category Behavioral
 * @purpose Provides consistent story layout structure with customizable content
 *
 * @pattern Strategy Pattern
 * @category Behavioral
 * @purpose Different layout strategies based on image position (left/right)
 *
 * Features:
 * - Responsive layout (stacked on mobile, side-by-side on desktop)
 * - Alternating image positions for visual rhythm
 * - Semantic HTML structure
 * - Accessible with ARIA labels and proper heading hierarchy
 * - Support for multi-paragraph content
 * - Lazy loading images for performance
 * - Smooth animations on scroll (future enhancement)
 *
 * Accessibility:
 * - WCAG 2.1 AA compliant
 * - Semantic HTML with proper heading hierarchy
 * - Alt text required for images
 * - Keyboard navigable
 * - Screen reader friendly content structure
 *
 * Performance:
 * - Lazy loading images
 * - CSS-only animations (GPU accelerated)
 * - Minimal JavaScript
 * - Optimized for Core Web Vitals
 *
 * @example
 * ```vue
 * <StorySection
 *   title="L'Histoire de la Créatrice"
 *   :image="{ src: '/creator.jpg', alt: 'Portrait' }"
 *   content="Lorem ipsum..."
 *   image-position="left"
 * />
 * ```
 *
 * @example With all props
 * ```vue
 * <StorySection
 *   title="L'Histoire du Projet"
 *   :image="{ src: '/project.jpg', alt: 'Atelier', width: 600, height: 800 }"
 *   content="Multi-paragraph content..."
 *   image-position="right"
 *   theme="dark"
 * />
 * ```
 */

import type { Story, ImagePosition } from '~/types/story'

interface Props {
  /**
   * Section title (rendered as h2)
   */
  title: string

  /**
   * Image configuration
   */
  image: {
    src: string
    alt: string
    width?: number
    height?: number
  }

  /**
   * Story content text
   * Multi-paragraph content supported (split by \n\n)
   */
  content: string

  /**
   * Image position in layout
   * @default 'left'
   */
  imagePosition?: ImagePosition

  /**
   * Optional theme variant
   * @default 'light'
   */
  theme?: 'light' | 'dark'

  /**
   * Optional ID for anchor links
   */
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  imagePosition: 'left',
  theme: 'light'
})

/**
 * Split content into paragraphs
 * Handles multi-paragraph content separated by double newlines
 *
 * Pure function for content transformation
 */
const paragraphs = computed(() => {
  return props.content
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
})

/**
 * Compute container classes based on props
 * Strategy Pattern: Different layout strategies
 *
 * Pure function for class generation
 */
const sectionClasses = computed(() => {
  return {
    'story-section': true,
    [`story-section--image-${props.imagePosition}`]: true,
    [`story-section--theme-${props.theme}`]: true
  }
})

/**
 * Compute image wrapper classes for layout control
 */
const imageClasses = computed(() => {
  return {
    'story-section__image-wrapper': true,
    'story-section__image-wrapper--left': props.imagePosition === 'left',
    'story-section__image-wrapper--right': props.imagePosition === 'right'
  }
})

/**
 * Generate unique section ID
 * Used for anchor links and accessibility
 */
const sectionId = computed(() => {
  return props.id || props.title.toLowerCase().replace(/\s+/g, '-')
})
</script>

<template>
  <section :id="sectionId" :class="sectionClasses" aria-labelledby="`${sectionId}-title`">
    <div class="story-section__container">
      <!-- Image Column -->
      <div :class="imageClasses">
        <img
          :src="image.src"
          :alt="image.alt"
          :width="image.width"
          :height="image.height"
          class="story-section__image"
          loading="lazy"
        />
      </div>

      <!-- Content Column -->
      <div class="story-section__content">
        <h2 :id="`${sectionId}-title`" class="story-section__title">
          {{ title }}
        </h2>

        <div class="story-section__text">
          <!-- Multi-paragraph support -->
          <p v-for="(paragraph, index) in paragraphs" :key="index" class="story-section__paragraph">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.story-section {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-white;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }

  // Dark theme variant
  &--theme-dark {
    background-color: $color-gray-100;
  }
}

.story-section__container {
  @include container;
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-xl;
  align-items: center;

  @include tablet {
    grid-template-columns: 1fr 1fr;
    gap: $spacing-2xl;
  }

  @include desktop {
    gap: $spacing-3xl;
  }
}

// Image positioning strategies (Strategy Pattern)
.story-section--image-left {
  .story-section__container {
    @include tablet {
      // Image first, content second
      grid-template-areas: 'image content';
    }
  }

  .story-section__image-wrapper {
    @include tablet {
      grid-area: image;
    }
  }

  .story-section__content {
    @include tablet {
      grid-area: content;
    }
  }
}

.story-section--image-right {
  .story-section__container {
    @include tablet {
      // Content first, image second
      grid-template-areas: 'content image';
    }
  }

  .story-section__image-wrapper {
    @include tablet {
      grid-area: image;
    }
  }

  .story-section__content {
    @include tablet {
      grid-area: content;
    }
  }
}

.story-section__image-wrapper {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: $border-radius-base;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform $transition-base, box-shadow $transition-base;

  // Hover effect for subtle interactivity
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
}

.story-section__image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 3 / 4;
  transition: transform $transition-slow;

  // Subtle zoom on hover
  .story-section__image-wrapper:hover & {
    transform: scale(1.02);
  }
}

.story-section__content {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-md 0;

  @include tablet {
    padding: 0;
  }
}

.story-section__title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $color-black;
  line-height: $line-height-tight;
  margin: 0;

  @include tablet {
    font-size: $font-size-3xl;
  }

  @include desktop {
    font-size: $font-size-4xl;
  }

  // Dark theme
  .story-section--theme-dark & {
    color: $color-gray-900;
  }
}

.story-section__text {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.story-section__paragraph {
  font-size: $font-size-base;
  color: $color-gray-600;
  line-height: $line-height-base;
  margin: 0;

  @include tablet {
    font-size: $font-size-lg;
  }

  // First paragraph slightly larger for visual hierarchy
  &:first-child {
    font-size: $font-size-lg;
    font-weight: 500;
    color: $color-gray-900;

    @include tablet {
      font-size: $font-size-xl;
    }
  }

  // Dark theme
  .story-section--theme-dark & {
    color: $color-gray-600;

    &:first-child {
      color: $color-gray-900;
    }
  }
}

// Responsive adjustments for mobile
@media (max-width: $breakpoint-tablet - 1px) {
  .story-section__image {
    aspect-ratio: 4 / 3;
  }
}

// Print styles
@media print {
  .story-section {
    page-break-inside: avoid;
    padding: $spacing-lg 0;
  }

  .story-section__container {
    display: block;
  }

  .story-section__image-wrapper {
    margin-bottom: $spacing-md;
    box-shadow: none;
  }

  .story-section__image {
    max-height: 400px;
  }
}
</style>
