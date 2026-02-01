/**
 * Story Data Composable
 *
 * Provides story section data for the About page.
 * Currently uses mock data, designed for easy API integration.
 *
 * @pattern Factory Pattern
 * @category Creational
 * @purpose Creates story objects with consistent structure and defaults
 *
 * @pattern Adapter Pattern
 * @category Structural
 * @purpose Ready to adapt external API data to internal Story interface
 *
 * Design Principles:
 * - Single Responsibility: Only handles story data fetching/creation
 * - Open/Closed: Easy to extend with new story types without modification
 * - Dependency Inversion: Returns interface, not concrete implementation
 *
 * Future Enhancements:
 * - Replace mock data with API calls
 * - Add caching strategy with Proxy pattern
 * - Add loading/error states with Decorator pattern
 * - Add pagination for large story collections
 *
 * @example
 * ```typescript
 * const { aboutStories, getStoryById } = useStoryData()
 * ```
 */

import type { Story, ImagePosition } from '~/types/story'

/**
 * Story Factory Function
 * Creates a story object with proper defaults
 *
 * @pattern Factory Pattern
 * @param config - Partial story configuration
 * @returns Complete Story object
 */
function createStory(
  config: Omit<Story, 'imagePosition' | 'theme'> & {
    imagePosition?: ImagePosition
    theme?: 'light' | 'dark'
  }
): Story {
  return {
    imagePosition: 'left',
    theme: 'light',
    ...config
  }
}

/**
 * Main composable for story data
 *
 * @returns Story data and utility functions
 */
export function useStoryData() {
  /**
   * About page stories
   * Contains creator, project, and book stories
   *
   * Pattern: Template Method Pattern
   * Each story follows the same structure but with different content
   */
  const aboutStories = ref<Story[]>([
    createStory({
      id: 'creator',
      title: 'L\'Histoire de la Créatrice',
      image: {
        src: '/images/about/creator.jpg',
        alt: 'Portrait de la créatrice d\'Atelier Kaisla dans son atelier',
        width: 600,
        height: 800
      },
      content: `Passionnée par les arts textiles depuis son plus jeune âge, la créatrice d'Atelier Kaisla a développé un savoir-faire unique au fil des années. Formée aux techniques traditionnelles du tissage et de la teinture naturelle, elle allie aujourd'hui tradition et modernité dans chacune de ses créations.

Son parcours l'a menée à travers différents ateliers et formations en Europe, où elle a perfectionné son art et développé sa signature artistique. Chaque pièce qu'elle crée raconte une histoire, reflète une émotion, et témoigne de son engagement pour un artisanat éthique et durable.

Au cœur de son travail, on retrouve une recherche constante d'harmonie entre les couleurs, les textures et les formes. Inspirée par la nature et les paysages nordiques, elle transforme la laine et les fibres naturelles en véritables œuvres d'art murales.`,
      imagePosition: 'left'
    }),

    createStory({
      id: 'project',
      title: 'L\'Histoire du Projet',
      image: {
        src: '/images/about/project.jpg',
        alt: 'Atelier de création avec métiers à tisser et matériaux naturels',
        width: 600,
        height: 800
      },
      content: `Atelier Kaisla est né d'une vision : rendre l'artisanat textile accessible tout en préservant l'authenticité et la qualité du fait-main. Le nom "Kaisla" signifie "roseau" en finnois, évoquant la flexibilité, la résistance et la beauté naturelle qui caractérisent chaque création.

Le projet a démarré dans un petit atelier familial, avec quelques métiers à tisser et une passion débordante pour les fibres naturelles. Au fil du temps, l'atelier s'est agrandi, mais l'esprit artisanal est resté intact. Chaque pièce continue d'être conçue et réalisée à la main, avec une attention méticuleuse aux détails.

Aujourd'hui, Atelier Kaisla collabore avec des artisans locaux pour se procurer des matériaux durables et éthiques. L'atelier s'engage dans une démarche éco-responsable, utilisant des teintures naturelles et privilégiant les circuits courts. Plus qu'un simple atelier de création, Kaisla est devenu un lieu de partage et de transmission de savoir-faire ancestraux.`,
      imagePosition: 'right'
    }),

    createStory({
      id: 'book',
      title: 'L\'Histoire du Livre',
      image: {
        src: '/images/about/book.jpg',
        alt: 'Livre ouvert montrant des techniques de tissage et créations textiles',
        width: 600,
        height: 800
      },
      content: `Pour partager sa passion et son expertise, la créatrice d'Atelier Kaisla a rédigé un livre complet sur l'art du tissage mural contemporain. Cet ouvrage richement illustré guide les lecteurs à travers les techniques fondamentales et avancées de cet art ancestral.

Le livre explore l'histoire du tissage, des civilisations anciennes aux tendances contemporaines. Il propose des tutoriels détaillés, des schémas explicatifs et des projets créatifs adaptés à tous les niveaux. Que vous soyez débutant curieux ou artisan confirmé, vous y trouverez inspiration et guidance.

Au-delà de la technique, l'ouvrage aborde également la philosophie de création, l'importance du choix des matériaux, et l'impact environnemental de nos pratiques artisanales. Disponible dans plusieurs langues, ce livre est devenu une référence pour la communauté internationale des artisans textiles et contribue à perpétuer cet art précieux.`,
      imagePosition: 'left'
    })
  ])

  /**
   * Get a single story by ID
   *
   * @param id - Story identifier
   * @returns Story object or undefined
   */
  const getStoryById = (id: string): Story | undefined => {
    return aboutStories.value.find(story => story.id === id)
  }

  /**
   * Get stories with specific image position
   * Useful for creating visual patterns
   *
   * @param position - Image position filter
   * @returns Filtered stories array
   */
  const getStoriesByPosition = (position: ImagePosition): Story[] => {
    return aboutStories.value.filter(story => story.imagePosition === position)
  }

  /**
   * Toggle story image position
   * Strategy Pattern: Change layout strategy
   *
   * @param id - Story identifier
   */
  const toggleStoryImagePosition = (id: string): void => {
    const story = getStoryById(id)
    if (story) {
      story.imagePosition = story.imagePosition === 'left' ? 'right' : 'left'
    }
  }

  // Return public API (readonly for stories to prevent external mutations)
  return {
    aboutStories: readonly(aboutStories),
    getStoryById,
    getStoriesByPosition,
    toggleStoryImagePosition
  }
}

/**
 * Composable for fetching stories from API (Future Enhancement)
 *
 * @pattern Decorator Pattern
 * @purpose Adds loading/error states to data fetching
 *
 * @example
 * ```typescript
 * const { stories, isLoading, error, fetchStories } = useStoryApi()
 * await fetchStories()
 * ```
 */
export function useStoryApi() {
  const stories = ref<Story[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Fetch stories from API
   * Template Method Pattern: Standard fetch flow
   */
  const fetchStories = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // Future: Replace with actual API call
      // const response = await $fetch('/api/stories')
      // stories.value = response.data

      // Temporary: Use mock data
      const { aboutStories } = useStoryData()
      stories.value = aboutStories.value as Story[]
    } catch (e) {
      error.value = e as Error
      console.error('Failed to fetch stories:', e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    stories: readonly(stories),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchStories
  }
}
