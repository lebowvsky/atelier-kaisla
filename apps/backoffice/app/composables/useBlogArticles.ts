/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Centralized blog article data management with type-safe API integration
 *
 * Patterns Applied:
 * - Facade: Simplified interface for complex API operations
 * - Adapter: Transforms backend responses to frontend format (via useApi)
 * - Decorator: Adds loading/error state management (via useApi)
 *
 * @example
 * ```typescript
 * const { articles, loading, error, fetchAllArticles, createArticleWithImages } = useBlogArticles()
 * await fetchAllArticles()
 * ```
 */

import type {
  BlogArticle,
  BlogArticleImage,
  CreateBlogArticleDto,
  UpdateBlogArticleDto,
} from '@/types/blog'

/**
 * Blog articles management state and operations
 */
export function useBlogArticles() {
  // Internal state (reactive)
  const articles = ref<BlogArticle[]>([])

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
  } = useApi('useBlogArticles')

  /**
   * Fetch all articles (including unpublished) for backoffice
   * Pattern: Facade - simplifies API interaction
   */
  const fetchAllArticles = async (): Promise<BlogArticle[]> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/blog/all`

        console.debug('[useBlogArticles] Fetching all articles from:', url)
        console.debug('[useBlogArticles] Context:', {
          client: import.meta.client,
          env: process.env.NODE_ENV,
          url: apiUrl,
        })

        return await $fetch<BlogArticle[]>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        articles.value = data
      }
    )

    return result || []
  }

  /**
   * Create a new article with image file uploads
   * Pattern: Adapter Pattern - Converts form data to multipart/form-data format
   *
   * @param dto - Blog article data transfer object
   * @param imageFiles - Array of image files to upload (max 10)
   * @param coverIndex - Index of the image to mark as cover
   * @returns Created article or null on error
   */
  const createArticleWithImages = async (
    dto: CreateBlogArticleDto,
    imageFiles: File[],
    _coverIndex?: number
  ): Promise<BlogArticle | null> => {
    const result = await executeApiCall(async () => {
      // Pattern: Builder Pattern - Progressive FormData construction
      const formData = new FormData()

      formData.append('title', dto.title)
      formData.append('content', dto.content)
      if (dto.subtitle) formData.append('subtitle', dto.subtitle)
      if (dto.slug) formData.append('slug', dto.slug)
      if (dto.publishedAt) formData.append('publishedAt', dto.publishedAt)
      if (dto.isPublished !== undefined) {
        formData.append('isPublished', dto.isPublished.toString())
      }
      if (dto.sortOrder !== undefined) {
        formData.append('sortOrder', dto.sortOrder.toString())
      }
      if (dto.tagIds && dto.tagIds.length > 0) {
        formData.append('tagIds', JSON.stringify(dto.tagIds))
      }

      // Add image files
      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      // Use native fetch for multipart/form-data (Nuxt $fetch doesn't handle FormData well)
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/with-upload`

      console.log('[useBlogArticles] Creating article with images at:', url)
      console.log('[useBlogArticles] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
        filesCount: imageFiles.length,
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to create article',
          statusCode: response.status,
        }))
        throw {
          statusCode: response.status,
          message: errorData.message || 'Failed to create article',
          data: errorData,
        }
      }

      return await response.json()
    })

    // Refresh articles list after creation
    if (result) {
      await fetchAllArticles()
    }

    return result
  }

  /**
   * Update an existing article (text fields only)
   * Pattern: Facade - simplifies PATCH operation
   */
  const updateArticle = async (
    id: string,
    dto: UpdateBlogArticleDto
  ): Promise<BlogArticle | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/${id}`

      console.log('[useBlogArticles] Updating article at:', url)
      console.log('[useBlogArticles] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      return await $fetch<BlogArticle>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Update local state
    if (result) {
      const index = articles.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        articles.value[index] = result
      }
    }

    return result
  }

  /**
   * Delete an article
   */
  const deleteArticle = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/${id}`

      console.log('[useBlogArticles] Deleting article at:', url)
      console.log('[useBlogArticles] Context:', {
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
      articles.value = articles.value.filter((a) => a.id !== id)
    }

    return result || false
  }

  /**
   * Add images to an existing article
   * Pattern: Adapter Pattern - Converts files to multipart/form-data format
   *
   * @param articleId - Article ID to add images to
   * @param imageFiles - Array of image files to upload
   * @returns Array of created BlogArticleImage entities or null on error
   */
  const addImages = async (
    articleId: string,
    imageFiles: File[]
  ): Promise<BlogArticleImage[] | null> => {
    const result = await executeApiCall(async () => {
      const formData = new FormData()

      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/${articleId}/images`

      console.log('[useBlogArticles] Adding images to article at:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to add images',
          statusCode: response.status,
        }))
        throw {
          statusCode: response.status,
          message: errorData.message || 'Failed to add images',
          data: errorData,
        }
      }

      return await response.json()
    })

    return result
  }

  /**
   * Update image metadata (altText, isCover, sortOrder)
   *
   * @param articleId - Article ID
   * @param imageId - Image ID to update
   * @param data - Metadata to update
   * @returns Updated BlogArticleImage or null on error
   */
  const updateImage = async (
    articleId: string,
    imageId: string,
    data: { altText?: string; isCover?: boolean; sortOrder?: number }
  ): Promise<BlogArticleImage | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/${articleId}/images/${imageId}`

      console.log('[useBlogArticles] Updating article image at:', url)

      return await $fetch<BlogArticleImage>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: data,
      })
    })

    return result
  }

  /**
   * Remove an image from an article
   *
   * @param articleId - Article ID
   * @param imageId - Image ID to remove
   * @returns true if successful, false otherwise
   */
  const removeImage = async (
    articleId: string,
    imageId: string
  ): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/blog/${articleId}/images/${imageId}`

      console.log('[useBlogArticles] Removing article image at:', url)

      await $fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return true
    })

    return result || false
  }

  /**
   * Reset all state
   */
  const reset = () => {
    articles.value = []
    clearError()
  }

  /**
   * Computed: Check if articles are loaded
   */
  const hasArticles = computed(() => articles.value.length > 0)

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    articles: readonly(articles) as Readonly<Ref<BlogArticle[]>>,
    loading,
    error,

    // Computed
    hasArticles,
    hasError,

    // Actions
    fetchAllArticles,
    createArticleWithImages,
    updateArticle,
    deleteArticle,
    addImages,
    updateImage,
    removeImage,
    clearError,
    reset,
  }
}
