export interface PageContentBlock {
  id?: string
  title: string
  description: string
  sortOrder?: number
}

export interface PageContent {
  id: string
  page: string
  section: string
  eyebrow: string | null
  title?: string
  content?: string
  image?: string
  imageAlt?: string
  metadata?: Record<string, unknown>
  blocks?: PageContentBlock[]
  isPublished: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePageContentDto {
  page: string
  section: string
  eyebrow?: string
  title?: string
  content?: string
  image?: string
  imageAlt?: string
  metadata?: Record<string, unknown>
  blocks?: PageContentBlock[]
  sortOrder?: number
  isPublished?: boolean
}

export interface UpdatePageContentDto {
  page?: string
  section?: string
  eyebrow?: string
  title?: string
  content?: string
  imageAlt?: string
  metadata?: Record<string, unknown>
  blocks?: PageContentBlock[]
  sortOrder?: number
  isPublished?: boolean
}
