/**
 * Contact Link Type Definitions
 *
 * TypeScript interfaces for contact link data returned by the backend API.
 * These types align with the NestJS backend ContactLink entity.
 *
 * @see apps/backend/src/entities/contact-link.entity.ts
 * @module types/contact-link
 */

/**
 * Platform types for contact links and social media profiles
 * Matches the backend ContactPlatform enum
 */
export type ContactPlatform =
  | 'email'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'pinterest'
  | 'youtube'
  | 'twitter'
  | 'website'
  | 'other'

/**
 * Contact link entity as returned by the backend API
 *
 * Endpoint: GET /api/contact-links
 * Returns active contact links sorted by sortOrder ASC
 */
export interface ContactLink {
  /** Unique identifier (UUID) */
  id: string

  /** Social media or contact platform */
  platform: ContactPlatform

  /** Full URL (or mailto: for email) */
  url: string

  /** Optional display label (e.g., "@atelier_kaisla") */
  label?: string

  /** Display order (ascending) */
  sortOrder: number

  /** Whether the link is active */
  isActive: boolean

  /** Creation timestamp */
  createdAt: string

  /** Last update timestamp */
  updatedAt: string
}
