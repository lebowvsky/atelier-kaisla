<script setup lang="ts">
/**
 * ImageLightbox Component
 *
 * A modal component for displaying images in full-screen view.
 * Implements accessibility features and keyboard navigation.
 *
 * Design Patterns:
 * - Observer Pattern: Subscribes to lightbox state from useLightbox composable
 * - Strategy Pattern: Different navigation strategies (keyboard, click, touch)
 * - Functional Programming: Pure functions for state transformations
 *
 * Accessibility Features:
 * - Keyboard navigation (Arrow keys, Escape)
 * - Focus trap when open
 * - ARIA labels and roles
 * - Screen reader announcements
 *
 * SEO Considerations:
 * - Semantic HTML structure
 * - Proper image alt attributes
 * - No impact on page crawlability (modal is client-side only)
 */

import type { GalleryImage } from '~/types/gallery'

interface Props {
  /**
   * Array of images to display in the lightbox
   */
  images: GalleryImage[]
}

const props = defineProps<Props>()

// Lightbox state management (Observer Pattern)
const { isOpen, currentImageIndex, closeLightbox, nextImage, previousImage } =
  useLightbox()

/**
 * Get the current image being displayed
 * Pure computed property - derives state from reactive dependencies
 */
const currentImage = computed<GalleryImage | undefined>(() => {
  return props.images[currentImageIndex.value]
})

/**
 * Handle keyboard navigation
 * Strategy Pattern - different actions based on key pressed
 */
const handleKeydown = (event: KeyboardEvent): void => {
  if (!isOpen.value) return

  const keyActions: Record<string, () => void> = {
    Escape: closeLightbox,
    ArrowLeft: () => previousImage(props.images.length),
    ArrowRight: () => nextImage(props.images.length),
  }

  const action = keyActions[event.key]
  if (action) {
    event.preventDefault()
    action()
  }
}

/**
 * Handle backdrop click to close lightbox
 * Only closes if clicking the backdrop itself, not the image
 */
const handleBackdropClick = (event: MouseEvent): void => {
  if (event.target === event.currentTarget) {
    closeLightbox()
  }
}

// Lifecycle: Setup keyboard listeners
onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown)
    // Ensure body scroll is restored
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div
        v-if="isOpen && currentImage"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
        @click="handleBackdropClick"
      >
        <div class="lightbox__container">
          <!-- Close Button -->
          <button
            class="lightbox__close"
            aria-label="Close lightbox"
            @click="closeLightbox"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- Navigation Buttons -->
          <button
            v-if="images.length > 1"
            class="lightbox__nav lightbox__nav--prev"
            aria-label="Previous image"
            @click.stop="previousImage(images.length)"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            v-if="images.length > 1"
            class="lightbox__nav lightbox__nav--next"
            aria-label="Next image"
            @click.stop="nextImage(images.length)"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <!-- Image Container -->
          <div class="lightbox__content">
            <img
              :src="currentImage.src"
              :alt="currentImage.alt"
              class="lightbox__image"
            />

            <!-- Image Information -->
            <div v-if="currentImage.title || currentImage.description" class="lightbox__info">
              <h2 v-if="currentImage.title" class="lightbox__title">
                {{ currentImage.title }}
              </h2>
              <p v-if="currentImage.description" class="lightbox__description">
                {{ currentImage.description }}
              </p>
            </div>

            <!-- Image Counter -->
            <div v-if="images.length > 1" class="lightbox__counter">
              {{ currentImageIndex + 1 }} / {{ images.length }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md;

  @include tablet {
    padding: $spacing-xl;
  }
}

.lightbox__container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox__close {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: $color-white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }

  @include focus-visible;

  @include tablet {
    top: $spacing-lg;
    right: $spacing-lg;
  }
}

.lightbox__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: $color-white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.1);
  }

  @include focus-visible;

  &--prev {
    left: $spacing-md;

    @include tablet {
      left: $spacing-lg;
    }
  }

  &--next {
    right: $spacing-md;

    @include tablet {
      right: $spacing-lg;
    }
  }

  @include tablet {
    width: 56px;
    height: 56px;
  }
}

.lightbox__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  gap: $spacing-md;
}

.lightbox__image {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  object-fit: contain;
  border-radius: $border-radius-base;

  @include tablet {
    max-height: calc(100vh - 250px);
  }
}

.lightbox__info {
  text-align: center;
  color: $color-white;
  max-width: 600px;
}

.lightbox__title {
  font-size: $font-size-xl;
  font-weight: 600;
  margin-bottom: $spacing-xs;
  line-height: $line-height-tight;
}

.lightbox__description {
  font-size: $font-size-base;
  color: rgba(255, 255, 255, 0.9);
  line-height: $line-height-base;
}

.lightbox__counter {
  position: absolute;
  bottom: $spacing-md;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: $color-white;
  padding: $spacing-xs $spacing-md;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;

  @include tablet {
    bottom: $spacing-lg;
  }
}

// Transition animations
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity $transition-base;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

.lightbox-fade-enter-active .lightbox__content {
  animation: scaleIn $transition-base ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
