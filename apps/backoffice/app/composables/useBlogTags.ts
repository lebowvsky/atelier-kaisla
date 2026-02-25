/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Centralized blog tag data management with type-safe API integration
 *
 * Patterns Applied:
 * - Facade: Simplified interface for complex API operations
 * - Adapter: Transforms backend responses to frontend format (via useApi)
 * - Decorator: Adds loading/error state management (via useApi)
 *
 * @example
 * ```typescript
 * const { tags, loading, error, fetchAllTags, createTag } = useBlogTags()
 * await fetchAllTags()
 * ```
 */

import type {
  BlogTag,
  CreateBlogTagDto,
  UpdateBlogTagDto,
} from '@/types/blog'

/**
 * Blog tags management state and operations
 */
export function useBlogTags() {
  // Internal state (reactive)
  const tags = ref<BlogTag[]>([])

  // Shared API infrastructure
  const {
    loading,
    error,
    hasError,
    getApiUrl,
    getAuthHeaders,
    executeApiCall,
    clearError,
  } = useApi('useBlogTags')

  /**
   * Fetch all tags
   * Pattern: Facade - simplifies API interaction
   */
  const fetchAllTags = async (): Promise<BlogTag[]> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/blog/tags`

        console.debug('[useBlogTags] Fetching all tags from:', url)
        console.debug('[useBlogTags] Context:', {
          client: import.meta.client,
          env: process.env.NODE_ENV,
          url: apiUrl,
        })

        return await $fetch<BlogTag[]>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        tags.value = data
      }
    )

    return result || []
  }

  /**
   * Create a new tag
   * Pattern: Facade - simplifies POST operation
   */
  const createTag = async (dto: CreateBlogTagDto): Promise<BlogTag | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/tags`

      console.log('[useBlogTags] Creating tag at:', url)
      console.log('[useBlogTags] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      return await $fetch<BlogTag>(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Add to local state
    if (result) {
      tags.value.push(result)
    }

    return result
  }

  /**
   * Update an existing tag
   * Pattern: Facade - simplifies PATCH operation
   */
  const updateTag = async (
    id: string,
    dto: UpdateBlogTagDto
  ): Promise<BlogTag | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/tags/${id}`

      console.log('[useBlogTags] Updating tag at:', url)
      console.log('[useBlogTags] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      return await $fetch<BlogTag>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Update local state
    if (result) {
      const index = tags.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tags.value[index] = result
      }
    }

    return result
  }

  /**
   * Delete a tag
   */
  const deleteTag = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/tags/${id}`

      console.log('[useBlogTags] Deleting tag at:', url)
      console.log('[useBlogTags] Context:', {
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
      tags.value = tags.value.filter((t) => t.id !== id)
    }

    return result || false
  }

  /**
   * Reset all state
   */
  const reset = () => {
    tags.value = []
    clearError()
  }

  /**
   * Computed: Check if tags are loaded
   */
  const hasTags = computed(() => tags.value.length > 0)

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    tags: readonly(tags) as Readonly<Ref<BlogTag[]>>,
    loading,
    error,

    // Computed
    hasTags,
    hasError,

    // Actions
    fetchAllTags,
    createTag,
    updateTag,
    deleteTag,
    clearError,
    reset,
  }
}
