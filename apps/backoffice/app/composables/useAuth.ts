/**
 * @pattern Singleton + Observer + Decorator Patterns
 * @category Composables
 * @purpose Centralized authentication management with JWT token handling
 *
 * Patterns Applied:
 * - Singleton: Single source of truth for auth state
 * - Observer: Reactive state that components can observe
 * - Decorator: Adds loading/error state to async operations
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth()
 * await login({ username: 'admin', password: 'password' })
 * ```
 */

import type { User, AuthResponse, LoginCredentials, ApiError } from '@/types/auth'

/**
 * Authentication state (singleton pattern)
 * Shared across all components that use this composable
 */
const user = ref<User | null>(null)
const token = ref<string | null>(null)
const loading = ref(false)
const error = ref<ApiError | null>(null)

/**
 * Computed: Check if user is authenticated
 */
const isAuthenticated = computed(() => !!token.value && !!user.value)

/**
 * Constants
 */
const TOKEN_KEY = 'auth_token'

/**
 * Authentication composable
 * Manages user authentication state and operations
 */
export function useAuth() {
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
   * Helper: Get stored token from localStorage
   * Pattern: Proxy Pattern - abstracts storage access
   */
  const getStoredToken = (): string | null => {
    if (import.meta.server) return null
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  }

  /**
   * Helper: Store token in localStorage
   */
  const storeToken = (accessToken: string): void => {
    if (import.meta.server) return
    try {
      localStorage.setItem(TOKEN_KEY, accessToken)
    } catch (err) {
      console.error('Failed to store token:', err)
    }
  }

  /**
   * Helper: Remove token from localStorage
   */
  const removeToken = (): void => {
    if (import.meta.server) return
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch (err) {
      console.error('Failed to remove token:', err)
    }
  }

  /**
   * Login user with credentials
   * Pattern: Command Pattern - encapsulates login action
   *
   * @param credentials - Username and password
   * @returns True if login successful, false otherwise
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      console.log('[useAuth] Logging in to:', `${apiUrl}/auth/login`)
      console.log('[useAuth] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      // Call backend login endpoint
      const response = await $fetch<AuthResponse>(`${apiUrl}/auth/login`, {
        method: 'POST',
        body: credentials,
      })

      // Store token
      token.value = response.access_token
      storeToken(response.access_token)

      // Store user
      user.value = response.user

      console.log('[useAuth] Login successful:', user.value)

      // Redirect to home page
      await navigateTo('/')

      return true
    } catch (err: any) {
      console.error('[useAuth] Login error:', err)

      // Adapter Pattern: Transform error to standard format
      error.value = {
        statusCode: err.statusCode || err.status || 401,
        message: err.data?.message || err.message || 'Invalid credentials',
        error: err.data?.error || 'Unauthorized',
      }

      // Clear any stored data
      token.value = null
      user.value = null
      removeToken()

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   * Pattern: Command Pattern - encapsulates logout action
   */
  const logout = async (): Promise<void> => {
    console.log('[useAuth] Logging out')

    // Clear state
    user.value = null
    token.value = null
    error.value = null

    // Clear storage
    removeToken()

    // Redirect to login page
    await navigateTo('/login')
  }

  /**
   * Get user profile from backend
   * Pattern: Decorator Pattern - adds error handling to API call
   *
   * @returns User profile or null if failed
   */
  const getUser = async (): Promise<User | null> => {
    const storedToken = token.value || getStoredToken()

    if (!storedToken) {
      console.log('[useAuth] No token found, cannot fetch user')
      return null
    }

    loading.value = true
    error.value = null

    try {
      const apiUrl = getApiUrl()
      console.log('[useAuth] Fetching user profile from:', `${apiUrl}/auth/profile`)
      console.log('[useAuth] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      // Call backend profile endpoint with JWT token
      const response = await $fetch<User>(`${apiUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      })

      user.value = response
      token.value = storedToken

      console.log('[useAuth] User profile loaded:', user.value)

      return response
    } catch (err: any) {
      console.error('[useAuth] Failed to fetch user profile:', err)

      // If 401, token is invalid/expired
      if (err.statusCode === 401 || err.status === 401) {
        console.log('[useAuth] Token invalid/expired, clearing auth state')
        user.value = null
        token.value = null
        removeToken()
      }

      error.value = {
        statusCode: err.statusCode || err.status || 500,
        message: err.data?.message || err.message || 'Failed to load user profile',
        error: err.data?.error || 'Internal error',
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Initialize authentication state
   * Called on app startup to restore session from localStorage
   * Pattern: Template Method Pattern - defines initialization workflow
   */
  const initAuth = async (): Promise<void> => {
    // Only run on client-side
    if (import.meta.server) return

    console.log('[useAuth] Initializing auth state')

    const storedToken = getStoredToken()

    if (!storedToken) {
      console.log('[useAuth] No stored token found')
      return
    }

    console.log('[useAuth] Found stored token, fetching user profile')

    // Try to load user profile
    await getUser()
  }

  /**
   * Clear error state
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Get current token
   */
  const getToken = (): string | null => {
    return token.value || getStoredToken()
  }

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    user: readonly(user) as Readonly<Ref<User | null>>,
    token: readonly(token) as Readonly<Ref<string | null>>,
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    error: readonly(error) as Readonly<Ref<ApiError | null>>,
    isAuthenticated: readonly(isAuthenticated) as Readonly<ComputedRef<boolean>>,

    // Actions
    login,
    logout,
    getUser,
    initAuth,
    clearError,
    getToken,
  }
}

/**
 * Helper composable: Get authentication headers for API calls
 * Pattern: Adapter Pattern - provides consistent auth headers
 *
 * @example
 * ```typescript
 * const headers = useAuthHeaders()
 * fetch('/api/products', { headers })
 * ```
 */
export function useAuthHeaders(): HeadersInit {
  const { getToken } = useAuth()
  const token = getToken()

  return token
    ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : {
        'Content-Type': 'application/json',
      }
}
