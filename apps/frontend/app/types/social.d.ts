/**
 * Social Media Types
 *
 * TypeScript interfaces for social media sharing and links.
 * Designed to be extensible for future API integration.
 *
 * Design Pattern: Adapter Pattern preparation
 * This structure allows easy transition from hardcoded data to API-fetched data
 */

/**
 * Supported social media platforms
 * Extensible enum-like type for type safety
 * Aligned with the backend ContactPlatform enum (excluding 'email', 'website', 'other')
 */
export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'pinterest'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'

/**
 * Represents a single social media link
 */
export interface SocialLink {
  /**
   * Unique identifier for the social media platform
   */
  platform: SocialPlatform

  /**
   * Display name of the platform (e.g., "Instagram", "Facebook")
   */
  name: string

  /**
   * Full URL to the social media profile
   */
  url: string

  /**
   * Accessible label for screen readers
   */
  ariaLabel: string

  /**
   * SVG icon path data (for inline SVG rendering)
   * Using path data allows for easy theming and scaling
   */
  iconPath: string

  /**
   * Optional order for display (lower numbers appear first)
   */
  order?: number

  /**
   * Whether this link is active/visible
   */
  isActive?: boolean
}

/**
 * Contact information for ordering
 */
export interface ContactInfo {
  /**
   * Email address for orders
   */
  email: string

  /**
   * Display text shown before the email
   */
  label: string

  /**
   * Optional phone number
   */
  phone?: string

  /**
   * Accessible label for email link
   */
  ariaLabel?: string
}

