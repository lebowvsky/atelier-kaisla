/**
 * Home Grid Composable
 *
 * Fetches product images flagged for display on the home page grid.
 * Maps backend ProductImage entities to GalleryImage format for the ImageGrid component.
 *
 * @pattern Adapter Pattern
 * @category Structural
 * @purpose Adapts backend ProductImage entities to frontend GalleryImage format
 *
 * @pattern Decorator Pattern (loading/error state)
 * @category Structural
 * @purpose Adds loading and error state management to the async fetch operation
 *
 * @example
 * ```typescript
 * const { images, loading, error, fetchHomeGrid } = useHomeGrid()
 * onMounted(() => fetchHomeGrid())
 * ```
 */

import type { GalleryImage } from '~/types/gallery'
import type { ProductImage } from '~/types/product'

export function useHomeGrid() {
  const { apiFetch } = useApi()

  // Use Nuxt's useState for SSR-safe shared state.
  // useState serializes state from server to client via Nuxt payload,
  // preventing hydration mismatches when data is fetched during SSR.
  const images = useState<GalleryImage[]>('home-grid-images', () => [])
  const loading = useState<boolean>('home-grid-loading', () => false)
  const error = useState<Error | null>('home-grid-error', () => null)

  /**
   * Fetch images flagged for the home page grid.
   * Maps each ProductImage to GalleryImage format for the ImageGrid component.
   */
  const fetchHomeGrid = async (): Promise<GalleryImage[]> => {
    loading.value = true
    error.value = null

    try {
      const data = await apiFetch<ProductImage[]>('/products/home-grid')

      if (data && Array.isArray(data)) {
        // Adapter Pattern: Convert ProductImage[] to GalleryImage[]
        images.value = data.map((img, index) => ({
          id: img.id,
          src: img.url,
          alt: img.product?.name || `Product image ${index + 1}`,
          title: img.product?.name,
          description: img.product?.name ? `${img.product.name} - Handcrafted piece` : undefined,
          width: 800,
          height: 800,
        }))
      } else {
        images.value = []
      }
    } catch (e: unknown) {
      console.error('[useHomeGrid] Error fetching home grid:', e instanceof Error ? e.message : e)
      error.value = e as Error
      images.value = []
    } finally {
      loading.value = false
    }

    return images.value
  }

  return {
    images: readonly(images),
    loading: readonly(loading),
    error: readonly(error),
    fetchHomeGrid,
  }
}
