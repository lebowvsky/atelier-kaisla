export interface BlogTag {
  id: string
  name: string
  slug: string
}

export interface BlogArticleImage {
  id: string
  url: string
  altText: string | null
  isCover: boolean
  sortOrder: number
}

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
