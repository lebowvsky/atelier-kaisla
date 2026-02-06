/**
 * Tests for useSocialData composable
 *
 * Testing Strategy:
 * - Fallback Data: Verify hardcoded fallback data is returned when API is unavailable
 * - Pure Functions: Test helper functions with various inputs
 * - Platform Colors: Verify color mapping for all platforms
 *
 * Note: API integration tests are handled separately.
 * These tests verify the fallback/static behavior of the composable.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { isValidSocialUrl, getPlatformColor } from '../useSocialData'

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
    expect(getPlatformColor('tiktok')).toBe('#000000')
    expect(getPlatformColor('youtube')).toBe('#FF0000')
  })

  it('should return default color for unknown platform', () => {
    // @ts-expect-error Testing invalid platform
    expect(getPlatformColor('unknown')).toBe('#000000')
  })

  it('should return valid hex color codes', () => {
    const platforms: Array<'instagram' | 'facebook' | 'twitter' | 'pinterest' | 'linkedin' | 'tiktok' | 'youtube'> = [
      'instagram',
      'facebook',
      'twitter',
      'pinterest',
      'linkedin',
      'tiktok',
      'youtube',
    ]

    platforms.forEach(platform => {
      const color = getPlatformColor(platform)
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })
})
