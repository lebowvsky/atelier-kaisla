/**
 * Gallery Types
 *
 * TypeScript interfaces for the image gallery system.
 * Provides type safety for image data and gallery configuration.
 */

/**
 * Represents a single image in the gallery
 */
export interface GalleryImage {
  /**
   * Unique identifier for the image
   */
  id: string

  /**
   * URL or path to the image (currently placeholder)
   */
  src: string

  /**
   * Alternative text for accessibility and SEO
   */
  alt: string

  /**
   * Optional title displayed in the lightbox
   */
  title?: string

  /**
   * Optional description displayed in the lightbox
   */
  description?: string

  /**
   * Image width in pixels (for aspect ratio calculation)
   */
  width?: number

  /**
   * Image height in pixels (for aspect ratio calculation)
   */
  height?: number
}

/**
 * Gallery configuration options
 */
export interface GalleryConfig {
  /**
   * Number of columns on desktop (default: 4)
   */
  columns?: number

  /**
   * Image size in pixels for square layout (default: 220)
   */
  imageSize?: number

  /**
   * Spacing between images (default: $spacing-lg)
   */
  gap?: string
}
