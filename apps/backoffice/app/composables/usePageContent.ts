import type {
  PageContent,
  CreatePageContentDto,
  UpdatePageContentDto,
} from '@/types/page-content'

export function usePageContent() {
  const contents = ref<PageContent[]>([])

  const {
    loading,
    error,
    hasError,
    getApiUrl,
    getAuthHeaders,
    getAuthHeadersForFormData,
    executeApiCall,
    clearError,
  } = useApi('usePageContent')

  /**
   * Fetch all page content entries (including unpublished) for backoffice
   */
  const fetchAll = async (): Promise<PageContent[]> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/page-content/all`

        return await $fetch<PageContent[]>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        contents.value = data
      }
    )

    return result || []
  }

  /**
   * Get contents filtered by page (local filter, no extra request)
   */
  const getByPage = (page: string): PageContent[] => {
    return contents.value
      .filter((c) => c.page === page)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  /**
   * Create a new page content entry with image upload (FormData)
   */
  const createContentWithImage = async (
    dto: CreatePageContentDto,
    imageFile: File
  ): Promise<PageContent | null> => {
    const result = await executeApiCall(async () => {
      const formData = new FormData()

      formData.append('page', dto.page)
      formData.append('section', dto.section)
      if (dto.title) formData.append('title', dto.title)
      if (dto.content) formData.append('content', dto.content)
      if (dto.imageAlt) formData.append('imageAlt', dto.imageAlt)
      if (dto.metadata) formData.append('metadata', JSON.stringify(dto.metadata))
      if (dto.sortOrder !== undefined) formData.append('sortOrder', dto.sortOrder.toString())
      if (dto.isPublished !== undefined) formData.append('isPublished', dto.isPublished.toString())
      formData.append('image', imageFile)

      const apiUrl = getApiUrl()
      const url = `${apiUrl}/page-content/with-upload`

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to create page content',
          statusCode: response.status,
        }))
        throw {
          statusCode: response.status,
          message: errorData.message || 'Failed to create page content',
          data: errorData,
        }
      }

      return await response.json()
    })

    return result
  }

  /**
   * Create a new page content entry (JSON, no image)
   */
  const createContent = async (
    dto: CreatePageContentDto
  ): Promise<PageContent | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/page-content`

      return await $fetch<PageContent>(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    return result
  }

  /**
   * Update a page content entry (text fields only)
   */
  const updateContent = async (
    id: string,
    dto: UpdatePageContentDto
  ): Promise<PageContent | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/page-content/${id}`

      return await $fetch<PageContent>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    if (result) {
      const index = contents.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        contents.value[index] = result
      }
    }

    return result
  }

  /**
   * Update page content image
   */
  const updateContentImage = async (
    id: string,
    imageFile: File
  ): Promise<PageContent | null> => {
    const result = await executeApiCall(async () => {
      const formData = new FormData()
      formData.append('image', imageFile)

      const apiUrl = getApiUrl()
      const url = `${apiUrl}/page-content/${id}/image`

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeadersForFormData(),
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to update page content image',
          statusCode: response.status,
        }))
        throw {
          statusCode: response.status,
          message: errorData.message || 'Failed to update page content image',
          data: errorData,
        }
      }

      return await response.json()
    })

    if (result) {
      const index = contents.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        contents.value[index] = result
      }
    }

    return result
  }

  /**
   * Delete a page content entry
   */
  const deleteContent = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/page-content/${id}`

      await $fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return true
    })

    if (result) {
      contents.value = contents.value.filter((c) => c.id !== id)
    }

    return result || false
  }

  const reset = () => {
    contents.value = []
    clearError()
  }

  const hasContents = computed(() => contents.value.length > 0)

  return {
    contents: readonly(contents) as Readonly<Ref<PageContent[]>>,
    loading,
    error,

    hasContents,
    hasError,

    fetchAll,
    getByPage,
    createContent,
    createContentWithImage,
    updateContent,
    updateContentImage,
    deleteContent,
    clearError,
    reset,
  }
}
