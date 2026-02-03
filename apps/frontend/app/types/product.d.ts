/**
 * Product Type Definitions
 *
 * Type-safe definitions for product data structures from the backend API.
 * These types align with the NestJS backend Product entity.
 *
 * @see apps/backend/src/entities/product.entity.ts
 */

/**
 * Product dimensions as returned by the API
 */
export interface ProductDimensions {
  /**
   * Width of the product
   */
  width: number

  /**
   * Height of the product
   */
  height: number

  /**
   * Unit of measurement ('cm' or 'inch')
   */
  unit: 'cm' | 'inch'
}

/**
 * Product status enum matching backend
 */
export type ProductStatus = 'available' | 'sold' | 'draft'

/**
 * Product category enum matching backend
 */
export type ProductCategory = 'wall-hanging' | 'rug'

/**
 * Product entity as returned by the backend API
 */
export interface Product {
  /**
   * Unique identifier (UUID)
   */
  id: string

  /**
   * Product name
   */
  name: string

  /**
   * Product description
   */
  description?: string

  /**
   * Product category
   */
  category: ProductCategory

  /**
   * Price in euros
   */
  price: number

  /**
   * Product status
   */
  status: ProductStatus

  /**
   * Available quantity in stock
   */
  stockQuantity: number

  /**
   * Array of image URLs
   */
  images?: string[]

  /**
   * Product dimensions
   */
  dimensions?: ProductDimensions

  /**
   * Material description
   */
  materials?: string

  /**
   * Creation timestamp
   */
  createdAt: string

  /**
   * Last update timestamp
   */
  updatedAt: string
}

/**
 * API response for paginated products
 */
export interface ProductsResponse {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Query parameters for filtering products
 */
export interface ProductQueryParams {
  category?: ProductCategory
  status?: ProductStatus
  search?: string
  page?: number
  limit?: number
}
