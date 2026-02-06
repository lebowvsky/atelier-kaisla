/**
 * @pattern Facade + Adapter + Decorator Patterns
 * @category Composables
 * @purpose Centralized contact link data management with type-safe API integration
 *
 * Patterns Applied:
 * - Facade: Simplified interface for complex API operations
 * - Adapter: Transforms backend responses to frontend format (via useApi)
 * - Decorator: Adds loading/error state management (via useApi)
 *
 * @example
 * ```typescript
 * const { contactLinks, loading, error, fetchAllContactLinks, createContactLink } = useContactLinks()
 * await fetchAllContactLinks()
 * ```
 */

import type {
  ContactLink,
  CreateContactLinkDto,
  UpdateContactLinkDto,
} from '@/types/contact-link'

/**
 * Contact links management state and operations
 */
export function useContactLinks() {
  // Internal state (reactive)
  const contactLinks = ref<ContactLink[]>([])

  // Shared API infrastructure
  const {
    loading,
    error,
    hasError,
    getApiUrl,
    getAuthHeaders,
    executeApiCall,
    clearError,
  } = useApi('useContactLinks')

  /**
   * Fetch all contact links (including inactive) for backoffice
   * Pattern: Facade - simplifies API interaction
   */
  const fetchAllContactLinks = async (): Promise<ContactLink[]> => {
    const result = await executeApiCall(
      async () => {
        const apiUrl = getApiUrl()
        const url = `${apiUrl}/contact-links/all`

        console.debug('[useContactLinks] Fetching all contact links from:', url)

        return await $fetch<ContactLink[]>(url, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
      },
      (data) => {
        contactLinks.value = data
      }
    )

    return result || []
  }

  /**
   * Create a new contact link
   * Pattern: Facade - simplifies POST operation
   */
  const createContactLink = async (
    dto: CreateContactLinkDto
  ): Promise<ContactLink | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/contact-links`

      console.debug('[useContactLinks] Creating contact link at:', url)

      return await $fetch<ContactLink>(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Add to local state
    if (result) {
      contactLinks.value = [...contactLinks.value, result]
    }

    return result
  }

  /**
   * Update an existing contact link
   * Pattern: Facade - simplifies PATCH operation
   */
  const updateContactLink = async (
    id: string,
    dto: UpdateContactLinkDto
  ): Promise<ContactLink | null> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/contact-links/${id}`

      console.debug('[useContactLinks] Updating contact link at:', url)

      return await $fetch<ContactLink>(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: dto,
      })
    })

    // Update local state
    if (result) {
      const index = contactLinks.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        contactLinks.value[index] = result
      }
    }

    return result
  }

  /**
   * Delete a contact link
   * Pattern: Facade - simplifies DELETE operation
   */
  const deleteContactLink = async (id: string): Promise<boolean> => {
    const result = await executeApiCall(async () => {
      const apiUrl = getApiUrl()
      const url = `${apiUrl}/contact-links/${id}`

      console.debug('[useContactLinks] Deleting contact link at:', url)

      await $fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return true
    })

    // Remove from local state
    if (result) {
      contactLinks.value = contactLinks.value.filter((l) => l.id !== id)
    }

    return result || false
  }

  /**
   * Reset all state
   */
  const reset = () => {
    contactLinks.value = []
    clearError()
  }

  /**
   * Computed: Check if contact links are loaded
   */
  const hasContactLinks = computed(() => contactLinks.value.length > 0)

  /**
   * Public API (readonly for state, methods for actions)
   */
  return {
    // State (readonly)
    contactLinks: readonly(contactLinks) as Readonly<Ref<ContactLink[]>>,
    loading,
    error,

    // Computed
    hasContactLinks,
    hasError,

    // Actions
    fetchAllContactLinks,
    createContactLink,
    updateContactLink,
    deleteContactLink,
    clearError,
    reset,
  }
}
