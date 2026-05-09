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
 * @example
 * ```vue
 * <StorySection
 *   eyebrow="Notre histoire"
 *   title="L'Histoire de la Créatrice"
 *   :image="{ src: '/creator.jpg', alt: 'Portrait' }"
 *   content="Lorem ipsum..."
 *   image-position="left"
 * />
 * ```
 */

import type { ImagePosition } from '~/types/story'

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
   * Story content text (plain text or HTML)
   */
  content: string

  /**
   * Optional eyebrow text rendered above the title
   */
  eyebrow?: string

  /**
   * Image position in layout
   * @default 'left'
   */
  imagePosition?: ImagePosition

  /**
   * Optional theme variant (visually neutralized; kept for API compatibility)
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
  theme: 'light',
  eyebrow: undefined,
  id: undefined
})

const contentIsHtml = computed(() => isHtmlContent(props.content))

const sanitizedContent = computed(() => sanitizeHtml(props.content))

const paragraphs = computed(() => {
  return props.content
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
})

const sectionClasses = computed(() => {
  return {
    'story-section': true,
    [`story-section--image-${props.imagePosition}`]: true,
    [`story-section--theme-${props.theme}`]: true
  }
})

const imageClasses = computed(() => {
  return {
    'story-section__image-wrapper': true,
    'story-section__image-wrapper--left': props.imagePosition === 'left',
    'story-section__image-wrapper--right': props.imagePosition === 'right'
  }
})

const sectionId = computed(() => {
  return props.id || props.title.toLowerCase().replace(/\s+/g, '-')
})
</script>

<template>
  <section :id="sectionId" :class="sectionClasses" :aria-labelledby="`${sectionId}-title`">
    <div class="story-section__container">
      <!-- Image Column -->
      <div :class="imageClasses">
        <NuxtImg
          :src="image.src"
          :alt="image.alt"
          :width="image.width || 900"
          :height="image.height || 1200"
          class="story-section__image"
          loading="lazy"
          format="webp"
          sizes="sm:100vw md:50vw lg:600px"
        />
      </div>

      <!-- Content Column -->
      <div class="story-section__content">
        <span
          v-if="eyebrow"
          class="story-section__eyebrow"
        >
          {{ eyebrow }}
        </span>

        <h2 :id="`${sectionId}-title`" class="story-section__title">
          {{ title }}
        </h2>

        <span class="story-section__hairline" aria-hidden="true" />

        <div class="story-section__text">
          <!-- Rich HTML content -->
          <div
            v-if="contentIsHtml"
            class="story-section__rich-content"
            v-html="sanitizedContent"
          />
          <!-- Plain text fallback -->
          <template v-else>
            <p v-for="(paragraph, index) in paragraphs" :key="index" class="story-section__paragraph">
              {{ paragraph }}
            </p>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.story-section {
  padding: $spacing-2xl $spacing-md;
  background-color: $color-canvas;

  @include tablet {
    padding: $spacing-3xl $spacing-lg;
  }

  // Theme variants are visually neutralized — both render on canvas.
  // The visual rhythm is provided by alternating image positions.
  &--theme-light,
  &--theme-dark {
    background-color: $color-canvas;
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
  box-shadow: $shadow-md;

  @media (prefers-reduced-motion: no-preference) {
    transition:
      transform $transition-base,
      box-shadow $transition-base;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
}

.story-section__image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  aspect-ratio: 3 / 4;

  @media (prefers-reduced-motion: no-preference) {
    transition: transform $transition-slow;

    .story-section__image-wrapper:hover & {
      transform: scale(1.02);
    }
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

.story-section__eyebrow {
  @include eyebrow;
  margin: 0;
}

.story-section__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $color-ink;
  letter-spacing: $letter-spacing-tight;
  line-height: $line-height-tight;
  margin: 0;

  @include tablet {
    font-size: $font-size-3xl;
  }

  @include desktop {
    font-size: $font-size-4xl;
  }
}

.story-section__hairline {
  @include hairline($color-fjord, 1px);
  display: block;
  width: 48px;
  margin-top: $spacing-md;
}

.story-section__text {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.story-section__paragraph {
  font-size: $font-size-base;
  color: $color-ink-soft;
  line-height: $line-height-base;
  margin: 0;

  @include tablet {
    font-size: $font-size-lg;
  }

  &:first-child {
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    color: $color-ink;

    @include tablet {
      font-size: $font-size-xl;
    }
  }
}

.story-section__rich-content {
  :deep(p) {
    font-size: $font-size-base;
    color: $color-ink-soft;
    line-height: $line-height-base;
    margin: 0 0 $spacing-sm;

    @include tablet {
      font-size: $font-size-lg;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(h2) {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-ink;
    letter-spacing: $letter-spacing-tight;
    margin: $spacing-md 0 $spacing-sm;
    line-height: $line-height-tight;

    @include tablet {
      font-size: $font-size-2xl;
    }
  }

  :deep(h3) {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-ink;
    letter-spacing: $letter-spacing-tight;
    margin: $spacing-sm 0 $spacing-xs;
    line-height: $line-height-tight;

    @include tablet {
      font-size: $font-size-xl;
    }
  }

  :deep(ul) {
    list-style-type: disc;
    padding-left: $spacing-md;
    margin: $spacing-sm 0;
  }

  :deep(ol) {
    list-style-type: decimal;
    padding-left: $spacing-md;
    margin: $spacing-sm 0;
  }

  :deep(li) {
    font-size: $font-size-base;
    color: $color-ink-soft;
    line-height: $line-height-base;
    margin: 0.25rem 0;

    @include tablet {
      font-size: $font-size-lg;
    }
  }

  :deep(strong) {
    font-weight: $font-weight-bold;
  }

  :deep(em) {
    font-style: italic;
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid $color-line;
    margin: $spacing-md 0;
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
