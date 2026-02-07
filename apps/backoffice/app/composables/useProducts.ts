/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Centralized product data management with type-safe API integration
 *
 * Patterns Applied:
 * - Facade: Simplified interface for complex API operations
 * - Adapter: Transforms backend responses to frontend format (via useApi)
 * - Decorator: Adds loading/error state management (via useApi)
 *
 * @example
 * ```typescript
 * const { products, loading, error, fetchProducts, createProduct } = useProducts()
 * await fetchProducts({ category: 'wall-hanging' })
 * ```
 */

import type {
  Product,
  ProductImage,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
  ProductStatistics,
} from '@/types/product'

/**
 * Product management state and operations
 */
export function useProducts() {
  // Internal state (reactive)
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const statistics = ref<ProductStatistics | null>(null)

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
  } = useApi('useProducts')

  /**
   * Fetch all products with optional filters
   * Pattern: Facade - simplifies complex query building
   */
  const fetchProducts = async (params?: ProductQueryParams): Promise<Product[]> => {
    const result = await executeApiCall(
      async () => {
        const query = new URLSearchParams()

        if (params?.category) query.append('category', params.category)
        if (params?.status) query.append('status', params.status)
        if (params?.search) query.append('search', params.search)
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        if (params?.sortBy) query.append('sortBy', params.sortBy)
        if (params?.sortOrder) query.append('sortOrder', params.sortOrder)

        const queryString = query.toString()
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/products${queryString ? `?${queryString}` : ''}`

        console.log('[useProducts] Fetching from:', url)
        console.log('[useProducts] Context:', {
          client: import.meta.client,
          env: process.env.NODE_ENV,
          url: apiUrl,
        })

        // Backend returns paginated response: { data, total, page, limit, totalPages }
        const response = await $fetch<{
          data: Product[]
          total: number
          page: number
          limit: number
          totalPages: number
        }>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })

        // Extract and return only the data array
        return response.data
      },
      (data) => {
        products.value = data
      }
    )

    return result || []
  }

  /**
   * Fetch a single product by ID
   */
  const fetchProductById = async (id: string): Promise<Product | null> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/products/${id}`
        console.log('[useProducts] Fetching product by ID from:', url)
        console.log('[useProducts] Context:', {
          client: import.meta.client,
          env: process.env.NODE_ENV,
          url: apiUrl,
        })

        return await $fetch<Product>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        currentProduct.value = data
      }
    )

    return result
  }

  /**
   * Fetch products by category
   * Pattern: Strategy - different data fetching strategies
   */
  const fetchByCategory = async (
    category: 'wall-hanging' | 'rug'
  ): Promise<Product[]> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/products/category/${category}`

        console.log('[useProducts] Fetching by category:', url)
        console.log('[useProducts] Context:', {
          client: import.meta.client,
          env: process.env.NODE_ENV,
          url: apiUrl,
        })

        return await $fetch<Product[]>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        products.value = data
      }
    )

    return result || []
  }

  /**
   * Create a new product
   */
  const createProduct = async (dto: CreateProductDto): Promise<Product | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/products`

      console.log('[useProducts] Creating product at:', url)
      console.log('[useProducts] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      return await $fetch<Product>(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Refresh products list after creation
    if (result) {
      await fetchProducts()
    }

    return result
  }

  /**
   * Create a new product with image file uploads
   * Pattern: Adapter Pattern - Converts form data to multipart/form-data format
   *
   * @param dto - Product data transfer object
   * @param imageFiles - Array of image files to upload (max 5)
   * @returns Created product with uploaded image URLs or null on error
   */
  const createProductWithImages = async (
    dto: Omit<CreateProductDto, 'images'>,
    imageFiles: File[],
    showOnHome: boolean[] = []
  ): Promise<Product | null> => {
    const result = await executeApiCall(async () => {
      // Pattern: Builder Pattern - Progressive FormData construction
      const formData = new FormData()

      // Add product fields to FormData
      formData.append('name', dto.name)
      if (dto.description) formData.append('description', dto.description)
      formData.append('category', dto.category)
      formData.append('price', dto.price.toString())
      if (dto.status) formData.append('status', dto.status)
      if (dto.stockQuantity !== undefined) {
        formData.append('stockQuantity', dto.stockQuantity.toString())
      }
      if (dto.materials) formData.append('materials', dto.materials)

      // Add dimensions as JSON string if provided
      if (dto.dimensions) {
        formData.append('dimensions', JSON.stringify(dto.dimensions))
      }

      // Add showOnHome flags as JSON string
      if (showOnHome.length > 0) {
        formData.append('showOnHome', JSON.stringify(showOnHome))
      }

      // Add image files
      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      // Use native fetch for multipart/form-data (Nuxt $fetch doesn't handle FormData well)
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/products/with-upload`

      console.log('[useProducts] Creating product with images at:', url)
      console.log('[useProducts] Context:', {
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
          message: 'Failed to create product',
          statusCode: response.status,
        }))
        throw {
          statusCode: response.status,
          message: errorData.message || 'Failed to create product',
          data: errorData,
        }
      }

      return await response.json()
    })

    // Refresh products list after creation
    if (result) {
      await fetchProducts()
    }

    return result
  }

  /**
   * Update an existing product
   */
  const updateProduct = async (
    id: string,
    dto: UpdateProductDto
  ): Promise<Product | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/products/${id}`

      console.log('[useProducts] Updating product at:', url)
      console.log('[useProducts] Context:', {
        client: import.meta.client,
        env: process.env.NODE_ENV,
        url: apiUrl,
      })

      return await $fetch<Product>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Update local state
    if (result) {
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = result
      }
      if (currentProduct.value?.id === id) {
        currentProduct.value = result
      }
    }

    return result
  }

  /**
   * Add images to an existing product
   * Pattern: Adapter Pattern - Converts files to multipart/form-data format
   *
   * @param productId - Product ID to add images to
   * @param imageFiles - Array of image files to upload
   * @param showOnHome - Array of booleans indicating which images should show on home
   * @returns Array of created ProductImage entities or null on error
   */
  const addProductImages = async (
    productId: string,
    imageFiles: File[],
    showOnHome: boolean[] = []
  ): Promise<ProductImage[] | null> => {
    const result = await executeApiCall(async () => {
      const formData = new FormData()

      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      if (showOnHome.length > 0) {
        formData.append('showOnHome', JSON.stringify(showOnHome))
      }

      const apiUrl = getApiUrl()
      const url = `${apiUrl}/products/${productId}/images`

      console.log('[useProducts] Adding images to product at:', url)

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
   * Update image metadata (showOnHome, sortOrder)
   *
   * @param productId - Product ID
   * @param imageId - Image ID to update
   * @param data - Metadata to update
   * @returns Updated ProductImage or null on error
   */
  const updateProductImage = async (
    productId: string,
    imageId: string,
    data: { showOnHome?: boolean; sortOrder?: number }
  ): Promise<ProductImage | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/products/${productId}/images/${imageId}`

      console.log('[useProducts] Updating product image at:', url)

      return await $fetch<ProductImage>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: data,
      })
    })

    return result
  }

  /**
   * Remove an image from a product
   *
   * @param productId - Product ID
   * @param imageId - Image ID to remove
   * @returns true if successful, false otherwise
   */
  const removeProductImage = async (
    productId: string,
    imageId: string
  ): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/products/${productId}/images/${imageId}`

      console.log('[useProducts] Removing product image at:', url)

      await $fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return true
    })

    return result || false
  }

  /**
   * Delete a product
   */
  const deleteProduct = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/products/${id}`

      console.log('[useProducts] Deleting product at:', url)
      console.log('[useProducts] Context:', {
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
      products.value = products.value.filter((p) => p.id !== id)
      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
    }

    return result || false
  }

  /**
   * Fetch product statistics
   */
  const fetchStatistics = async (): Promise<ProductStatistics | null> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/products/statistics`

        console.log('[useProducts] Fetching statistics from:', url)
        console.log('[useProducts] Context:', {
          client: import.meta.client,
          env: process.env.NODE_ENV,
          url: apiUrl,
        })

        return await $fetch<ProductStatistics>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        statistics.value = data
      }
    )

    return result
  }

  /**
   * Clear current product
   */
  const clearCurrentProduct = () => {
    currentProduct.value = null
  }

  /**
   * Reset all state
   */
  const reset = () => {
    products.value = []
    currentProduct.value = null
    statistics.value = null
    clearError()
  }

  /**
   * Computed: Check if products are loaded
   */
  const hasProducts = computed(() => products.value.length > 0)

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    products: readonly(products) as Readonly<Ref<Product[]>>,
    currentProduct: readonly(currentProduct) as Readonly<Ref<Product | null>>,
    statistics: readonly(statistics) as Readonly<Ref<ProductStatistics | null>>,
    loading,
    error,

    // Computed
    hasProducts,
    hasError,

    // Actions
    fetchProducts,
    fetchProductById,
    fetchByCategory,
    createProduct,
    createProductWithImages,
    updateProduct,
    deleteProduct,
    addProductImages,
    updateProductImage,
    removeProductImage,
    fetchStatistics,
    clearError,
    clearCurrentProduct,
    reset,
  }
}

/**
 * Helper composable for product formatting
 * Pattern: Pure utility functions
 */
export function useProductFormatting() {
  /**
   * Format price with currency
   * Handles both number and string (from PostgreSQL decimal)
   */
  const formatPrice = (price: number | string, currency: string = 'EUR'): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(numericPrice)
  }

  /**
   * Format category label
   */
  const formatCategory = (category: 'wall-hanging' | 'rug'): string => {
    const labels: Record<string, string> = {
      'wall-hanging': 'Suspension murale',
      'rug': 'Tapis',
    }
    return labels[category] || category
  }

  /**
   * Format status label
   */
  const formatStatus = (status: 'available' | 'sold' | 'draft'): string => {
    const labels: Record<string, string> = {
      available: 'Disponible',
      sold: 'Vendu',
      draft: 'Brouillon',
    }
    return labels[status] || status
  }

  /**
   * Get status color (Strategy Pattern for styling)
   */
  const getStatusColor = (
    status: 'available' | 'sold' | 'draft'
  ): string => {
    const colorMap: Record<string, string> = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      sold: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Format dimensions
   */
  const formatDimensions = (dimensions?: {
    width: number
    height: number
    unit: string
  }): string => {
    if (!dimensions) return 'N/A'
    return `${dimensions.width} × ${dimensions.height} ${dimensions.unit}`
  }

  /**
   * Get stock status color
   */
  const getStockColor = (stock: number): string => {
    if (stock === 0) return 'text-red-600 font-semibold'
    if (stock <= 5) return 'text-orange-600 font-medium'
    return 'text-green-600'
  }

  return {
    formatPrice,
    formatCategory,
    formatStatus,
    getStatusColor,
    formatDimensions,
    getStockColor,
  }
}
