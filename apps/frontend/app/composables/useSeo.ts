interface UseSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | null | undefined>
  type?: 'website' | 'article' | 'product'
  path?: MaybeRefOrGetter<string>
  noindex?: boolean
}

const resolveValue = <T>(value: MaybeRefOrGetter<T>): T => toValue(value)

const ensureAbsoluteUrl = (siteUrl: string, value: string | null | undefined): string | undefined => {
  if (!value) return undefined
  if (/^https?:\/\//.test(value)) return value
  const path = value.startsWith('/') ? value : `/${value}`
  return `${siteUrl.replace(/\/$/, '')}${path}`
}

export function useSeo(options: UseSeoOptions): void {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = (config.public.siteUrl as string) || ''
  const fallbackImage = `${siteUrl}/logo-kaisla.png`

  const fullUrl = computed(() => {
    const path = resolveValue(options.path) ?? route.path
    return `${siteUrl.replace(/\/$/, '')}${path}`
  })

  const ogImage = computed(() => {
    const raw = resolveValue(options.image)
    return ensureAbsoluteUrl(siteUrl, raw) ?? fallbackImage
  })

  useSeoMeta({
    title: () => resolveValue(options.title),
    description: () => resolveValue(options.description),
    ogTitle: () => resolveValue(options.title),
    ogDescription: () => resolveValue(options.description),
    ogImage: () => ogImage.value,
    ogUrl: () => fullUrl.value,
    ogType: options.type ?? 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: () => resolveValue(options.title),
    twitterDescription: () => resolveValue(options.description),
    twitterImage: () => ogImage.value,
    robots: options.noindex ? 'noindex, nofollow' : 'index, follow'
  })

  useHead({
    link: [{ rel: 'canonical', href: () => fullUrl.value }]
  })
}
