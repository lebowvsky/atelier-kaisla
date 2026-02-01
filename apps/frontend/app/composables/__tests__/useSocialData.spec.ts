/**
 * Tests for useSocialData composable
 *
 * Testing Strategy:
 * - Factory Pattern: Verify createSocialLink generates correct structure
 * - Data Integrity: Ensure hardcoded data matches expected format
 * - Pure Functions: Test helper functions with various inputs
 * - Sorting Strategy: Verify social links are sorted by order
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { useSocialData, isValidSocialUrl, getPlatformColor } from '../useSocialData'
import type { SocialLink, ContactInfo } from '~/types/social'

describe('useSocialData - Factory + Adapter Pattern', () => {
  describe('Social Links Data', () => {
    it('should return social links array', () => {
      const { socialLinks } = useSocialData()

      expect(socialLinks).toBeDefined()
      expect(Array.isArray(socialLinks)).toBe(true)
      expect(socialLinks.length).toBeGreaterThan(0)
    })

    it('should include Instagram and Facebook links', () => {
      const { socialLinks } = useSocialData()

      const platforms = socialLinks.map(link => link.platform)
      expect(platforms).toContain('instagram')
      expect(platforms).toContain('facebook')
    })

    it('should have valid SocialLink structure', () => {
      const { socialLinks } = useSocialData()

      socialLinks.forEach((link: SocialLink) => {
        expect(link).toHaveProperty('platform')
        expect(link).toHaveProperty('name')
        expect(link).toHaveProperty('url')
        expect(link).toHaveProperty('ariaLabel')
        expect(link).toHaveProperty('iconPath')
        expect(link).toHaveProperty('isActive')

        // Type checks
        expect(typeof link.platform).toBe('string')
        expect(typeof link.name).toBe('string')
        expect(typeof link.url).toBe('string')
        expect(typeof link.ariaLabel).toBe('string')
        expect(typeof link.iconPath).toBe('string')
        expect(typeof link.isActive).toBe('boolean')
      })
    })

    it('should have valid URLs', () => {
      const { socialLinks } = useSocialData()

      socialLinks.forEach(link => {
        expect(isValidSocialUrl(link.url)).toBe(true)
      })
    })

    it('should have descriptive aria labels', () => {
      const { socialLinks } = useSocialData()

      socialLinks.forEach(link => {
        expect(link.ariaLabel).toContain('Atelier Kaisla')
        expect(link.ariaLabel).toContain(link.name)
      })
    })

    it('should be sorted by order property', () => {
      const { socialLinks } = useSocialData()

      // Check if sorted (each order should be >= previous)
      for (let i = 1; i < socialLinks.length; i++) {
        const prevOrder = socialLinks[i - 1].order ?? 0
        const currOrder = socialLinks[i].order ?? 0
        expect(currOrder).toBeGreaterThanOrEqual(prevOrder)
      }
    })

    it('should only include active links', () => {
      const { socialLinks } = useSocialData()

      socialLinks.forEach(link => {
        expect(link.isActive).toBe(true)
      })
    })

    it('should have SVG icon paths', () => {
      const { socialLinks } = useSocialData()

      socialLinks.forEach(link => {
        expect(link.iconPath).toBeTruthy()
        expect(link.iconPath.length).toBeGreaterThan(0)
        // SVG paths typically contain M (moveto) commands
        expect(link.iconPath).toMatch(/M|m/)
      })
    })
  })

  describe('Contact Information', () => {
    it('should return contact info object', () => {
      const { contactInfo } = useSocialData()

      expect(contactInfo).toBeDefined()
      expect(contactInfo).toHaveProperty('email')
      expect(contactInfo).toHaveProperty('label')
    })

    it('should have valid email address', () => {
      const { contactInfo } = useSocialData()

      expect(contactInfo.email).toContain('@')
      expect(contactInfo.email).toContain('atelierkaisla.com')
      expect(contactInfo.email).toBe('eloise@atelierkaisla.com')
    })

    it('should have descriptive label', () => {
      const { contactInfo } = useSocialData()

      expect(contactInfo.label).toContain('ordering')
      expect(contactInfo.label).toContain('Kaisla')
    })

    it('should have aria label for accessibility', () => {
      const { contactInfo } = useSocialData()

      expect(contactInfo.ariaLabel).toBeDefined()
      if (contactInfo.ariaLabel) {
        expect(contactInfo.ariaLabel.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Configuration', () => {
    it('should return theme property', () => {
      const { theme } = useSocialData()

      expect(theme).toBeDefined()
      expect(['light', 'dark']).toContain(theme)
    })
  })
})

describe('isValidSocialUrl - Pure Function', () => {
  it('should return true for valid HTTPS URLs', () => {
    expect(isValidSocialUrl('https://instagram.com/atelierkaisla')).toBe(true)
    expect(isValidSocialUrl('https://facebook.com/atelierkaisla')).toBe(true)
  })

  it('should return true for valid HTTP URLs', () => {
    expect(isValidSocialUrl('http://example.com')).toBe(true)
  })

  it('should return false for invalid URLs', () => {
    expect(isValidSocialUrl('not-a-url')).toBe(false)
    expect(isValidSocialUrl('ftp://invalid-protocol.com')).toBe(false)
    expect(isValidSocialUrl('')).toBe(false)
    expect(isValidSocialUrl('javascript:alert("xss")')).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(isValidSocialUrl('https://')).toBe(false)
    expect(isValidSocialUrl('https://a')).toBe(true) // Technically valid
  })
})

describe('getPlatformColor - Strategy Pattern', () => {
  it('should return correct brand colors for platforms', () => {
    expect(getPlatformColor('instagram')).toBe('#E4405F')
    expect(getPlatformColor('facebook')).toBe('#1877F2')
    expect(getPlatformColor('twitter')).toBe('#1DA1F2')
    expect(getPlatformColor('pinterest')).toBe('#E60023')
    expect(getPlatformColor('linkedin')).toBe('#0A66C2')
  })

  it('should return default color for unknown platform', () => {
    // @ts-expect-error Testing invalid platform
    expect(getPlatformColor('unknown')).toBe('#000000')
  })

  it('should return valid hex color codes', () => {
    const platforms: Array<'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'linkedin'> = [
      'instagram',
      'facebook',
      'twitter',
      'pinterest',
      'linkedin'
    ]

    platforms.forEach(platform => {
      const color = getPlatformColor(platform)
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })
})

describe('Integration: API-Ready Structure', () => {
  it('should match expected API response format', () => {
    const { socialLinks, contactInfo, theme } = useSocialData()

    // This structure should match future API response
    const apiReadyConfig = {
      socialLinks,
      contactInfo,
      theme
    }

    expect(apiReadyConfig).toHaveProperty('socialLinks')
    expect(apiReadyConfig).toHaveProperty('contactInfo')
    expect(apiReadyConfig).toHaveProperty('theme')

    // Verify it can be serialized (for API calls)
    expect(() => JSON.stringify(apiReadyConfig)).not.toThrow()
  })

  it('should support filtering by platform', () => {
    const { socialLinks } = useSocialData()

    const instagramLink = socialLinks.find(link => link.platform === 'instagram')
    expect(instagramLink).toBeDefined()
    expect(instagramLink?.name).toBe('Instagram')
  })

  it('should support easy extension with new platforms', () => {
    const { socialLinks } = useSocialData()

    // Currently has Instagram and Facebook
    expect(socialLinks.length).toBe(2)

    // Structure allows easy addition of more platforms
    // Just uncomment in useSocialData.ts:
    // createSocialLink('pinterest', 'Pinterest', '...', SOCIAL_ICONS.pinterest, 3)
  })
})
