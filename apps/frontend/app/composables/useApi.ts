/**
 * useApi Composable
 *
 * Thin Facade over `$fetch` that automatically resolves the API base URL
 * for the current execution context (SSR vs browser, dev vs prod) by
 * delegating to `useApiBaseUrl`.
 *
 * Use this everywhere you would have written:
 *   `$fetch(`${useRuntimeConfig().public.apiUrl}/path`)`
 *
 * In dev Docker this prevents the silent bug where the browser cannot
 * resolve the `backend` Docker hostname after a client-side navigation,
 * which makes API-driven content silently fall back to static defaults.
 *
 * Design Patterns Applied:
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Hides URL resolution and `$fetch` defaults behind one call.
 *
 * @example Direct fetch (no SSR cache)
 * ```typescript
 * const { apiFetch } = useApi()
 * const data = await apiFetch<PageContent>(`/page-content/home/hero`)
 * ```
 *
 * @example useAsyncData (SSR-cached)
 * ```typescript
 * const { apiFetch } = useApi()
 * const { data } = await useAsyncData('hero', () =>
 *   apiFetch<PageContent>(`/page-content/home/hero`),
 * )
 * ```
 *
 * @example useFetch with baseURL option
 * ```typescript
 * const { baseUrl } = useApi()
 * const { data } = await useFetch<Product>(`/products/${id}`, {
 *   baseURL: baseUrl,
 *   key: `product-${id}`,
 * })
 * ```
 */

import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export function useApi() {
  const baseUrl = useApiBaseUrl()

  function apiFetch<T>(
    path: string,
    options: NitroFetchOptions<NitroFetchRequest> = {},
  ): Promise<T> {
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`
    return $fetch<T>(url, {
      timeout: 10000,
      ...options,
    })
  }

  return { apiFetch, baseUrl }
}
