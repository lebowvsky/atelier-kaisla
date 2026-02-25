/**
 * @pattern Value Object
 * @category Type Definitions
 * @purpose Type-safe blog data structures aligned with backend entities
 */

/**
 * Blog tag entity (aligned with backend BlogTag entity)
 */
export interface BlogTag {
  id: string
  name: string
  slug: string
  createdAt: string
}

/**
 * Blog article image entity (aligned with backend BlogArticleImage entity)
 */
export interface BlogArticleImage {
  id: string
  url: string
  altText: string | null
  isCover: boolean
  sortOrder: number
  createdAt: string
}

/**
 * Blog article entity (aligned with backend BlogArticle entity)
 */
export interface BlogArticle {
  id: string
  title: string
  subtitle: string | null
  content: string
  slug: string
  publishedAt: string | null
  isPublished: boolean
  sortOrder: number
  images: BlogArticleImage[]
  tags: BlogTag[]
  createdAt: string
  updatedAt: string
}

/**
 * DTO for creating a new blog article
 */
export interface CreateBlogArticleDto {
  title: string
  subtitle?: string
  content: string
  slug?: string
  publishedAt?: string
  isPublished?: boolean
  sortOrder?: number
  tagIds?: string[]
}

/**
 * DTO for updating an existing blog article (all fields optional)
 */
export type UpdateBlogArticleDto = Partial<CreateBlogArticleDto>

/**
 * DTO for creating a new blog tag
 */
export interface CreateBlogTagDto {
  name: string
}

/**
 * DTO for updating an existing blog tag (all fields optional)
 */
export type UpdateBlogTagDto = Partial<CreateBlogTagDto>
