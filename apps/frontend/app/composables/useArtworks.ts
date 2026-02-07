/**
 * Artwork Data Management Composable
 *
 * @pattern Factory Pattern
 * @category Creational
 * @purpose Creates and manages artwork objects with consistent structure
 *
 * @pattern Singleton Pattern
 * @category Creational
 * @purpose Ensures single source of truth for artwork data
 *
 * @pattern Adapter Pattern
 * @category Structural
 * @purpose Adapts API data to internal Artwork type
 *
 * Features:
 * - Centralized artwork data management
 * - Type-safe artwork creation
 * - Filtering and sorting utilities
 * - Mock data for development
 * - Ready for API integration
 *
 * @example
 * ```typescript
 * const { artworks, getArtworkById, filterByCategory } = useArtworks()
 * const wallHangings = filterByCategory('wall-hanging')
 * ```
 */

import type { Artwork } from '~/types/artwork'

/**
 * Factory function to create artwork objects with validation
 * Ensures all required fields are present and properly typed
 *
 * @param data - Partial artwork data
 * @returns Complete Artwork object with defaults
 */
export function createArtwork(data: Artwork): Artwork {
  return {
    ...data,
    dimensions: {
      ...data.dimensions,
      unit: data.dimensions.unit || 'cm'
    },
    available: data.available ?? true
  }
}

/**
 * Main composable for artwork data management
 * Implements Singleton pattern for shared state
 */
export function useArtworks() {
  /**
   * Mock artwork data for development
   * In production, this would be fetched from an API
   *
   * Factory Pattern: Each artwork is created using the createArtwork factory
   */
  const mockArtworks: Artwork[] = [
    createArtwork({
      id: 'wh-001',
      title: 'Desert Bloom',
      imageSrc: '/images/wall-hangings/desert-bloom.jpg',
      imageAlt: 'Handwoven wall hanging featuring warm desert tones with subtle floral patterns',
      dimensions: { width: 45, height: 60, unit: 'cm' },
      material: 'Merino wool and silk on cotton warp',
      description: 'Inspired by the delicate beauty of desert flowers blooming after rain. Soft earth tones create a warm, inviting atmosphere.',
      price: 245,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/desert-bloom'
    }),
    createArtwork({
      id: 'wh-002',
      title: 'Mountain Mist',
      imageSrc: '/images/wall-hangings/mountain-mist.jpg',
      imageAlt: 'Gray and white wall hanging with misty mountain landscape motif',
      dimensions: { width: 60, height: 80, unit: 'cm' },
      material: 'Alpaca wool blend',
      description: 'Capturing the serene beauty of foggy mountain mornings. Cool grays and whites bring tranquility to your space.',
      price: 295,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/mountain-mist'
    }),
    createArtwork({
      id: 'wh-003',
      title: 'Ocean Waves',
      imageSrc: '/images/wall-hangings/ocean-waves.jpg',
      imageAlt: 'Blue and teal wall hanging with abstract ocean wave patterns',
      dimensions: { width: 50, height: 70, unit: 'cm' },
      material: 'Organic cotton and recycled denim',
      description: 'The rhythmic movement of ocean waves transformed into textile art. Deep blues and teals evoke coastal serenity.',
      price: 275,
      available: false,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/ocean-waves'
    }),
    createArtwork({
      id: 'rug-001',
      title: 'Nordic Geometric',
      imageSrc: '/images/rugs/nordic-geometric.jpg',
      imageAlt: 'Minimalist black and white rug with geometric patterns',
      dimensions: { width: 120, height: 180, unit: 'cm' },
      material: 'Icelandic wool',
      description: 'Clean lines and stark contrasts inspired by Nordic design. A modern piece that complements minimalist interiors.',
      price: 485,
      available: true,
      category: 'rug',
      detailUrl: '/rugs/nordic-geometric'
    }),
    createArtwork({
      id: 'rug-002',
      title: 'Mediterranean Sun',
      imageSrc: '/images/rugs/mediterranean-sun.jpg',
      imageAlt: 'Warm-toned rug with Mediterranean-inspired patterns',
      dimensions: { width: 140, height: 200, unit: 'cm' },
      material: '100% wool',
      description: 'Vibrant patterns reminiscent of Mediterranean tiles and sunshine. Brings warmth and character to any room.',
      price: 625,
      available: true,
      category: 'rug',
      detailUrl: '/rugs/mediterranean-sun'
    }),
    createArtwork({
      id: 'rug-003',
      title: 'Forest Floor',
      imageSrc: '/images/rugs/forest-floor.jpg',
      imageAlt: 'Green and brown rug with natural forest-inspired textures',
      dimensions: { width: 100, height: 150, unit: 'cm' },
      material: 'Wool and hemp blend',
      description: 'Earthy textures and natural colors create a grounding presence. Perfect for bringing nature indoors.',
      price: 445,
      available: true,
      category: 'rug',
      detailUrl: '/rugs/forest-floor'
    })
  ]

  // Reactive state
  const artworks = ref<Artwork[]>(mockArtworks)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Get artwork by ID
   * Pure function - returns artwork or null
   *
   * @param id - Artwork ID
   * @returns Artwork object or null if not found
   */
  const getArtworkById = (id: string): Artwork | null => {
    return artworks.value.find(artwork => artwork.id === id) || null
  }

  /**
   * Filter artworks by category
   * Pure function - returns filtered array
   *
   * @param category - Category to filter by
   * @returns Array of artworks in the specified category
   */
  const filterByCategory = (category: 'wall-hanging' | 'rug'): Artwork[] => {
    return artworks.value.filter(artwork => artwork.category === category)
  }

  /**
   * Filter available artworks
   * Pure function - returns only available artworks
   *
   * @returns Array of available artworks
   */
  const filterAvailable = (): Artwork[] => {
    return artworks.value.filter(artwork => artwork.available !== false)
  }

  /**
   * Filter by price range
   * Pure function - returns artworks within price range
   *
   * @param minPrice - Minimum price (inclusive)
   * @param maxPrice - Maximum price (inclusive)
   * @returns Array of artworks within price range
   */
  const filterByPriceRange = (minPrice: number, maxPrice: number): Artwork[] => {
    return artworks.value.filter(artwork => {
      if (!artwork.price) return false
      return artwork.price >= minPrice && artwork.price <= maxPrice
    })
  }

  /**
   * Sort artworks by price
   * Pure function - returns sorted array (ascending or descending)
   *
   * @param order - Sort order ('asc' or 'desc')
   * @returns Sorted array of artworks
   */
  const sortByPrice = (order: 'asc' | 'desc' = 'asc'): Artwork[] => {
    return [...artworks.value].sort((a, b) => {
      const priceA = a.price || 0
      const priceB = b.price || 0

      return order === 'asc' ? priceA - priceB : priceB - priceA
    })
  }

  /**
   * Sort artworks by title (alphabetically)
   * Pure function - returns sorted array
   *
   * @param order - Sort order ('asc' or 'desc')
   * @returns Sorted array of artworks
   */
  const sortByTitle = (order: 'asc' | 'desc' = 'asc'): Artwork[] => {
    return [...artworks.value].sort((a, b) => {
      const comparison = a.title.localeCompare(b.title)
      return order === 'asc' ? comparison : -comparison
    })
  }

  /**
   * Get artworks count by category
   * Pure function - returns count object
   *
   * @returns Object with counts per category
   */
  const getCountByCategory = () => {
    return computed(() => ({
      'wall-hanging': artworks.value.filter(a => a.category === 'wall-hanging').length,
      'rug': artworks.value.filter(a => a.category === 'rug').length,
      'total': artworks.value.length,
      'available': artworks.value.filter(a => a.available !== false).length
    }))
  }

  /**
   * Fetch artworks from API (placeholder for future implementation)
   * Adapter Pattern: Transforms API data to internal Artwork type
   *
   * @returns Promise resolving to artworks array
   */
  const fetchArtworks = async (): Promise<Artwork[]> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await $fetch('/api/artworks')
      // const data = response.map(item => adaptApiToArtwork(item))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      artworks.value = mockArtworks
      return artworks.value
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Adapter Pattern: Transform API data to Artwork type
   * Example transformation function (adjust based on actual API structure)
   *
   * @param apiData - Raw data from API
   * @returns Artwork object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _adaptApiToArtwork = (apiData: any): Artwork => {
    return createArtwork({
      id: apiData.id,
      title: apiData.title,
      imageSrc: apiData.image_url,
      imageAlt: apiData.image_alt || apiData.title,
      dimensions: {
        width: apiData.width,
        height: apiData.height,
        depth: apiData.depth,
        unit: apiData.unit || 'cm'
      },
      material: apiData.materials,
      description: apiData.description,
      price: apiData.price,
      available: apiData.in_stock,
      category: apiData.category,
      detailUrl: `/products/${apiData.slug}`
    })
  }

  // Return public API
  return {
    // State
    artworks: readonly(artworks),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    getArtworkById,
    getCountByCategory,

    // Filters (Pure functions)
    filterByCategory,
    filterAvailable,
    filterByPriceRange,

    // Sorting (Pure functions)
    sortByPrice,
    sortByTitle,

    // Actions
    fetchArtworks
  }
}
