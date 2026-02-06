/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Shared API infrastructure for all composables: URL resolution, auth headers, and error handling
 *
 * Patterns Applied:
 * - Adapter: Environment-specific API URL resolution and auth header construction
 * - Decorator: Wraps async operations with loading/error state management
 * - Facade: Simplified interface for API call execution
 *
 * @example
 * ```typescript
 * const { getApiUrl, getAuthHeaders, getAuthHeadersForFormData, executeApiCall, loading, error, clearError } = useApi('myModule')
 * const result = await executeApiCall(async () => {
 *   return await $fetch<MyType>(`${getApiUrl()}/my-endpoint`, {
 *     method: 'GET',
 *     headers: getAuthHeaders(),
 *   })
 * })
 * ```
 */

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

/**
 * Shared API infrastructure composable
 *
 * @param moduleName - Name used in console logs for debugging (e.g. 'useProducts')
 */
export function useApi(moduleName: string = 'useApi') {
  // Internal state (reactive)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  // Runtime configuration
  const config = useRuntimeConfig()

  /**
   * Get API URL based on environment and execution context
   * Pattern: Adapter Pattern for environment-specific configuration
   *
   * Development:
   *   - Client-side: http://localhost:4000/api (browser can't access Docker hostnames)
   *   - Server-side: http://backend:4000/api (Nuxt in Docker can access backend container)
   *
   * Production:
   *   - Client-side: https://api.lebowvsky.com (public URL)
   *   - Server-side: https://api.lebowvsky.com (public URL)
   */
  const getApiUrl = (): string => {
    // Client-side (browser)
    if (import.meta.client) {
      // Production: use public API URL from environment
      if (process.env.NODE_ENV === 'production') {
        return config.public.apiUrl
      }
      // Development: force localhost (backend hostname not accessible from browser)
      return 'http://localhost:4000/api'
    }

    // Server-side (SSR): always use environment variable
    // Dev: http://backend:4000/api
    // Prod: https://api.lebowvsky.com
    return config.public.apiUrl || 'http://backend:4000/api'
  }

  /**
   * Get authentication headers for JSON API calls
   * Pattern: Adapter Pattern - provides consistent auth headers
   */
  const getAuthHeaders = (): HeadersInit => {
    // Only run on client-side (localStorage)
    if (import.meta.server) {
      return {
        'Content-Type': 'application/json',
      }
    }

    try {
      const token = localStorage.getItem('auth_token')
      return token
        ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : {
            'Content-Type': 'application/json',
          }
    } catch {
      return {
        'Content-Type': 'application/json',
      }
    }
  }

  /**
   * Get authentication headers for FormData uploads (no Content-Type -- browser sets boundary)
   * Pattern: Adapter Pattern - provides auth-only headers for multipart requests
   */
  const getAuthHeadersForFormData = (): HeadersInit => {
    if (import.meta.server) {
      return {}
    }

    try {
      const token = localStorage.getItem('auth_token')
      return token
        ? { 'Authorization': `Bearer ${token}` }
        : {}
    } catch {
      return {}
    }
  }

  /**
   * Normalize error message from API response.
   * NestJS validation errors can return a string[] which needs to be joined.
   */
  const normalizeErrorMessage = (rawMessage: unknown): string => {
    if (Array.isArray(rawMessage)) {
      return rawMessage.join('. ')
    }
    if (typeof rawMessage === 'string' && rawMessage.length > 0) {
      return rawMessage
    }
    return 'An error occurred'
  }

  /**
   * Helper: Execute API call with error handling (Decorator Pattern)
   * Wraps async operations with loading/error state management
   */
  const executeApiCall = async <T>(
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void
  ): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      onSuccess?.(result)
      return result
    } catch (err: any) {
      console.error('API Error:', err)

      // Check for 401 Unauthorized - token invalid/expired
      if (err.statusCode === 401 || err.status === 401) {
        console.error(`[${moduleName}] Unauthorized - token invalid/expired`)

        // Clear auth state and redirect to login
        if (!import.meta.server) {
          localStorage.removeItem('auth_token')
          await navigateTo('/login')
        }
      }

      // Adapter Pattern: Transform error to standard format
      // Normalize message: NestJS validation returns string[], join them for display
      error.value = {
        statusCode: err.statusCode || err.status || 500,
        message: normalizeErrorMessage(err.data?.message || err.message),
        error: err.data?.error || 'Unknown error',
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Computed: Check if there's an error
   */
  const hasError = computed(() => error.value !== null)

  return {
    // State (readonly)
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    error: readonly(error) as Readonly<Ref<ApiError | null>>,

    // Computed
    hasError,

    // Utilities
    getApiUrl,
    getAuthHeaders,
    getAuthHeadersForFormData,
    executeApiCall,
    clearError,
  }
}
