/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Centralized about section data management with type-safe API integration
 *
 * Patterns Applied:
 * - Facade: Simplified interface for complex API operations
 * - Adapter: Transforms backend responses to frontend format
 * - Decorator: Adds loading/error state management
 *
 * @example
 * ```typescript
 * const { sections, loading, error, fetchAllSections, createSectionWithImage } = useAboutSections()
 * await fetchAllSections()
 * ```
 */

import type {
  AboutSection,
  CreateAboutSectionDto,
  UpdateAboutSectionDto,
} from '@/types/about-section'

interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

/**
 * About sections management state and operations
 */
export function useAboutSections() {
  // Internal state (reactive)
  const sections = ref<AboutSection[]>([])
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
   * Get authentication headers for API calls
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
        console.error('[useAboutSections] Unauthorized - token invalid/expired')

        // Clear auth state and redirect to login
        if (!import.meta.server) {
          localStorage.removeItem('auth_token')
          await navigateTo('/login')
        }
      }

      // Adapter Pattern: Transform error to standard format
      error.value = {
        statusCode: err.statusCode || err.status || 500,
        message: err.data?.message || err.message || 'An error occurred',
        error: err.data?.error || 'Unknown error',
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all sections (including unpublished) for backoffice
   * Pattern: Facade - simplifies API interaction
   */
  const fetchAllSections = async (): Promise<AboutSection[]> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/about-sections/all`

        console.debug('[useAboutSections] Fetching all sections from:', url)
        console.debug('[useAboutSections] Context:', {
          client: import.meta.client,
          env: process.env.NODE_ENV,
          url: apiUrl,
        })

        return await $fetch<AboutSection[]>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        sections.value = data
      }
    )

    return result || []
  }

  /**
   * Create a new section with image file upload
   * Pattern: Adapter Pattern - Converts form data to multipart/form-data format
   *
   * @param dto - About section data transfer object
   * @param imageFile - Image file to upload
   * @returns Created section or null on error
   */
  const createSectionWithImage = async (
    dto: CreateAboutSectionDto,
    imageFile: File
  ): Promise<AboutSection | null> => {
    const result = await executeApiCall(async () => {
      // Pattern: Builder Pattern - Progressive FormData construction
      const formData = new FormData()

      formData.append('title', dto.title)
      formData.append('paragraphs', JSON.stringify(dto.paragraphs))
      formData.append('imageAlt', dto.imageAlt)
      if (dto.sortOrder !== undefined) {
        formData.append('sortOrder', dto.sortOrder.toString())
      }
      if (dto.isPublished !== undefined) {
        formData.append('isPublished', dto.isPublished.toString())
      }
      formData.append('image', imageFile)

      // Use native fetch for multipart/form-data (Nuxt $fetch doesn't handle FormData well)
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/about-sections/with-upload`

      console.log('[useAboutSections] Creating section with image at:', url)
      console.log('[useAboutSections] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      // Get auth headers (without Content-Type for FormData)
      const headers: HeadersInit = {}
      if (!import.meta.server) {
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        } catch {
          // Ignore localStorage errors
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers, // Authorization header only, browser sets Content-Type with boundary
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to create section',
          statusCode: response.status,
        }))
        throw {
          statusCode: response.status,
          message: errorData.message || 'Failed to create section',
          data: errorData,
        }
      }

      return await response.json()
    })

    return result
  }

  /**
   * Update an existing section (text fields only)
   * Pattern: Facade - simplifies PATCH operation
   */
  const updateSection = async (
    id: string,
    dto: UpdateAboutSectionDto
  ): Promise<AboutSection | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/about-sections/${id}`

      console.log('[useAboutSections] Updating section at:', url)
      console.log('[useAboutSections] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      return await $fetch<AboutSection>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Update local state
    if (result) {
      const index = sections.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        sections.value[index] = result
      }
    }

    return result
  }

  /**
   * Update section image
   * Pattern: Adapter Pattern - Converts file to multipart/form-data
   *
   * @param id - Section ID
   * @param imageFile - New image file
   * @returns Updated section or null on error
   */
  const updateSectionImage = async (
    id: string,
    imageFile: File
  ): Promise<AboutSection | null> => {
    const result = await executeApiCall(async () => {
      const formData = new FormData()
      formData.append('image', imageFile)

      const apiUrl = getApiUrl()
      const url = `${apiUrl}/about-sections/${id}/image`

      console.log('[useAboutSections] Updating section image at:', url)
      console.log('[useAboutSections] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      // Get auth headers (without Content-Type for FormData)
      const headers: HeadersInit = {}
      if (!import.meta.server) {
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        } catch {
          // Ignore localStorage errors
        }
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers, // Authorization header only, browser sets Content-Type with boundary
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to update section image',
          statusCode: response.status,
        }))
        throw {
          statusCode: response.status,
          message: errorData.message || 'Failed to update section image',
          data: errorData,
        }
      }

      return await response.json()
    })

    // Update local state
    if (result) {
      const index = sections.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        sections.value[index] = result
      }
    }

    return result
  }

  /**
   * Delete a section
   */
  const deleteSection = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/about-sections/${id}`

      console.log('[useAboutSections] Deleting section at:', url)
      console.log('[useAboutSections] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      await $fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return true
    })

    // Remove from local state
    if (result) {
      sections.value = sections.value.filter((s) => s.id !== id)
    }

    return result || false
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset all state
   */
  const reset = () => {
    sections.value = []
    loading.value = false
    error.value = null
  }

  /**
   * Computed: Check if sections are loaded
   */
  const hasSections = computed(() => sections.value.length > 0)

  /**
   * Computed: Check if there's an error
   */
  const hasError = computed(() => error.value !== null)

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    sections: readonly(sections) as Readonly<Ref<AboutSection[]>>,
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    error: readonly(error) as Readonly<Ref<ApiError | null>>,

    // Computed
    hasSections,
    hasError,

    // Actions
    fetchAllSections,
    createSectionWithImage,
    updateSection,
    updateSectionImage,
    deleteSection,
    clearError,
    reset,
  }
}
