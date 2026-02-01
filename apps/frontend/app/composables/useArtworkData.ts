/**
 * Artwork Data Composable
 *
 * Provides mock artwork data for development and testing purposes.
 * In production, this would be replaced with API calls to the backend.
 *
 * Design Patterns Applied:
 * - @pattern Factory Pattern
 * - @category Creational
 * - @purpose Creates artwork objects with consistent structure
 *
 * - @pattern Singleton Pattern
 * - @category Creational
 * - @purpose Ensures consistent data across components (mock data cache)
 *
 * Features:
 * - Type-safe artwork data generation
 * - Filtered collections by category
 * - Realistic mock data for development
 * - Easy migration path to API integration
 *
 * @example
 * ```typescript
 * const { wallHangings, rugs, allArtworks } = useArtworkData()
 * ```
 */

import type { Artwork } from '~/types/artwork'

/**
 * Factory Pattern: Create artwork objects with consistent structure
 * Pure function - no side effects
 *
 * @returns Object containing artwork collections
 */
export function useArtworkData() {
  /**
   * Mock data for wall hangings
   * In production, this would be fetched from the backend API
   */
  const wallHangings = ref<Artwork[]>([
    {
      id: 'wh-001',
      title: 'Organic Waves',
      imageSrc: '/placeholder-artwork-1.svg',
      imageAlt: 'Handwoven wall hanging with organic wave patterns in natural tones',
      dimensions: {
        width: 60,
        height: 80,
        unit: 'cm',
      },
      material: '100% wool on cotton warp',
      description:
        'A flowing composition inspired by ocean waves, handwoven with natural wool in earthy tones. Perfect for adding texture and warmth to any space.',
      price: 450,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/organic-waves',
    },
    {
      id: 'wh-002',
      title: 'Desert Sunset',
      imageSrc: '/placeholder-artwork-2.svg',
      imageAlt: 'Warm-toned wall hanging featuring gradient sunset colors',
      dimensions: {
        width: 50,
        height: 70,
        unit: 'cm',
      },
      material: 'Merino wool and cotton blend',
      description:
        'Capturing the essence of a desert sunset with gradient hues from terracotta to soft peach. Each piece is unique and one-of-a-kind.',
      price: 380,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/desert-sunset',
    },
    {
      id: 'wh-003',
      title: 'Forest Whispers',
      imageSrc: '/placeholder-artwork-3.svg',
      imageAlt: 'Green and brown textured wall hanging with forest-inspired design',
      dimensions: {
        width: 70,
        height: 90,
        unit: 'cm',
      },
      material: 'Natural wool, linen, and jute',
      description:
        'A celebration of nature with layered textures reminiscent of forest foliage. Handcrafted using sustainable materials.',
      price: 520,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/forest-whispers',
    },
    {
      id: 'wh-004',
      title: 'Minimalist Lines',
      imageSrc: '/placeholder-artwork-4.svg',
      imageAlt: 'Contemporary wall hanging with clean geometric lines',
      dimensions: {
        width: 45,
        height: 60,
        unit: 'cm',
      },
      material: '100% organic cotton',
      description:
        'Clean, contemporary design featuring bold geometric lines. A statement piece that complements modern interiors beautifully.',
      price: 320,
      available: false,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/minimalist-lines',
    },
    {
      id: 'wh-005',
      title: 'Coastal Dreams',
      imageSrc: '/placeholder-artwork-5.svg',
      imageAlt: 'Blue and white wall hanging inspired by coastal landscapes',
      dimensions: {
        width: 55,
        height: 75,
        unit: 'cm',
      },
      material: 'Wool and recycled cotton',
      description:
        'Soft blues and whites evoke tranquil coastal scenes. Made with eco-friendly materials and traditional weaving techniques.',
      price: 410,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/coastal-dreams',
    },
    {
      id: 'wh-006',
      title: 'Terra Collection',
      imageSrc: '/placeholder-artwork-6.svg',
      imageAlt: 'Earthy-toned wall hanging with abstract terracotta patterns',
      dimensions: {
        width: 65,
        height: 85,
        unit: 'cm',
      },
      material: 'Handspun wool and natural dyes',
      description:
        'Rich terracotta and earth tones create a grounding presence. Dyed using only natural plant-based materials for lasting color.',
      price: 480,
      available: true,
      category: 'wall-hanging',
      detailUrl: '/wall-hanging/terra-collection',
    },
  ])

  /**
   * Mock data for rugs
   * In production, this would be fetched from the backend API
   */
  const rugs = ref<Artwork[]>([
    {
      id: 'rug-001',
      title: 'Nordic Minimalism',
      imageSrc: '/placeholder-rug-1.jpg',
      imageAlt: 'Minimalist handwoven rug with Nordic-inspired geometric patterns',
      dimensions: {
        width: 120,
        height: 180,
        unit: 'cm',
      },
      material: '100% pure new wool',
      description:
        'A timeless piece featuring clean lines and Nordic-inspired patterns. Hand-knotted for durability and lasting beauty.',
      price: 890,
      available: true,
      category: 'rug',
      detailUrl: '/rugs/nordic-minimalism',
    },
    {
      id: 'rug-002',
      title: 'Bohemian Dreams',
      imageSrc: '/placeholder-rug-2.jpg',
      imageAlt: 'Colorful bohemian-style rug with intricate patterns',
      dimensions: {
        width: 140,
        height: 200,
        unit: 'cm',
      },
      material: 'Wool and cotton blend',
      description:
        'Vibrant colors and intricate patterns create a bold statement. Perfect for adding character to eclectic interiors.',
      price: 950,
      available: true,
      category: 'rug',
      detailUrl: '/rugs/bohemian-dreams',
    },
  ])

  /**
   * Computed: All artworks combined
   * Pure computation - combines all collections
   */
  const allArtworks = computed<Artwork[]>(() => {
    return [...wallHangings.value, ...rugs.value]
  })

  /**
   * Factory Method: Filter artworks by category
   * Pure function - returns filtered collection
   *
   * @param category - The artwork category to filter by
   * @returns Filtered array of artworks
   */
  const getArtworksByCategory = (
    category: 'wall-hanging' | 'rug'
  ): Artwork[] => {
    return allArtworks.value.filter((artwork) => artwork.category === category)
  }

  /**
   * Factory Method: Get artwork by ID
   * Pure function - finds artwork by unique identifier
   *
   * @param id - The artwork ID to find
   * @returns Artwork object or undefined
   */
  const getArtworkById = (id: string): Artwork | undefined => {
    return allArtworks.value.find((artwork) => artwork.id === id)
  }

  /**
   * Computed: Available artworks only
   * Pure computation - filters out sold items
   */
  const availableArtworks = computed<Artwork[]>(() => {
    return allArtworks.value.filter((artwork) => artwork.available !== false)
  })

  return {
    wallHangings: readonly(wallHangings),
    rugs: readonly(rugs),
    allArtworks: readonly(allArtworks),
    availableArtworks: readonly(availableArtworks),
    getArtworksByCategory,
    getArtworkById,
  }
}
