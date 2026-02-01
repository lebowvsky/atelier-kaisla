/**
 * ArtworkCard Component Tests
 *
 * Tests the design pattern implementations and component behavior:
 * - Strategy Pattern: Configurable display behavior
 * - Adapter Pattern: Data transformation and formatting
 * - Facade Pattern: Simplified interface for complex data
 *
 * Testing approach:
 * - Unit tests for pattern implementations (computed properties)
 * - Integration tests for component rendering
 * - Accessibility tests for ARIA compliance
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ArtworkCard from '../ArtworkCard.vue'
import type { Artwork, ArtworkCardConfig } from '~/types/artwork'

describe('ArtworkCard - Design Pattern Implementation Tests', () => {
  let mockArtwork: Artwork

  beforeEach(() => {
    mockArtwork = {
      id: 'test-001',
      title: 'Test Artwork',
      imageSrc: '/images/test-artwork.jpg',
      imageAlt: 'A beautiful test artwork for testing purposes',
      dimensions: {
        width: 50,
        height: 70,
        unit: 'cm'
      },
      material: 'Merino wool on cotton warp',
      description: 'This is a test description for the artwork component.',
      price: 199.99,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/test-artwork'
    }
  })

  describe('Adapter Pattern - Data Formatting', () => {
    it('should format 2D dimensions correctly (width × height)', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      expect(wrapper.text()).toContain('50 × 70 cm')
    })

    it('should format 3D dimensions correctly (width × height × depth)', () => {
      const artwork3D = {
        ...mockArtwork,
        dimensions: {
          width: 50,
          height: 70,
          depth: 5,
          unit: 'cm' as const
        }
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: artwork3D }
      })

      expect(wrapper.text()).toContain('50 × 70 × 5 cm')
    })

    it('should format dimensions with imperial units', () => {
      const artworkInches = {
        ...mockArtwork,
        dimensions: {
          width: 20,
          height: 28,
          unit: 'in' as const
        }
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: artworkInches }
      })

      expect(wrapper.text()).toContain('20 × 28 in')
    })

    it('should format price in EUR currency', () => {
      const config: ArtworkCardConfig = {
        showPrice: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      // French locale formats as "199,99 €"
      expect(wrapper.text()).toMatch(/199[,.]99\s*€/)
    })

    it('should not display price when showPrice is false', () => {
      const config: ArtworkCardConfig = {
        showPrice: false
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      expect(wrapper.text()).not.toContain('€')
    })
  })

  describe('Strategy Pattern - Configurable Behavior', () => {
    it('should render as div when not clickable', () => {
      const config: ArtworkCardConfig = {
        clickable: false
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      const linkWrapper = wrapper.find('.artwork-card__link-wrapper')
      expect(linkWrapper.element.tagName).toBe('DIV')
    })

    it('should render as anchor when clickable', () => {
      const config: ArtworkCardConfig = {
        clickable: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      const linkWrapper = wrapper.find('.artwork-card__link-wrapper')
      expect(linkWrapper.element.tagName).toBe('A')
      expect(linkWrapper.attributes('href')).toBe('/wall-hanging/test-artwork')
    })

    it('should apply clickable CSS class when configured', () => {
      const config: ArtworkCardConfig = {
        clickable: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      expect(wrapper.find('.artwork-card--clickable').exists()).toBe(true)
    })

    it('should apply hoverable CSS class when enabled', () => {
      const config: ArtworkCardConfig = {
        enableHover: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      expect(wrapper.find('.artwork-card--hoverable').exists()).toBe(true)
    })

    it('should not apply hoverable class when disabled', () => {
      const config: ArtworkCardConfig = {
        enableHover: false
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      expect(wrapper.find('.artwork-card--hoverable').exists()).toBe(false)
    })

    it('should use custom image aspect ratio', () => {
      const config: ArtworkCardConfig = {
        imageAspectRatio: '16/9'
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      const imageContainer = wrapper.find('.artwork-card__image-container')
      expect(imageContainer.attributes('style')).toContain('aspect-ratio: 16/9')
    })
  })

  describe('Facade Pattern - Availability Status', () => {
    it('should show "Disponible" when available', () => {
      const config: ArtworkCardConfig = {
        showAvailability: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      expect(wrapper.text()).toContain('Disponible')
      expect(wrapper.find('.artwork-card__availability--available').exists()).toBe(true)
    })

    it('should show "Vendu" when not available', () => {
      const soldArtwork = { ...mockArtwork, available: false }
      const config: ArtworkCardConfig = {
        showAvailability: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: soldArtwork, config }
      })

      expect(wrapper.text()).toContain('Vendu')
      expect(wrapper.find('.artwork-card__availability--sold').exists()).toBe(true)
    })

    it('should not show availability when disabled', () => {
      const config: ArtworkCardConfig = {
        showAvailability: false
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      expect(wrapper.find('.artwork-card__availability').exists()).toBe(false)
    })
  })

  describe('Component Rendering', () => {
    it('should render artwork title', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      expect(wrapper.find('.artwork-card__title').text()).toBe('Test Artwork')
    })

    it('should render artwork material', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      expect(wrapper.find('.artwork-card__material').text()).toBe('Merino wool on cotton warp')
    })

    it('should render artwork description', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      expect(wrapper.find('.artwork-card__description').text()).toBe(
        'This is a test description for the artwork component.'
      )
    })

    it('should render image with correct attributes', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      const img = wrapper.find('.artwork-card__image')
      expect(img.attributes('src')).toBe('/images/test-artwork.jpg')
      expect(img.attributes('alt')).toBe('A beautiful test artwork for testing purposes')
      expect(img.attributes('loading')).toBe('lazy')
      expect(img.attributes('decoding')).toBe('async')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA label for the card', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      const article = wrapper.find('article')
      const ariaLabel = article.attributes('aria-label')

      expect(ariaLabel).toContain('Test Artwork')
      expect(ariaLabel).toContain('50 × 70 cm')
      expect(ariaLabel).toContain('Merino wool on cotton warp')
    })

    it('should include price in ARIA label when shown', () => {
      const config: ArtworkCardConfig = {
        showPrice: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      const article = wrapper.find('article')
      const ariaLabel = article.attributes('aria-label')

      expect(ariaLabel).toMatch(/199[,.]99\s*€/)
    })

    it('should include availability in ARIA label when shown', () => {
      const config: ArtworkCardConfig = {
        showAvailability: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      const article = wrapper.find('article')
      const ariaLabel = article.attributes('aria-label')

      expect(ariaLabel).toContain('Disponible')
    })

    it('should have ARIA label for clickable link', () => {
      const config: ArtworkCardConfig = {
        clickable: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config }
      })

      const link = wrapper.find('a')
      expect(link.attributes('aria-label')).toContain('View details of Test Artwork')
    })

    it('should use semantic HTML with article element', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      expect(wrapper.find('article').exists()).toBe(true)
    })

    it('should use figure and figcaption semantics', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      expect(wrapper.find('figure').exists()).toBe(true)
    })

    it('should use proper heading level (h3)', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      expect(wrapper.find('h3').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Test Artwork')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing detailUrl gracefully', () => {
      const artworkNoUrl = { ...mockArtwork, detailUrl: undefined }
      const config: ArtworkCardConfig = {
        clickable: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: artworkNoUrl, config }
      })

      // Should render as div when no URL despite clickable: true
      const linkWrapper = wrapper.find('.artwork-card__link-wrapper')
      expect(linkWrapper.element.tagName).toBe('DIV')
    })

    it('should handle missing price gracefully', () => {
      const artworkNoPrice = { ...mockArtwork, price: undefined }
      const config: ArtworkCardConfig = {
        showPrice: true
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: artworkNoPrice, config }
      })

      expect(wrapper.find('.artwork-card__price').exists()).toBe(false)
    })

    it('should handle default unit (cm)', () => {
      const artworkDefaultUnit = {
        ...mockArtwork,
        dimensions: {
          width: 50,
          height: 70
          // unit not specified
        }
      }

      const wrapper = mount(ArtworkCard, {
        props: { artwork: artworkDefaultUnit }
      })

      expect(wrapper.text()).toContain('50 × 70 cm')
    })

    it('should render footer only when price or availability shown', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config: { showPrice: false, showAvailability: false } }
      })

      expect(wrapper.find('.artwork-card__footer').exists()).toBe(false)
    })

    it('should render footer when price is shown', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork, config: { showPrice: true } }
      })

      expect(wrapper.find('.artwork-card__footer').exists()).toBe(true)
    })
  })

  describe('Default Configuration', () => {
    it('should use default config values when not provided', () => {
      const wrapper = mount(ArtworkCard, {
        props: { artwork: mockArtwork }
      })

      // Default: not clickable
      expect(wrapper.find('.artwork-card--clickable').exists()).toBe(false)

      // Default: no price
      expect(wrapper.find('.artwork-card__price').exists()).toBe(false)

      // Default: no availability
      expect(wrapper.find('.artwork-card__availability').exists()).toBe(false)

      // Default: hoverable
      expect(wrapper.find('.artwork-card--hoverable').exists()).toBe(true)

      // Default aspect ratio: 4/3
      const imageContainer = wrapper.find('.artwork-card__image-container')
      expect(imageContainer.attributes('style')).toContain('aspect-ratio: 4/3')
    })
  })
})
