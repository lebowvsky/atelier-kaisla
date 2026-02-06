/**
 * About Sections API Composable
 *
 * Fetches about sections from the backend API and adapts them
 * to the frontend Story interface for display in the About page.
 *
 * @pattern Adapter Pattern
 * @category Structural
 * @purpose Converts backend AboutSection entities to frontend Story interfaces
 *
 * @pattern Facade Pattern
 * @category Structural
 * @purpose Simplifies API interaction into a single composable call
 *
 * @example
 * ```typescript
 * const { stories, loading, error } = useAboutSections()
 * ```
 */

import type { AboutSection } from '~/types/about-section'
import type { Story } from '~/types/story'

/**
 * Adapter: Convert backend AboutSection to frontend Story
 *
 * @param section - Backend about section entity
 * @param index - Section index, used to alternate image position
 * @returns Frontend Story interface
 */
function adaptAboutSectionToStory(section: AboutSection, index: number): Story {
  return {
    id: section.id,
    title: section.title,
    image: {
      src: section.image,
      alt: section.imageAlt,
    },
    // Join paragraphs with double newline for StorySection component compatibility
    content: section.paragraphs.join('\n\n'),
    // Alternate image position for visual rhythm
    imagePosition: index % 2 === 0 ? 'left' : 'right',
  }
}

/**
 * Main composable for fetching about sections from the API
 *
 * Follows the same patterns as useProducts:
 * - Uses $fetch for SSR/client compatibility
 * - Manages loading and error states
 * - Falls back to mock data if API is unavailable
 */
export function useAboutSections() {
  const config = useRuntimeConfig()

  /**
   * Get API URL based on environment and execution context
   * Same logic as useProducts for consistency
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

  const stories = ref<Story[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Fetch published about sections from the API
   */
  const fetchAboutSections = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/about-sections`

      console.log(`[useAboutSections] Fetching from: ${url} (${import.meta.server ? 'server' : 'client'})`)

      const data = await $fetch<AboutSection[]>(url, {
        timeout: 10000,
      })

      if (data && Array.isArray(data)) {
        console.log(`[useAboutSections] Fetched ${data.length} sections`)
        stories.value = data.map(adaptAboutSectionToStory)
      } else {
        console.warn('[useAboutSections] No data received or invalid format')
        stories.value = []
      }
    } catch (e: unknown) {
      const err = e as Error
      console.error('[useAboutSections] Error fetching about sections:', err.message || err)
      error.value = err
      stories.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    stories: readonly(stories),
    loading: readonly(loading),
    error: readonly(error),
    fetchAboutSections,
  }
}
