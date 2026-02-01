/**
 * Story Type Definitions
 *
 * TypeScript interfaces for story sections used on the About page.
 * These types ensure type safety and provide clear contracts for story data.
 *
 * Design Pattern: Adapter Pattern
 * - Ready for API integration
 * - Easy transformation from external data sources
 *
 * @module types/story
 */

/**
 * Image position in story section
 * Used for alternating layout patterns
 */
export type ImagePosition = 'left' | 'right'

/**
 * Story section data structure
 *
 * @example
 * ```typescript
 * const story: Story = {
 *   id: 'creator',
 *   title: 'L\'Histoire de la Créatrice',
 *   image: {
 *     src: '/images/creator.jpg',
 *     alt: 'Portrait de la créatrice'
 *   },
 *   content: 'Lorem ipsum...',
 *   imagePosition: 'left'
 * }
 * ```
 */
export interface Story {
  /**
   * Unique identifier for the story
   * Used for keys in v-for loops and potential routing
   */
  id: string

  /**
   * Story section title
   * Displayed as an h2 heading
   */
  title: string

  /**
   * Image configuration
   */
  image: {
    /**
     * Image source path
     * Can be relative (/images/...) or absolute URL
     */
    src: string

    /**
     * Alternative text for accessibility
     * Required for WCAG compliance
     */
    alt: string

    /**
     * Optional width hint for responsive images
     */
    width?: number

    /**
     * Optional height hint for responsive images
     */
    height?: number
  }

  /**
   * Story content text
   * Supports multi-paragraph content (rendered with v-html or split by \n\n)
   */
  content: string

  /**
   * Image position in layout
   * @default 'left'
   */
  imagePosition?: ImagePosition

  /**
   * Optional custom theme for this section
   * Allows for visual variety across sections
   */
  theme?: 'light' | 'dark'

  /**
   * Optional CTA (Call to Action) button
   * Future enhancement for linking to related content
   */
  cta?: {
    text: string
    url: string
    ariaLabel: string
  }
}

/**
 * Collection of stories for a page
 * Typically used for About page sections
 */
export interface StoryCollection {
  /**
   * Collection identifier
   */
  id: string

  /**
   * Page or section title
   */
  title: string

  /**
   * Array of story sections
   */
  stories: Story[]

  /**
   * Optional metadata for SEO
   */
  metadata?: {
    description?: string
    keywords?: string[]
    author?: string
  }
}
