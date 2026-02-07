import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { useProducts, useProductFormatting } from './useProducts'
import type { Product, ProductImage, ProductStatistics } from '@/types/product'

// --- Mocks ---

// Mock import.meta.client (used in useApi)
vi.stubGlobal('import', { meta: { client: true, server: false } })

// Mock process.env
vi.stubGlobal('process', { env: { NODE_ENV: 'test' } })

// Track calls to the mock API utilities
let mockExecuteApiCall: Mock
let mockGetApiUrl: Mock
let mockGetAuthHeaders: Mock
let mockGetAuthHeadersForFormData: Mock
let mockClearError: Mock
let mockLoading: { value: boolean }
let mockError: { value: null | { statusCode: number; message: string } }
let mockHasError: { value: boolean }

// Mock useApi composable (auto-imported by Nuxt, resolved via #imports alias)
vi.mock('#imports', () => {
  const { ref, computed, readonly, watch, onMounted } = require('vue')
  return {
    ref,
    computed,
    readonly,
    watch,
    onMounted,
    Ref: {},
    useRuntimeConfig: () => ({ public: { apiUrl: 'http://localhost:4000/api' } }),
    navigateTo: vi.fn(),
    useSeoMeta: vi.fn(),
    useHead: vi.fn(),
  }
})

// We need to mock useApi since it is auto-imported in the composable
// In Nuxt, useApi is auto-imported, so we mock it as a global
vi.stubGlobal('useApi', vi.fn())

// Mock $fetch (Nuxt global)
vi.stubGlobal('$fetch', vi.fn())

// Mock fetch (native global used for FormData uploads)
vi.stubGlobal('fetch', vi.fn())

// Suppress console.log during tests
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

// --- Test data factories ---

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    name: 'Test Wall Hanging',
    description: 'A beautiful handwoven piece',
    category: 'wall-hanging',
    price: 150,
    status: 'available',
    stockQuantity: 3,
    materials: 'Cotton, wool',
    dimensions: { width: 60, height: 90, unit: 'cm' },
    productImages: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function createMockProductImage(overrides: Partial<ProductImage> = {}): ProductImage {
  return {
    id: 'img-1',
    url: 'http://example.com/image.jpg',
    showOnHome: false,
    sortOrder: 0,
    productId: 'prod-1',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function createMockStatistics(): ProductStatistics {
  return {
    total: 10,
    byCategory: { 'wall-hanging': 6, 'rug': 4 },
    byStatus: { available: 5, sold: 3, draft: 2 },
    totalValue: 2500,
    lowStock: 2,
  }
}

// --- Setup ---

beforeEach(() => {
  vi.clearAllMocks()

  mockLoading = { value: false }
  mockError = { value: null }
  mockHasError = { value: false }
  mockClearError = vi.fn(() => {
    mockError.value = null
  })
  mockGetApiUrl = vi.fn(() => 'http://localhost:4000/api')
  mockGetAuthHeaders = vi.fn(() => ({ 'Content-Type': 'application/json' }))
  mockGetAuthHeadersForFormData = vi.fn(() => ({}))

  // The key mock: executeApiCall invokes the callback and optional onSuccess
  mockExecuteApiCall = vi.fn(async (apiCall: () => Promise<any>, onSuccess?: (data: any) => void) => {
    try {
      const result = await apiCall()
      onSuccess?.(result)
      return result
    } catch {
      return null
    }
  })

  // Wire up the useApi mock
  ;(globalThis as any).useApi = vi.fn(() => ({
    loading: mockLoading,
    error: mockError,
    hasError: mockHasError,
    getApiUrl: mockGetApiUrl,
    getAuthHeaders: mockGetAuthHeaders,
    getAuthHeadersForFormData: mockGetAuthHeadersForFormData,
    executeApiCall: mockExecuteApiCall,
    clearError: mockClearError,
  }))
})

// =====================
// useProducts tests
// =====================
describe('useProducts', () => {
  describe('fetchProducts', () => {
    it('should fetch all products and update products state', async () => {
      const mockProducts = [createMockProduct(), createMockProduct({ id: 'prod-2', name: 'Rug' })]
      const mockFetch = vi.fn().mockResolvedValue({ data: mockProducts, total: 2, page: 1, limit: 10, totalPages: 1 })
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProducts, products } = useProducts()
      const result = await fetchProducts()

      expect(mockExecuteApiCall).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products',
        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual(mockProducts)
      expect(products.value).toEqual(mockProducts)
    })

    it('should append query params when provided', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProducts } = useProducts()
      await fetchProducts({ category: 'rug', status: 'available', page: 2, limit: 5, sortBy: 'price', sortOrder: 'desc' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('category=rug'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=available'),
        expect.any(Object)
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
    })

    it('should return empty array when executeApiCall returns null', async () => {
      mockExecuteApiCall.mockResolvedValue(null)

      const { fetchProducts } = useProducts()
      const result = await fetchProducts()

      expect(result).toEqual([])
    })
  })

  describe('fetchProductById', () => {
    it('should fetch a single product and update currentProduct', async () => {
      const mockProduct = createMockProduct()
      const mockFetch = vi.fn().mockResolvedValue(mockProduct)
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProductById, currentProduct } = useProducts()
      const result = await fetchProductById('prod-1')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products/prod-1',
        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual(mockProduct)
      expect(currentProduct.value).toEqual(mockProduct)
    })
  })

  describe('fetchByCategory', () => {
    it('should fetch products by category', async () => {
      const mockProducts = [createMockProduct({ category: 'rug' })]
      const mockFetch = vi.fn().mockResolvedValue(mockProducts)
      ;(globalThis as any).$fetch = mockFetch

      const { fetchByCategory, products } = useProducts()
      const result = await fetchByCategory('rug')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products/category/rug',
        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual(mockProducts)
      expect(products.value).toEqual(mockProducts)
    })
  })

  describe('createProduct', () => {
    it('should create a product and refresh the product list', async () => {
      const newProduct = createMockProduct({ id: 'prod-new' })
      const mockFetch = vi.fn()
        // First call: createProduct
        .mockResolvedValueOnce(newProduct)
        // Second call: fetchProducts (refresh)
        .mockResolvedValueOnce({ data: [newProduct], total: 1, page: 1, limit: 10, totalPages: 1 })
      ;(globalThis as any).$fetch = mockFetch

      const { createProduct } = useProducts()
      const result = await createProduct({
        name: 'New Product',
        category: 'wall-hanging',
        price: 100,
      })

      expect(result).toEqual(newProduct)
      // Should have been called twice: once for create, once for refresh
      expect(mockExecuteApiCall).toHaveBeenCalledTimes(2)
    })
  })

  describe('createProductWithImages', () => {
    it('should create a product with images via native fetch and FormData', async () => {
      const newProduct = createMockProduct({ id: 'prod-new' })

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(newProduct),
      }
      const mockNativeFetch = vi.fn().mockResolvedValue(mockResponse)
      ;(globalThis as any).fetch = mockNativeFetch

      // Also mock $fetch for the refresh call
      const mockDollarFetch = vi.fn().mockResolvedValue({
        data: [newProduct],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
      ;(globalThis as any).$fetch = mockDollarFetch

      const mockFile = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' })

      const { createProductWithImages } = useProducts()
      const result = await createProductWithImages(
        { name: 'New Product', category: 'wall-hanging', price: 100 },
        [mockFile],
        [true]
      )

      expect(result).toEqual(newProduct)
      expect(mockNativeFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products/with-upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )

      // Verify FormData contents
      const calledFormData = mockNativeFetch.mock.calls[0][1].body as FormData
      expect(calledFormData.get('name')).toBe('New Product')
      expect(calledFormData.get('category')).toBe('wall-hanging')
      expect(calledFormData.get('price')).toBe('100')
      expect(calledFormData.get('showOnHome')).toBe(JSON.stringify([true]))
    })

    it('should throw when native fetch returns non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ message: 'Validation error', statusCode: 400 }),
      }
      const mockNativeFetch = vi.fn().mockResolvedValue(mockResponse)
      ;(globalThis as any).fetch = mockNativeFetch

      // executeApiCall should catch the throw and return null
      mockExecuteApiCall.mockImplementation(async (apiCall: () => Promise<any>) => {
        try {
          return await apiCall()
        } catch {
          return null
        }
      })

      const mockFile = new File(['data'], 'test.jpg', { type: 'image/jpeg' })
      const { createProductWithImages } = useProducts()
      const result = await createProductWithImages(
        { name: 'Bad Product', category: 'rug', price: -1 },
        [mockFile]
      )

      expect(result).toBeNull()
    })
  })

  describe('updateProduct', () => {
    it('should update a product and update local state', async () => {
      const original = createMockProduct()
      const updated = createMockProduct({ name: 'Updated Name' })

      // First set up products in state via fetchProducts
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ data: [original], total: 1, page: 1, limit: 10, totalPages: 1 })
        .mockResolvedValueOnce(updated)
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProducts, updateProduct, products } = useProducts()
      await fetchProducts()

      const result = await updateProduct('prod-1', { name: 'Updated Name' })

      expect(result).toEqual(updated)
      expect(products.value[0]).toEqual(updated)
    })

    it('should update currentProduct when the same product is being viewed', async () => {
      const product = createMockProduct()
      const updated = createMockProduct({ name: 'Updated' })

      const mockFetch = vi.fn()
        .mockResolvedValueOnce(product) // fetchProductById
        .mockResolvedValueOnce(updated) // updateProduct
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProductById, updateProduct, currentProduct } = useProducts()
      await fetchProductById('prod-1')
      await updateProduct('prod-1', { name: 'Updated' })

      expect(currentProduct.value).toEqual(updated)
    })
  })

  describe('deleteProduct', () => {
    it('should delete a product and remove it from local state', async () => {
      const product = createMockProduct()
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ data: [product], total: 1, page: 1, limit: 10, totalPages: 1 })
        .mockResolvedValueOnce(undefined) // DELETE returns void
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProducts, deleteProduct, products } = useProducts()
      await fetchProducts()
      expect(products.value).toHaveLength(1)

      const result = await deleteProduct('prod-1')

      expect(result).toBe(true)
      expect(products.value).toHaveLength(0)
    })

    it('should clear currentProduct if the deleted product was being viewed', async () => {
      const product = createMockProduct()
      const mockFetch = vi.fn()
        .mockResolvedValueOnce(product) // fetchProductById
        .mockResolvedValueOnce(undefined) // DELETE
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProductById, deleteProduct, currentProduct } = useProducts()
      await fetchProductById('prod-1')
      expect(currentProduct.value).toEqual(product)

      await deleteProduct('prod-1')

      expect(currentProduct.value).toBeNull()
    })

    it('should return false when deletion fails', async () => {
      mockExecuteApiCall.mockResolvedValue(null)

      const { deleteProduct } = useProducts()
      const result = await deleteProduct('prod-999')

      expect(result).toBe(false)
    })
  })

  describe('addProductImages', () => {
    it('should upload images to an existing product via native fetch', async () => {
      const mockImages = [createMockProductImage()]
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockImages),
      }
      const mockNativeFetch = vi.fn().mockResolvedValue(mockResponse)
      ;(globalThis as any).fetch = mockNativeFetch

      const mockFile = new File(['data'], 'new-image.png', { type: 'image/png' })

      const { addProductImages } = useProducts()
      const result = await addProductImages('prod-1', [mockFile], [true])

      expect(result).toEqual(mockImages)
      expect(mockNativeFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products/prod-1/images',
        expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
      )
    })
  })

  describe('updateProductImage', () => {
    it('should update image metadata via PATCH', async () => {
      const updatedImage = createMockProductImage({ showOnHome: true })
      const mockFetch = vi.fn().mockResolvedValue(updatedImage)
      ;(globalThis as any).$fetch = mockFetch

      const { updateProductImage } = useProducts()
      const result = await updateProductImage('prod-1', 'img-1', { showOnHome: true })

      expect(result).toEqual(updatedImage)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products/prod-1/images/img-1',
        expect.objectContaining({ method: 'PATCH', body: { showOnHome: true } })
      )
    })
  })

  describe('removeProductImage', () => {
    it('should delete an image and return true', async () => {
      const mockFetch = vi.fn().mockResolvedValue(undefined)
      ;(globalThis as any).$fetch = mockFetch

      const { removeProductImage } = useProducts()
      const result = await removeProductImage('prod-1', 'img-1')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products/prod-1/images/img-1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })

    it('should return false when removal fails', async () => {
      mockExecuteApiCall.mockResolvedValue(null)

      const { removeProductImage } = useProducts()
      const result = await removeProductImage('prod-1', 'img-1')

      expect(result).toBe(false)
    })
  })

  describe('fetchStatistics', () => {
    it('should fetch statistics and update statistics state', async () => {
      const stats = createMockStatistics()
      const mockFetch = vi.fn().mockResolvedValue(stats)
      ;(globalThis as any).$fetch = mockFetch

      const { fetchStatistics, statistics } = useProducts()
      const result = await fetchStatistics()

      expect(result).toEqual(stats)
      expect(statistics.value).toEqual(stats)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/products/statistics',
        expect.objectContaining({ method: 'GET' })
      )
    })
  })

  describe('clearCurrentProduct', () => {
    it('should set currentProduct to null', async () => {
      const product = createMockProduct()
      const mockFetch = vi.fn().mockResolvedValue(product)
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProductById, clearCurrentProduct, currentProduct } = useProducts()
      await fetchProductById('prod-1')
      expect(currentProduct.value).toEqual(product)

      clearCurrentProduct()
      expect(currentProduct.value).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const product = createMockProduct()
      const stats = createMockStatistics()
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ data: [product], total: 1, page: 1, limit: 10, totalPages: 1 })
        .mockResolvedValueOnce(product)
        .mockResolvedValueOnce(stats)
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProducts, fetchProductById, fetchStatistics, reset, products, currentProduct, statistics } = useProducts()

      await fetchProducts()
      await fetchProductById('prod-1')
      await fetchStatistics()

      expect(products.value).toHaveLength(1)
      expect(currentProduct.value).not.toBeNull()
      expect(statistics.value).not.toBeNull()

      reset()

      expect(products.value).toHaveLength(0)
      expect(currentProduct.value).toBeNull()
      expect(statistics.value).toBeNull()
      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('hasProducts', () => {
    it('should return false when products list is empty', () => {
      const { hasProducts } = useProducts()
      expect(hasProducts.value).toBe(false)
    })

    it('should return true after products are loaded', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        data: [createMockProduct()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
      ;(globalThis as any).$fetch = mockFetch

      const { fetchProducts, hasProducts } = useProducts()
      await fetchProducts()

      expect(hasProducts.value).toBe(true)
    })
  })
})

// =====================
// useProductFormatting tests
// =====================
describe('useProductFormatting', () => {
  describe('formatPrice', () => {
    it('should format a numeric price in EUR', () => {
      const { formatPrice } = useProductFormatting()
      const result = formatPrice(150)
      // fr-FR locale formats EUR as "150,00 EUR" or similar
      expect(result).toContain('150')
      expect(result).toMatch(/EUR|€/)
    })

    it('should handle string prices (from PostgreSQL decimal)', () => {
      const { formatPrice } = useProductFormatting()
      const result = formatPrice('99.50')
      expect(result).toContain('99')
    })

    it('should handle zero price', () => {
      const { formatPrice } = useProductFormatting()
      const result = formatPrice(0)
      expect(result).toContain('0')
    })
  })

  describe('formatCategory', () => {
    it('should return "Suspension murale" for wall-hanging category', () => {
      const { formatCategory } = useProductFormatting()
      expect(formatCategory('wall-hanging')).toBe('Suspension murale')
    })

    it('should return "Tapis" for rug category', () => {
      const { formatCategory } = useProductFormatting()
      expect(formatCategory('rug')).toBe('Tapis')
    })
  })

  describe('formatStatus', () => {
    it('should format status labels correctly', () => {
      const { formatStatus } = useProductFormatting()
      expect(formatStatus('available')).toBe('Disponible')
      expect(formatStatus('sold')).toBe('Vendu')
      expect(formatStatus('draft')).toBe('Brouillon')
    })
  })

  describe('getStatusColor', () => {
    it('should return green classes for available status', () => {
      const { getStatusColor } = useProductFormatting()
      expect(getStatusColor('available')).toContain('green')
    })

    it('should return red classes for sold status', () => {
      const { getStatusColor } = useProductFormatting()
      expect(getStatusColor('sold')).toContain('red')
    })

    it('should return yellow classes for draft status', () => {
      const { getStatusColor } = useProductFormatting()
      expect(getStatusColor('draft')).toContain('yellow')
    })
  })

  describe('formatDimensions', () => {
    it('should format dimensions with width, height, and unit', () => {
      const { formatDimensions } = useProductFormatting()
      expect(formatDimensions({ width: 60, height: 90, unit: 'cm' })).toBe('60 \u00d7 90 cm')
    })

    it('should return "N/A" when dimensions are undefined', () => {
      const { formatDimensions } = useProductFormatting()
      expect(formatDimensions(undefined)).toBe('N/A')
    })
  })

  describe('getStockColor', () => {
    it('should return red for zero stock', () => {
      const { getStockColor } = useProductFormatting()
      expect(getStockColor(0)).toContain('red')
    })

    it('should return orange for low stock (1-5)', () => {
      const { getStockColor } = useProductFormatting()
      expect(getStockColor(3)).toContain('orange')
    })

    it('should return green for normal stock (>5)', () => {
      const { getStockColor } = useProductFormatting()
      expect(getStockColor(10)).toContain('green')
    })
  })
})
