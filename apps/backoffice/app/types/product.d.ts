/**
 * @pattern Value Object
 * @category Type Definitions
 * @purpose Type-safe product data structures aligned with backend entities
 */

/**
 * Product category enumeration
 */
export type ProductCategory = 'wall-hanging' | 'rug'

/**
 * Product status enumeration
 */
export type ProductStatus = 'available' | 'sold' | 'draft'

/**
 * Measurement unit enumeration
 */
export type MeasurementUnit = 'cm' | 'inch'

/**
 * Product dimensions structure
 */
export interface ProductDimensions {
  width: number
  height: number
  unit: MeasurementUnit
}

/**
 * Product image entity (aligned with backend ProductImage entity)
 */
export interface ProductImage {
  id: string
  url: string
  showOnHome: boolean
  sortOrder: number
  productId: string
  createdAt: string
}

/**
 * Product entity (aligned with backend Product entity)
 * Note: price is returned as string from PostgreSQL decimal type
 */
export interface Product {
  id: string
  name: string
  description?: string
  category: ProductCategory
  price: number | string // Backend returns decimal as string
  status: ProductStatus
  stockQuantity: number
  productImages?: ProductImage[]
  dimensions?: ProductDimensions
  materials?: string
  createdAt: string
  updatedAt: string
}

/**
 * DTO for creating a new product (aligned with backend CreateProductDto)
 */
export interface CreateProductDto {
  name: string
  description?: string
  category: ProductCategory
  price: number
  status?: ProductStatus
  stockQuantity?: number
  dimensions?: ProductDimensions
  materials?: string
}

/**
 * DTO for updating an existing product (all fields optional)
 */
export interface UpdateProductDto {
  name?: string
  description?: string
  category?: ProductCategory
  price?: number
  status?: ProductStatus
  stockQuantity?: number
  dimensions?: ProductDimensions
  materials?: string
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
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response structure
 */
export interface PaginatedProductResponse {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/**
 * API error structure
 */
export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

/**
 * Product statistics
 */
export interface ProductStatistics {
  total: number
  byCategory: Record<ProductCategory, number>
  byStatus: Record<ProductStatus, number>
  totalValue: number
  lowStock: number
}
