/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Centralized about section data management with type-safe API integration
 *
 * Patterns Applied:
 * - Facade: Simplified interface for complex API operations
 * - Adapter: Transforms backend responses to frontend format (via useApi)
 * - Decorator: Adds loading/error state management (via useApi)
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

/**
 * About sections management state and operations
 */
export function useAboutSections() {
  // Internal state (reactive)
  const sections = ref<AboutSection[]>([])

  // Shared API infrastructure
  const {
    loading,
    error,
    hasError,
    getApiUrl,
    getAuthHeaders,
    getAuthHeadersForFormData,
    executeApiCall,
    clearError,
  } = useApi('useAboutSections')

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

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
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

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeadersForFormData(),
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
   * Reset all state
   */
  const reset = () => {
    sections.value = []
    clearError()
  }

  /**
   * Computed: Check if sections are loaded
   */
  const hasSections = computed(() => sections.value.length > 0)

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    sections: readonly(sections) as Readonly<Ref<AboutSection[]>>,
    loading,
    error,

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
