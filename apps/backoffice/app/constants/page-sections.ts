/**
 * Map of pages to the sections their public frontend actually consumes.
 * Source of truth for the backoffice section selector.
 *
 * Keep in sync with `usePageContent('<page>', '<section>')` calls in
 * apps/frontend/app/pages/*. Adding an entry here only enables it in the
 * backoffice UI — it does not wire it on the public site.
 */
export const PAGE_SECTIONS = {
  home: ['hero', 'intro'],
  rugs: ['intro'],
  'wall-hanging': ['intro'],
  about: ['hero'],
  blog: [],
} as const satisfies Record<string, readonly string[]>

export type ConfiguredPage = keyof typeof PAGE_SECTIONS

export function getSectionsForPage(page: string): readonly string[] {
  return PAGE_SECTIONS[page as ConfiguredPage] ?? []
}

export function hasSectionsConfigured(page: string): boolean {
  return getSectionsForPage(page).length > 0
}
