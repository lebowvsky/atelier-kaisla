/**
 * About Section Type Definitions
 *
 * TypeScript interfaces for about section data returned by the backend API.
 * These types align with the NestJS backend AboutSection entity.
 *
 * @see apps/backend/src/entities/about-section.entity.ts
 * @module types/about-section
 */

/**
 * About section entity as returned by the backend API
 *
 * Endpoint: GET /api/about-sections
 * Returns published sections sorted by sortOrder ASC
 */
export interface AboutSection {
  /** Unique identifier (UUID) */
  id: string

  /** Section title */
  title: string

  /** Array of paragraph texts */
  paragraphs: string[]

  /** Full image URL */
  image: string

  /** Image alt text for accessibility */
  imageAlt: string

  /** Display order (ascending) */
  sortOrder: number

  /** Whether the section is published */
  isPublished: boolean

  /** Creation timestamp */
  createdAt: string

  /** Last update timestamp */
  updatedAt: string
}
