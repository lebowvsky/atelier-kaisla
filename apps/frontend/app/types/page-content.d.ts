export interface PageContentBlock {
  id: string
  title: string
  description: string
  sortOrder: number
}

export interface PageContent {
  id: string
  page: string
  section: string
  eyebrow: string | null
  title: string | null
  content: string | null
  image: string | null
  imageAlt: string | null
  metadata: Record<string, unknown> | null
  isPublished: boolean
  sortOrder: number
  blocks: PageContentBlock[]
  createdAt: string
  updatedAt: string
}
