/**
 * @pattern Factory Pattern + Adapter Pattern
 * @category Creational + Structural
 * @purpose Creates social media link objects with consistent structure
 *          and prepares for future API integration
 *
 * Design Patterns Applied:
 * 1. Factory Pattern: createSocialLink() generates consistent SocialLink objects
 * 2. Adapter Pattern: Structure allows easy transition from hardcoded to API data
 * 3. Singleton Pattern: Composable returns same data reference across calls
 *
 * Future API Integration:
 * Replace hardcoded socialLinksData with:
 * const { data } = await useFetch('/api/social-links')
 *
 * @example
 * ```typescript
 * const { socialLinks, contactInfo } = useSocialData()
 * ```
 */

import type { SocialLink, SocialPlatform, ContactInfo, SocialShareConfig } from '~/types/social'

/**
 * Factory function to create a social link object
 * Ensures consistent structure and provides defaults
 *
 * @pattern Factory Pattern
 * @param platform - Social media platform identifier
 * @param name - Display name
 * @param url - Profile URL
 * @param iconPath - SVG path data
 * @param order - Display order (optional)
 * @returns Fully structured SocialLink object
 */
function createSocialLink(
  platform: SocialPlatform,
  name: string,
  url: string,
  iconPath: string,
  order?: number
): SocialLink {
  return {
    platform,
    name,
    url,
    ariaLabel: `Visit Atelier Kaisla on ${name}`,
    iconPath,
    order: order ?? 0,
    isActive: true
  }
}

/**
 * SVG icon paths for social media platforms
 * Using path data for inline SVG rendering (scalable and themeable)
 *
 * Icons are optimized from popular icon sets for consistent stroke width
 */
const SOCIAL_ICONS = {
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  twitter: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  pinterest: 'M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
} as const

/**
 * Composable for social media data management
 *
 * @pattern Singleton Pattern (via Vue composable caching)
 * @returns Social media links and contact information
 */
export function useSocialData(): SocialShareConfig {
  /**
   * Social media links data
   * Currently hardcoded, but structured to match API response format
   *
   * Future API Integration:
   * const { data: socialLinksData } = await useFetch<SocialLink[]>('/api/social-links')
   */
  const socialLinksData: SocialLink[] = [
    createSocialLink(
      'instagram',
      'Instagram',
      'https://instagram.com/atelierkaisla',
      SOCIAL_ICONS.instagram,
      1
    ),
    createSocialLink(
      'facebook',
      'Facebook',
      'https://facebook.com/atelierkaisla',
      SOCIAL_ICONS.facebook,
      2
    )
    // Future platforms can be easily added:
    // createSocialLink('pinterest', 'Pinterest', 'https://pinterest.com/atelierkaisla', SOCIAL_ICONS.pinterest, 3),
  ]

  /**
   * Contact information for ordering
   * Currently hardcoded, but structured to match API response format
   *
   * Future API Integration:
   * const { data: contactData } = await useFetch<ContactInfo>('/api/contact-info')
   */
  const contactInfoData: ContactInfo = {
    label: 'For ordering a unique Kaisla rug:',
    email: 'eloise@atelierkaisla.com',
    ariaLabel: 'Send an email to order a unique Kaisla rug'
  }

  /**
   * Strategy Pattern: Sort social links by order
   * Pure function for consistent sorting
   */
  const sortedSocialLinks = computed(() => {
    return [...socialLinksData]
      .filter(link => link.isActive)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  })

  return {
    socialLinks: sortedSocialLinks.value,
    contactInfo: contactInfoData,
    theme: 'dark' // Can be made dynamic based on user preference or theme context
  }
}

/**
 * Helper function to validate social media URL
 * Pure function for URL validation
 *
 * @param url - URL to validate
 * @returns Boolean indicating if URL is valid
 */
export function isValidSocialUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Helper function to get platform color
 * Strategy Pattern: Different colors for different platforms
 *
 * @param platform - Social media platform
 * @returns Hex color code
 */
export function getPlatformColor(platform: SocialPlatform): string {
  const colorMap: Record<SocialPlatform, string> = {
    instagram: '#E4405F',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    pinterest: '#E60023',
    linkedin: '#0A66C2'
  }

  return colorMap[platform] || '#000000'
}
