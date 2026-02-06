/**
 * @pattern Value Object
 * @category Type Definitions
 * @purpose Type-safe about section data structures aligned with backend entities
 */

/**
 * About section entity (aligned with backend AboutSection entity)
 */
export interface AboutSection {
  id: string
  title: string
  paragraphs: string[]
  image: string
  imageAlt: string
  sortOrder: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

/**
 * DTO for creating a new about section (JSON body)
 */
export interface CreateAboutSectionDto {
  title: string
  paragraphs: string[]
  imageAlt: string
  sortOrder?: number
  isPublished?: boolean
}

/**
 * DTO for updating an existing about section (all fields optional)
 */
export interface UpdateAboutSectionDto {
  title?: string
  paragraphs?: string[]
  imageAlt?: string
  sortOrder?: number
  isPublished?: boolean
}
