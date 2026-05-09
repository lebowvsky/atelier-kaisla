/**
 * useApiBaseUrl Composable
 *
 * Resolves the API base URL based on execution context (server vs client) and
 * environment (development vs production). Centralizes the logic that was
 * previously duplicated across `useProducts`, `usePageContent`, and the
 * collection pages.
 *
 * Development:
 *   - Client-side: http://localhost:4000/api
 *     (browser cannot resolve Docker service hostnames)
 *   - Server-side: http://backend:4000/api
 *     (Nuxt SSR runs inside Docker and reaches the backend container)
 *
 * Production:
 *   - Both server and client: NUXT_PUBLIC_API_URL (e.g. https://api.lebowvsky.com)
 *
 * Design Patterns Applied:
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Hides environment-specific URL resolution behind one call.
 *
 * @example
 * ```typescript
 * const apiUrl = useApiBaseUrl()
 * const data = await $fetch(`${apiUrl}/products/${id}`)
 * ```
 */
export function useApiBaseUrl(): string {
  const config = useRuntimeConfig()

  // Client-side (browser)
  if (import.meta.client) {
    if (process.env.NODE_ENV === 'production') {
      return config.public.apiUrl as string
    }
    return 'http://localhost:4000/api'
  }

  // Server-side (SSR): always use the runtime config value
  // Dev: http://backend:4000/api, Prod: https://api.lebowvsky.com
  return config.public.apiUrl as string
}
