import type { SitemapUrlInput } from '#sitemap/types'

interface ProductImage {
  url: string
  sortOrder: number
}

interface Product {
  id: string
  name: string
  category: 'wall-hanging' | 'rug'
  status: 'available' | 'sold' | 'draft'
  productImages?: ProductImage[]
  updatedAt: string
}

interface BlogArticleImage {
  url: string
  isCover: boolean
}

interface BlogArticle {
  id: string
  title: string
  slug: string
  isPublished: boolean
  publishedAt: string | null
  updatedAt: string
  images: BlogArticleImage[]
}

export default defineCachedEventHandler(
  async (): Promise<SitemapUrlInput[]> => {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl

    const urls: SitemapUrlInput[] = []

    try {
      const products = await $fetch<Product[]>(`${apiUrl}/products`, {
        timeout: 5000
      }).catch(() => [] as Product[])

      for (const product of products) {
        if (product.status === 'draft') continue

        const categoryPath = product.category === 'wall-hanging' ? '/wall-hanging' : '/rugs'
        const cover = product.productImages?.[0]?.url

        urls.push({
          loc: `${categoryPath}#product-${product.id}`,
          lastmod: product.updatedAt,
          changefreq: 'weekly',
          priority: 0.8,
          images: cover ? [{ loc: cover, title: product.name }] : undefined
        })
      }
    } catch (error) {
      console.error('[sitemap] Failed to fetch products', error)
    }

    try {
      const articles = await $fetch<BlogArticle[]>(`${apiUrl}/blog`, {
        timeout: 5000
      }).catch(() => [] as BlogArticle[])

      for (const article of articles) {
        if (!article.isPublished) continue

        const cover = article.images.find((img) => img.isCover)?.url ?? article.images[0]?.url

        urls.push({
          loc: `/blog/${article.id}`,
          lastmod: article.updatedAt,
          changefreq: 'monthly',
          priority: 0.7,
          images: cover ? [{ loc: cover, title: article.title }] : undefined
        })
      }
    } catch (error) {
      console.error('[sitemap] Failed to fetch blog articles', error)
    }

    return urls
  },
  {
    name: 'sitemap-urls',
    maxAge: 60 * 60,
    swr: true
  }
)
