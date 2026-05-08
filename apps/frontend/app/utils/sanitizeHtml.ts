import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'hr', 'a', 'span']

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
  })
}

export function isHtmlContent(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content)
}

export function isEmptyHtml(content: string | null | undefined): boolean {
  if (!content) return true
  return content.replace(/<[^>]*>/g, '').replace(/\s|&nbsp;/g, '') === ''
}
