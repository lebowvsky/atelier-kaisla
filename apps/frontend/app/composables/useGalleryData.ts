/**
 * Gallery Data Composable
 *
 * Provides mock gallery data for development and testing.
 * Uses Factory Pattern to generate consistent image objects.
 *
 * Design Patterns:
 * - Factory Pattern: Centralized creation of gallery image objects
 * - Functional Programming: Pure functions, immutable data
 *
 * Future Enhancement:
 * This composable will be replaced with actual API calls to fetch
 * real image data from the backend.
 *
 * @example
 * const { galleryImages, createMockImage } = useGalleryData()
 */

import type { GalleryImage } from "~/types/gallery";

/**
 * Factory function to create a mock gallery image
 * Pure function - always returns the same output for the same input
 *
 * @param id - Unique identifier for the image
 * @param alt - Alternative text for the image
 * @param title - Optional title for the image
 * @param description - Optional description for the image
 * @returns A properly typed GalleryImage object
 */
const createMockImage = (id: string, alt: string, title?: string, description?: string): GalleryImage => {
  return Object.freeze({
    id,
    src: `/placeholder-${id}.jpg`, // Placeholder path
    alt,
    title,
    description,
    width: 800,
    height: 800,
  });
};

/**
 * Generate an array of mock gallery images
 * Pure function - returns immutable array of images
 *
 * @param count - Number of images to generate
 * @returns Array of GalleryImage objects
 */
const generateMockGallery = (count: number): readonly GalleryImage[] => {
  return Object.freeze(
    Array.from({ length: count }, (_, index) => {
      const imageNumber = index + 1;
      return createMockImage(
        `image-${imageNumber}`,
        `Gallery image ${imageNumber}`,
        `Artwork ${imageNumber}`,
        `This is a placeholder for artwork piece number ${imageNumber}. Click to view in full size.`,
      );
    }),
  );
};

/**
 * Gallery Data Composable
 *
 * @returns Gallery images and utility functions
 */
export const useGalleryData = () => {
  /**
   * Default gallery with 12 images (3 rows on desktop)
   */
  const galleryImages = computed<readonly GalleryImage[]>(() => generateMockGallery(20));

  /**
   * Get a specific number of gallery images
   * Useful for different gallery sizes
   */
  const getGalleryImages = (count: number): readonly GalleryImage[] => {
    return generateMockGallery(count);
  };

  return {
    galleryImages,
    createMockImage,
    getGalleryImages,
  };
};
