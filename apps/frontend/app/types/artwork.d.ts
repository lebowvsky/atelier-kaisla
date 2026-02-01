/**
 * Artwork Type Definitions
 *
 * Type-safe definitions for artwork data structures used across the application.
 * These types ensure consistency when displaying art pieces in cards, galleries, and detail pages.
 */

/**
 * Represents the dimensions of an artwork piece
 */
export interface ArtworkDimensions {
  /**
   * Width in centimeters
   */
  width: number;

  /**
   * Height in centimeters
   */
  height: number;

  /**
   * Optional depth in centimeters (for 3D pieces)
   */
  depth?: number;

  /**
   * Display unit ('cm' or 'in')
   * @default 'cm'
   */
  unit?: 'cm' | 'in';
}

/**
 * Represents a complete artwork piece
 */
export interface Artwork {
  /**
   * Unique identifier for the artwork
   */
  id: string;

  /**
   * Title of the artwork
   */
  title: string;

  /**
   * Image source URL or path
   */
  imageSrc: string;

  /**
   * Alternative text for the image (accessibility)
   */
  imageAlt: string;

  /**
   * Physical dimensions of the artwork
   */
  dimensions: ArtworkDimensions;

  /**
   * Short description of the material(s) used
   * Example: "100% wool on cotton warp"
   */
  material: string;

  /**
   * Descriptive text about the artwork
   */
  description: string;

  /**
   * Price in euros (optional, for e-commerce integration)
   */
  price?: number;

  /**
   * Availability status (optional, for e-commerce integration)
   */
  available?: boolean;

  /**
   * Category: wall-hanging or rug
   */
  category?: 'wall-hanging' | 'rug';

  /**
   * Optional link to detailed product page
   */
  detailUrl?: string;
}

/**
 * Configuration options for ArtworkCard component
 */
export interface ArtworkCardConfig {
  /**
   * Show price if available
   * @default false
   */
  showPrice?: boolean;

  /**
   * Show availability status
   * @default false
   */
  showAvailability?: boolean;

  /**
   * Enable click to detail page
   * @default false
   */
  clickable?: boolean;

  /**
   * Image aspect ratio
   * @default '4/3'
   */
  imageAspectRatio?: string;

  /**
   * Enable hover effects
   * @default true
   */
  enableHover?: boolean;
}
