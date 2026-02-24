/**
 * Page Content Composable
 *
 * Fetches CMS content for a given page/section combination from the backend API.
 * Uses useState for SSR-safe state transfer, following the same pattern as useHomeGrid.
 *
 * @example
 * ```typescript
 * const { content, loading, error, fetchSection } = usePageContent()
 * await fetchSection('home', 'hero')
 * ```
 */

import type { PageContent } from '~/types/page-content'

export function usePageContent(page: string, section: string) {
  const config = useRuntimeConfig()

  const getApiUrl = (): string => {
    if (import.meta.client) {
      if (process.env.NODE_ENV === 'production') {
        return config.public.apiUrl
      }
      return 'http://localhost:4000/api'
    }
    return config.public.apiUrl
  }

  const stateKey = `page-content-${page}-${section}`
  const content = useState<PageContent | null>(`${stateKey}`, () => null)
  const loading = useState<boolean>(`${stateKey}-loading`, () => false)
  const error = useState<string | null>(`${stateKey}-error`, () => null)

  const fetchSection = async (): Promise<PageContent | null> => {
    loading.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/page-content/${page}/${section}`

      console.log(`[usePageContent] Fetching from: ${url}`)

      const data = await $fetch<PageContent>(url, {
        timeout: 10000,
      })

      content.value = data ?? null
    } catch (e: unknown) {
      console.error(
        `[usePageContent] Error fetching ${page}/${section}:`,
        e instanceof Error ? e.message : e,
      )
      error.value = e instanceof Error ? e.message : String(e)
      content.value = null
    } finally {
      loading.value = false
    }

    return content.value
  }

  return {
    content: readonly(content),
    loading: readonly(loading),
    error: readonly(error),
    fetchSection,
  }
}
