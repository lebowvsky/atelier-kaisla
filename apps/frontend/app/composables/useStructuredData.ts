import type { Product } from '~/types/product'
import type { BlogArticle } from '~/types/blog-article'

export interface BreadcrumbItem {
  name: string
  url?: string
}

const stripHtml = (input: string): string => input.replace(/<[^>]*>/g, '').trim()

const truncate = (input: string, max = 160): string =>
  input.length > max ? `${input.substring(0, max - 1).trimEnd()}…` : input

const ensureAbsoluteUrl = (siteUrl: string, value: string | null | undefined): string | undefined => {
  if (!value) return undefined
  if (/^https?:\/\//.test(value)) return value
  const path = value.startsWith('/') ? value : `/${value}`
  return `${siteUrl.replace(/\/$/, '')}${path}`
}

export function useBreadcrumbsSchema(items: MaybeRefOrGetter<BreadcrumbItem[]>): void {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string) || ''

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: computed(() =>
        toValue(items).map((item) => ({
          name: item.name,
          item: item.url ? ensureAbsoluteUrl(siteUrl, item.url) : undefined
        }))
      )
    })
  ])
}

export function useProductSchema(product: MaybeRefOrGetter<Product | null | undefined>): void {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string) || ''

  useSchemaOrg([
    defineProduct({
      name: computed(() => toValue(product)?.name ?? ''),
      description: computed(() => toValue(product)?.description ?? ''),
      image: computed(() => {
        const value = toValue(product)
        const cover = value?.productImages?.[0]?.url
        return ensureAbsoluteUrl(siteUrl, cover) ?? `${siteUrl}/logo-kaisla.png`
      }),
      offers: computed(() => {
        const value = toValue(product)
        if (!value) return undefined
        return [
          {
            price: value.price,
            priceCurrency: 'EUR',
            availability:
              value.status === 'available' && value.stockQuantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock'
          }
        ]
      })
    })
  ])
}

export function useArticleSchema(article: MaybeRefOrGetter<BlogArticle | null | undefined>): void {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string) || ''

  useSchemaOrg([
    defineArticle({
      headline: computed(() => toValue(article)?.title ?? ''),
      description: computed(() => {
        const value = toValue(article)
        if (!value) return ''
        if (value.metaDescription) return value.metaDescription
        if (value.excerpt) return truncate(value.excerpt)
        return truncate(stripHtml(value.content))
      }),
      image: computed(() => {
        const value = toValue(article)
        const cover = value?.images.find((img) => img.isCover)?.url ?? value?.images[0]?.url
        return ensureAbsoluteUrl(siteUrl, cover) ?? `${siteUrl}/logo-kaisla.png`
      }),
      datePublished: computed(() => toValue(article)?.publishedAt ?? toValue(article)?.createdAt ?? ''),
      dateModified: computed(() => toValue(article)?.updatedAt ?? '')
    })
  ])
}

export function useCollectionPageSchema(name: MaybeRefOrGetter<string>): void {
  useSchemaOrg([
    defineWebPage({
      '@type': 'CollectionPage',
      name: computed(() => toValue(name))
    })
  ])
}
