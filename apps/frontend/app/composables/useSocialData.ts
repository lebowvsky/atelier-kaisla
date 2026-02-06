/**
 * @pattern Factory Pattern + Adapter Pattern
 * @category Creational + Structural
 * @purpose Creates social media link objects with consistent structure
 *          and integrates with the contact-links API
 *
 * Design Patterns Applied:
 * 1. Factory Pattern: createSocialLink() generates consistent SocialLink objects (fallback)
 * 2. Adapter Pattern: ContactLink API data adapted to SocialLink interface via useContactLinks
 * 3. Facade Pattern: Provides a simple interface combining API data with fallback
 *
 * This composable fetches data from the backend API (GET /api/contact-links)
 * and falls back to hardcoded data if the API is unavailable.
 *
 * @example
 * ```typescript
 * const { socialLinks, contactInfo, loading, fetchSocialData } = useSocialData()
 * await fetchSocialData()
 * ```
 */

import type { SocialLink, SocialPlatform, ContactInfo } from '~/types/social'
import { SOCIAL_ICONS } from '~/utils/socialIcons'

/**
 * Factory function to create a social link object (used for fallback data)
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
 * Fallback social links data used when the API is unavailable
 */
const FALLBACK_SOCIAL_LINKS: SocialLink[] = [
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
  ),
]

/**
 * Fallback contact information used when the API is unavailable
 */
const FALLBACK_CONTACT_INFO: ContactInfo = {
  label: 'For ordering a unique Kaisla rug:',
  email: 'eloise@atelierkaisla.com',
  ariaLabel: 'Send an email to order a unique Kaisla rug'
}

/**
 * Composable for social media data management
 *
 * Fetches data from the backend API and falls back to hardcoded
 * data if the API is unavailable, ensuring the UI always displays
 * contact information.
 *
 * The fallback only activates when:
 * - The API has not been called yet (hasFetched is false)
 * - The API call resulted in an error
 *
 * If the API responds successfully with 0 links, no fallback is used.
 *
 * @returns Social media links, contact information, loading state, and fetch method
 */
export function useSocialData() {
  const {
    socialLinks: apiSocialLinks,
    emailContactInfo,
    loading: apiLoading,
    error: apiError,
    hasFetched,
    fetchContactLinks,
  } = useContactLinks()

  /**
   * Fetch social data from the API
   * Should be called with await in components for SSR compatibility
   */
  const fetchSocialData = async (): Promise<void> => {
    await fetchContactLinks()
  }

  /**
   * Social links with API data or fallback.
   *
   * Fallback is used only when:
   * - The API has not been called yet (initial render before fetch completes)
   * - The API call failed with an error
   *
   * If the API succeeded with 0 social links, an empty array is returned
   * (no fallback), respecting the API as the source of truth.
   */
  const socialLinks = computed<SocialLink[]>(() => {
    // API data is available, use it
    if (apiSocialLinks.value.length > 0) {
      return apiSocialLinks.value
    }

    // API was called and succeeded with no results: respect the empty response
    if (hasFetched.value && !apiError.value) {
      return []
    }

    // API not yet called or API errored: use fallback
    return FALLBACK_SOCIAL_LINKS
  })

  /**
   * Contact info with API data or fallback.
   *
   * Same fallback logic as socialLinks: fallback only when
   * API has not been called yet or has errored.
   */
  const contactInfo = computed<ContactInfo>(() => {
    if (emailContactInfo.value) {
      return emailContactInfo.value
    }

    // API succeeded but no email configured: still use fallback for UX
    // (email is critical contact info that should always be displayed)
    return FALLBACK_CONTACT_INFO
  })

  /**
   * Loading state from the API
   */
  const loading = computed(() => apiLoading.value)

  /**
   * Error state from the API
   */
  const error = computed(() => apiError.value)

  return {
    socialLinks,
    contactInfo,
    loading,
    error,
    theme: 'dark' as const,
    fetchSocialData,
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
    linkedin: '#0A66C2',
    tiktok: '#000000',
    youtube: '#FF0000',
  }

  return colorMap[platform] || '#000000'
}
