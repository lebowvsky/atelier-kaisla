/**
 * @pattern Value Object
 * @category Type Definitions
 * @purpose Type-safe contact link data structures aligned with backend entities
 */

/**
 * Contact platform enum (aligned with backend ContactPlatform)
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
 * Contact link entity (aligned with backend ContactLink entity)
 */
export interface ContactLink {
  id: string
  platform: ContactPlatform
  url: string
  label?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * DTO for creating a new contact link
 */
export interface CreateContactLinkDto {
  platform: ContactPlatform
  url: string
  label?: string
  sortOrder?: number
  isActive?: boolean
}

/**
 * DTO for updating an existing contact link (all fields optional)
 */
export interface UpdateContactLinkDto {
  platform?: ContactPlatform
  url?: string
  label?: string
  sortOrder?: number
  isActive?: boolean
}

/**
 * Platform display configuration for UI rendering
 */
export interface PlatformConfig {
  value: ContactPlatform
  label: string
  placeholder: string
}
