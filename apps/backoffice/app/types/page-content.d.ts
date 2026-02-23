export interface PageContent {
  id: string
  page: string
  section: string
  title?: string
  content?: string
  image?: string
  imageAlt?: string
  metadata?: Record<string, unknown>
  isPublished: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePageContentDto {
  page: string
  section: string
  title?: string
  content?: string
  image?: string
  imageAlt?: string
  metadata?: Record<string, unknown>
  sortOrder?: number
  isPublished?: boolean
}

export interface UpdatePageContentDto {
  page?: string
  section?: string
  title?: string
  content?: string
  imageAlt?: string
  metadata?: Record<string, unknown>
  sortOrder?: number
  isPublished?: boolean
}
