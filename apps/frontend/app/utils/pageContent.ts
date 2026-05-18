import type { PageContent } from '~/types/page-content'
import { isEmptyHtml } from './sanitizeHtml'

export function isPageContentEmpty(content: PageContent | null | undefined): boolean {
  if (!content) return true
  const hasEyebrow = !!content.eyebrow?.trim()
  const hasTitle = !!content.title?.trim()
  const hasContent = !isEmptyHtml(content.content)
  const hasImage = !!content.image?.trim()
  const hasBlocks = (content.blocks?.length ?? 0) > 0
  return !hasEyebrow && !hasTitle && !hasContent && !hasImage && !hasBlocks
}
