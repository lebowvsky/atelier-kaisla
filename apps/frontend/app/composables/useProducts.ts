/**
 * Products API Composable
 *
 * Provides API integration for fetching products from the backend.
 * Implements data fetching, error handling, and type-safe API calls.
 *
 * Design Patterns Applied:
 * - @pattern Adapter Pattern
 * - @category Structural
 * - @purpose Adapts backend Product entity to frontend Artwork interface
 *
 * - @pattern Facade Pattern
 * - @category Structural
 * - @purpose Simplifies complex API interactions into easy-to-use methods
 *
 * - @pattern Decorator Pattern (withLoading)
 * - @category Structural
 * - @purpose Adds loading and error state management to async operations
 *
 * Features:
 * - Type-safe API calls with TypeScript
 * - Automatic loading and error state management
 * - Product to Artwork adapter for UI compatibility
 * - Configurable API base URL via runtime config
 * - SSR-compatible using useFetch
 *
 * @example
 * ```typescript
 * const { products, loading, error, fetchByCategory, refresh } = useProducts()
 * await fetchByCategory('wall-hanging')
 * ```
 */

import type { Product, ProductCategory, ProductsResponse } from '~/types/product'
import type { Artwork } from '~/types/artwork'

/**
 * URL slug mapping for product categories.
 *
 * The backend enum uses singular `'rug'`, but the customer-facing route is
 * pluralized as `/rugs/[id]` to read more naturally as a collection. This map
 * keeps the canonical translation between the domain enum and the URL.
 */
export const CATEGORY_URL_SLUG: Record<ProductCategory, string> = {
  'wall-hanging': 'wall-hanging',
  rug: 'rugs',
}

/**
 * Pattern: Adapter Pattern
 * Purpose: Convert backend Product entity to frontend Artwork interface
 *
 * This adapter ensures backward compatibility with existing components
 * that expect the Artwork interface while fetching real data from the API.
 *
 * @param product - Backend product entity
 * @returns Frontend Artwork interface
 */
export function adaptProductToArtwork(product: Product): Artwork {
  return {
    id: product.id,
    title: product.name,
    // Use first product image URL or fallback to placeholder
    imageSrc: product.productImages?.[0]?.url || `/placeholder-${product.category}.jpg`,
    imageAlt: `${product.name} - Handcrafted ${product.category}`,
    dimensions: product.dimensions
      ? {
          width: product.dimensions.width,
          height: product.dimensions.height,
          unit: product.dimensions.unit === 'inch' ? 'in' : 'cm',
        }
      : {
          width: 0,
          height: 0,
          unit: 'cm',
        },
    material: product.materials || 'Natural materials',
    description: product.description || '',
    price: Number(product.price),
    available: product.status === 'available' && product.stockQuantity > 0,
    category: product.category,
    detailUrl: `/${CATEGORY_URL_SLUG[product.category]}/${product.id}`,
  }
}

/**
 * Pattern: Facade Pattern
 * Purpose: Simplify product API interactions
 *
 * Main composable for product data fetching and management.
 * Provides a clean interface for components to interact with the products API.
 */
export function useProducts() {
  const { apiFetch, baseUrl } = useApi()

  // Reactive state
  const products = ref<Product[]>([])
  const artworks = ref<Artwork[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Fetch products by category
   * Uses the dedicated /products/category/:category endpoint
   *
   * @param category - Product category to fetch
   */
  const fetchByCategory = async (category: ProductCategory) => {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch<Product[]>(`/products/category/${category}`)

      if (data && Array.isArray(data)) {
        console.log(`[useProducts] Fetched ${data.length} products`)

        products.value = data
        // Pattern: Adapter Pattern - Convert products to artworks
        artworks.value = data.map(adaptProductToArtwork)
      } else {
        console.warn('[useProducts] No data received or invalid format:', data)
        products.value = []
        artworks.value = []
      }
    } catch (e: unknown) {
      console.error('[useProducts] Error fetching products:', e instanceof Error ? e.message : e)
      error.value = e as Error
      products.value = []
      artworks.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all products with optional filters
   *
   * @param params - Query parameters for filtering
   */
  const fetchAll = async (params?: {
    category?: ProductCategory
    status?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()

      if (params?.category) queryParams.append('category', params.category)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const path = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const { data, error: fetchError } = await useFetch<ProductsResponse>(path, {
        baseURL: baseUrl,
        key: `products-all-${queryParams.toString()}`,
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Failed to fetch products')
      }

      if (data.value?.data) {
        products.value = data.value.data
        // Pattern: Adapter Pattern - Convert products to artworks
        artworks.value = data.value.data.map(adaptProductToArtwork)
      } else {
        products.value = []
        artworks.value = []
      }
    } catch (e) {
      console.error('[useProducts] Error fetching products:', e)
      error.value = e as Error
      products.value = []
      artworks.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single product by ID
   *
   * @param id - Product UUID
   */
  const fetchById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch<Product>(
        `/products/${id}`,
        {
          baseURL: baseUrl,
          key: `product-${id}`,
        }
      )

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Product not found')
      }

      return data.value ? adaptProductToArtwork(data.value) : null
    } catch (e) {
      console.error('[useProducts] Error fetching product:', e)
      error.value = e as Error
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh current data
   * Useful for manual cache invalidation
   */
  const refresh = async (category?: ProductCategory) => {
    if (category) {
      await fetchByCategory(category)
    } else {
      await fetchAll()
    }
  }

  return {
    // State
    products: readonly(products),
    artworks: readonly(artworks),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    fetchByCategory,
    fetchAll,
    fetchById,
    refresh,
  }
}
