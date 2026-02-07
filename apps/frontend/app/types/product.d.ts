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
 * Product image with metadata
 *
 * Represents a single image associated with a product,
 * including display flags for home page grid visibility.
 *
 * @see apps/backend/src/entities/product-image.entity.ts
 */
export interface ProductImage {
  /**
   * Unique identifier (UUID)
   */
  id: string

  /**
   * Full URL to the image file
   */
  url: string

  /**
   * Whether this image should be displayed on the home page grid
   */
  showOnHome: boolean

  /**
   * Sort order for display positioning
   */
  sortOrder: number

  /**
   * ID of the parent product
   */
  productId: string

  /**
   * Creation timestamp
   */
  createdAt: string

  /**
   * Associated product (included when fetching from home-grid endpoint)
   */
  product?: Product
}

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
   * Product images with metadata
   */
  productImages?: ProductImage[]

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
