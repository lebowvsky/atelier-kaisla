export interface PageContent {
  id: string
  page: string
  section: string
  title: string | null
  content: string | null
  image: string | null
  imageAlt: string | null
  metadata: Record<string, unknown> | null
  isPublished: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}
