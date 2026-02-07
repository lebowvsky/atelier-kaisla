/**
 * Contact Links API Composable
 *
 * Fetches contact links from the backend API (GET /api/contact-links)
 * and provides helper methods to access specific link types.
 *
 * @pattern Adapter Pattern
 * @category Structural
 * @purpose Converts backend ContactLink entities to frontend SocialLink interfaces
 *
 * @pattern Facade Pattern
 * @category Structural
 * @purpose Simplifies API interaction with convenient helper methods
 *
 * @example
 * ```typescript
 * const { contactLinks, socialLinks, emailLink, loading, error, fetchContactLinks } = useContactLinks()
 * await fetchContactLinks()
 * ```
 */

import type { ContactLink, ContactPlatform } from '~/types/contact-link'
import type { SocialLink, SocialPlatform, ContactInfo } from '~/types/social'
import { SOCIAL_ICONS, FALLBACK_ICON_PATH } from '~/utils/socialIcons'

/**
 * Allowed URL protocols for contact links.
 * Any URL not starting with one of these is considered unsafe and filtered out.
 */
const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:']

/**
 * Validate that a URL uses a safe protocol (http, https, or mailto).
 * Prevents XSS via javascript: or data: URIs injected through the API.
 *
 * @param url - The URL to validate
 * @returns true if the URL uses a safe protocol
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Display names for each platform
 */
const PLATFORM_NAMES: Record<ContactPlatform, string> = {
  email: 'Email',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
  twitter: 'Twitter',
  website: 'Website',
  other: 'Link',
}

/**
 * Set of platforms that are social media (not email/website/other).
 * Used to filter contact links into social-only links.
 */
const SOCIAL_PLATFORM_SET: ReadonlySet<ContactPlatform> = new Set<ContactPlatform>([
  'facebook',
  'instagram',
  'tiktok',
  'linkedin',
  'pinterest',
  'youtube',
  'twitter',
])

/**
 * Type guard: checks whether a ContactPlatform is also a SocialPlatform.
 *
 * ContactPlatform is a superset of SocialPlatform (it includes 'email', 'website', 'other').
 * This guard narrows the type safely without a double cast.
 *
 * @param platform - The ContactPlatform value to check
 * @returns true if the platform is a valid SocialPlatform
 */
function isSocialPlatform(platform: ContactPlatform): platform is SocialPlatform {
  return SOCIAL_PLATFORM_SET.has(platform)
}

/**
 * Adapter: Convert backend ContactLink to frontend SocialLink
 *
 * @param contactLink - Backend contact link entity (must have a social platform)
 * @returns Frontend SocialLink interface for SocialShare component
 */
function adaptContactLinkToSocialLink(contactLink: ContactLink & { platform: SocialPlatform }): SocialLink {
  const name = PLATFORM_NAMES[contactLink.platform] || contactLink.platform

  return {
    platform: contactLink.platform,
    name,
    url: contactLink.url,
    ariaLabel: `Visit Atelier Kaisla on ${name}`,
    iconPath: SOCIAL_ICONS[contactLink.platform] ?? FALLBACK_ICON_PATH,
    order: contactLink.sortOrder,
    isActive: contactLink.isActive,
  }
}

/**
 * Extract email as ContactInfo from contact links
 *
 * @param emailLink - The email ContactLink from the API
 * @returns ContactInfo for the SocialShare component
 */
function adaptEmailToContactInfo(emailLink: ContactLink): ContactInfo {
  // Extract email address from mailto: URL or use url directly
  const email = emailLink.url.startsWith('mailto:')
    ? emailLink.url.replace('mailto:', '')
    : emailLink.url

  return {
    label: emailLink.label || 'For ordering a unique Kaisla rug:',
    email,
    ariaLabel: `Send an email to ${email}`,
  }
}

/**
 * Main composable for fetching contact links from the API
 *
 * Follows the same patterns as useAboutSections:
 * - Uses $fetch for SSR/client compatibility
 * - Manages loading and error states
 * - Provides helper methods for filtering by type
 */
export function useContactLinks() {
  const config = useRuntimeConfig()

  /**
   * Get API URL based on environment and execution context
   * Same logic as useProducts/useAboutSections for consistency
   */
  const getApiUrl = (): string => {
    if (import.meta.client) {
      if (process.env.NODE_ENV === 'production') {
        return config.public.apiUrl
      }
      return 'http://localhost:4000/api'
    }
    return config.public.apiUrl
  }

  // Use Nuxt's useState for SSR-safe shared state.
  // useState serializes state from server to client via Nuxt payload,
  // preventing hydration mismatches when the composable is used across components.
  const contactLinks = useState<ContactLink[]>('contact-links-data', () => [])
  const loading = useState<boolean>('contact-links-loading', () => false)
  const error = useState<Error | null>('contact-links-error', () => null)
  const hasFetched = useState<boolean>('contact-links-has-fetched', () => false)

  /**
   * Fetch active contact links from the API
   */
  const fetchContactLinks = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/contact-links`

      const data = await $fetch<ContactLink[]>(url, {
        timeout: 10000,
      })

      if (data && Array.isArray(data)) {
        // Filter out links with unsafe URLs to prevent XSS
        contactLinks.value = data.filter(link => isSafeUrl(link.url))
      } else {
        contactLinks.value = []
      }
    } catch (e: unknown) {
      const err = e as Error
      console.error('[useContactLinks] Error fetching contact links:', err.message || err)
      error.value = err
      contactLinks.value = []
    } finally {
      hasFetched.value = true
      loading.value = false
    }
  }

  /**
   * Get social media links only (excludes email, website, other)
   * Adapted to SocialLink interface for the SocialShare component
   */
  const socialLinks = computed<SocialLink[]>(() => {
    return contactLinks.value
      .filter((link): link is ContactLink & { platform: SocialPlatform } =>
        isSocialPlatform(link.platform),
      )
      .map(adaptContactLinkToSocialLink)
  })

  /**
   * Get the email contact link
   * Returns the first active email link, or null if none found
   */
  const emailLink = computed<ContactLink | null>(() => {
    return contactLinks.value.find(link => link.platform === 'email') ?? null
  })

  /**
   * Get email as ContactInfo for the SocialShare component
   * Returns adapted ContactInfo or null if no email link exists
   */
  const emailContactInfo = computed<ContactInfo | null>(() => {
    if (!emailLink.value) return null
    return adaptEmailToContactInfo(emailLink.value)
  })

  /**
   * Get a contact link by platform
   *
   * @param platform - The platform to search for
   * @returns The matching ContactLink or null
   */
  const getLinkByPlatform = (platform: ContactPlatform): ContactLink | null => {
    return contactLinks.value.find(link => link.platform === platform) ?? null
  }

  return {
    // State
    contactLinks: readonly(contactLinks),
    loading: readonly(loading),
    error: readonly(error),
    hasFetched: readonly(hasFetched),

    // Computed helpers
    socialLinks,
    emailLink,
    emailContactInfo,

    // Methods
    fetchContactLinks,
    getLinkByPlatform,
  }
}
