/**
 * Page Content Composable
 *
 * Fetches CMS content for a given page/section combination from the backend API.
 * Uses useState for SSR-safe state transfer, following the same pattern as useHomeGrid.
 *
 * @example
 * ```typescript
 * const { content, loading, error, isEmpty, fetchSection } = usePageContent('home', 'hero')
 * await fetchSection()
 * ```
 */

import type { PageContent } from '~/types/page-content'
import { isPageContentEmpty } from '~/utils/pageContent'

function isFetchErrorWithStatus(e: unknown, status: number): boolean {
  if (typeof e !== 'object' || e === null) return false
  const err = e as { statusCode?: unknown, response?: { status?: unknown } }
  if (err.statusCode === status) return true
  if (err.response && typeof err.response === 'object' && err.response.status === status) return true
  return false
}

export function usePageContent(page: string, section: string) {
  const { apiFetch } = useApi()

  const stateKey = `page-content-${page}-${section}`
  const content = useState<PageContent | null>(`${stateKey}`, () => null)
  const loading = useState<boolean>(`${stateKey}-loading`, () => false)
  const error = useState<string | null>(`${stateKey}-error`, () => null)

  const fetchSection = async (): Promise<PageContent | null> => {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch<PageContent>(`/page-content/${page}/${section}`)

      content.value = data ?? null
    } catch (e: unknown) {
      // A missing section is now a normal, expected state — the frontoffice
      // simply hides anything the backoffice has not filled in.
      if (isFetchErrorWithStatus(e, 404)) {
        content.value = null
        error.value = null
      } else {
        console.error(
          `[usePageContent] Error fetching ${page}/${section}:`,
          e instanceof Error ? e.message : e,
        )
        error.value = e instanceof Error ? e.message : String(e)
        content.value = null
      }
    } finally {
      loading.value = false
    }

    return content.value
  }

  const isEmpty = computed(() => isPageContentEmpty(content.value))

  return {
    content: readonly(content),
    loading: readonly(loading),
    error: readonly(error),
    isEmpty,
    fetchSection,
  }
}
