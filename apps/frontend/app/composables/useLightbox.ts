/**
 * Lightbox Composable
 *
 * Implements the Observer Pattern for reactive lightbox state management.
 * Provides a centralized, type-safe way to control image lightbox visibility.
 *
 * Design Patterns:
 * - Observer Pattern: Reactive state that components can subscribe to
 * - Singleton Pattern: Single source of truth for lightbox state
 * - Functional Programming: Pure functions, immutable operations
 *
 * @example
 * const { isOpen, currentImageIndex, openLightbox, closeLightbox } = useLightbox()
 * openLightbox(2) // Opens lightbox with image at index 2
 */

import type { Ref } from 'vue'

/**
 * Lightbox state interface
 */
interface LightboxState {
  /**
   * Whether the lightbox is currently visible
   */
  isOpen: Ref<boolean>

  /**
   * Index of the currently displayed image
   */
  currentImageIndex: Ref<number>

  /**
   * Opens the lightbox with the specified image
   */
  openLightbox: (index: number) => void

  /**
   * Closes the lightbox
   */
  closeLightbox: () => void

  /**
   * Navigate to the next image
   */
  nextImage: (totalImages: number) => void

  /**
   * Navigate to the previous image
   */
  previousImage: (totalImages: number) => void
}

/**
 * Global lightbox state (Singleton Pattern)
 * Shared across all components that use this composable
 */
const isOpen = ref<boolean>(false)
const currentImageIndex = ref<number>(0)

/**
 * Lightbox composable
 *
 * @returns {LightboxState} Reactive lightbox state and control functions
 */
export const useLightbox = (): LightboxState => {
  /**
   * Opens the lightbox with a specific image index
   * Pure function with side effect on reactive state
   *
   * @param index - Index of the image to display
   */
  const openLightbox = (index: number): void => {
    currentImageIndex.value = index
    isOpen.value = true

    // Prevent body scroll when lightbox is open (accessibility)
    if (import.meta.client) {
      document.body.style.overflow = 'hidden'
    }
  }

  /**
   * Closes the lightbox
   * Pure function with side effect on reactive state
   */
  const closeLightbox = (): void => {
    isOpen.value = false

    // Restore body scroll
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }

  /**
   * Navigate to the next image
   * Pure function implementing modulo arithmetic for circular navigation
   *
   * @param totalImages - Total number of images in the gallery
   */
  const nextImage = (totalImages: number): void => {
    currentImageIndex.value = (currentImageIndex.value + 1) % totalImages
  }

  /**
   * Navigate to the previous image
   * Pure function implementing modulo arithmetic for circular navigation
   *
   * @param totalImages - Total number of images in the gallery
   */
  const previousImage = (totalImages: number): void => {
    currentImageIndex.value =
      (currentImageIndex.value - 1 + totalImages) % totalImages
  }

  return {
    isOpen: readonly(isOpen),
    currentImageIndex: readonly(currentImageIndex),
    openLightbox,
    closeLightbox,
    nextImage,
    previousImage,
  }
}
