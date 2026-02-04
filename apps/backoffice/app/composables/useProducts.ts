/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Centralized product data management with type-safe API integration
 *
 * Patterns Applied:
 * - Facade: Simplified interface for complex API operations
 * - Adapter: Transforms backend responses to frontend format
 * - Decorator: Adds loading/error state management
 *
 * @example
 * ```typescript
 * const { products, loading, error, fetchProducts, createProduct } = useProducts()
 * await fetchProducts({ category: 'wall-hanging' })
 * ```
 */

import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
  ProductStatistics,
  ApiError,
} from '@/types/product'

/**
 * Product management state and operations
 */
export function useProducts() {
  // Internal state (reactive)
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const statistics = ref<ProductStatistics | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  // Runtime configuration
  const config = useRuntimeConfig()

  /**
   * Get the correct API URL based on environment (server vs client)
   * Pattern: Adapter Pattern for environment-specific configuration
   *
   * In Docker:
   * - Server (SSR): http://backend:4000/api (internal Docker network)
   * - Client (browser): http://localhost:4000/api (host machine)
   */
  const getApiUrl = (): string => {
    if (import.meta.server) {
      // Server-side (SSR): use internal Docker network address
      return config.public.apiUrl || 'http://backend:4000/api'
    } else {
      // Client-side (browser): use localhost for browser requests
      return 'http://localhost:4000/api'
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

      // Adapter Pattern: Transform error to standard format
      error.value = {
        statusCode: err.statusCode || 500,
        message: err.data?.message || err.message || 'An error occurred',
        error: err.data?.error || 'Unknown error',
      }

      return null
    } finally {
      loading.value = false
    }
  }

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
        const url = `${getApiUrl()}/products${queryString ? `?${queryString}` : ''}`

        console.log(`[useProducts] Fetching from: ${url} (${import.meta.server ? 'server' : 'client'})`)

        // Backend returns paginated response: { data, total, page, limit, totalPages }
        const response = await $fetch<{
          data: Product[]
          total: number
          page: number
          limit: number
          totalPages: number
        }>(url, {
          method: 'GET',
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
        const url = `${getApiUrl()}/products/${id}`
        console.log(`[useProducts] Fetching product by ID from: ${url} (${import.meta.server ? 'server' : 'client'})`)

        return await $fetch<Product>(url, {
          method: 'GET',
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
        return await $fetch<Product[]>(`${getApiUrl()}/products/category/${category}`, {
          method: 'GET',
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
      return await $fetch<Product>(`${getApiUrl()}/products`, {
        method: 'POST',
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
    imageFiles: File[]
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

      // Add image files
      imageFiles.forEach((file) => {
        formData.append('images', file)
      })

      // Use native fetch for multipart/form-data (Nuxt $fetch doesn't handle FormData well)
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/products/with-upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
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
      return await $fetch<Product>(`${getApiUrl()}/products/${id}`, {
        method: 'PATCH',
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
   * Delete a product
   */
  const deleteProduct = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      await $fetch(`${getApiUrl()}/products/${id}`, {
        method: 'DELETE',
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
        return await $fetch<ProductStatistics>(`${getApiUrl()}/products/statistics`, {
          method: 'GET',
        })
      },
      (data) => {
        statistics.value = data
      }
    )

    return result
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
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
    loading.value = false
    error.value = null
  }

  /**
   * Computed: Check if products are loaded
   */
  const hasProducts = computed(() => products.value.length > 0)

  /**
   * Computed: Check if there's an error
   */
  const hasError = computed(() => error.value !== null)

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    products: readonly(products) as Readonly<Ref<Product[]>>,
    currentProduct: readonly(currentProduct) as Readonly<Ref<Product | null>>,
    statistics: readonly(statistics) as Readonly<Ref<ProductStatistics | null>>,
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    error: readonly(error) as Readonly<Ref<ApiError | null>>,

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
      'wall-hanging': 'Wall Hanging',
      'rug': 'Rug',
    }
    return labels[category] || category
  }

  /**
   * Format status label
   */
  const formatStatus = (status: 'available' | 'sold' | 'draft'): string => {
    const labels: Record<string, string> = {
      available: 'Available',
      sold: 'Sold',
      draft: 'Draft',
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
