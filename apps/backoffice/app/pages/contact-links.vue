<!--
  @pattern Facade + Strategy + Observer Patterns
  @purpose Contact links management page with real API integration

  Patterns Applied:
  - Facade: useContactLinks composable simplifies complex API operations
  - Strategy: Sorting by sortOrder
  - Observer: Reactive state updates from API
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import ContactLinkForm from '@/components/contact-links/ContactLinkForm.vue'
import { Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff, ExternalLink } from 'lucide-vue-next'
import type { ContactLink } from '@/types/contact-link'

/**
 * SEO Configuration
 */
useSeoMeta({
  title: 'Contact & Social Links - Atelier Kaisla Backoffice',
  description: 'Manage contact and social media links for Atelier Kaisla e-commerce platform',
})

/**
 * Pattern: Facade Pattern - Centralized data management
 */
const {
  contactLinks,
  loading,
  error,
  hasContactLinks,
  hasError,
  fetchAllContactLinks,
  deleteContactLink,
  clearError,
} = useContactLinks()

/**
 * Computed: Sorted contact links by sortOrder
 */
const sortedContactLinks = computed(() => {
  return [...contactLinks.value].sort((a, b) => a.sortOrder - b.sortOrder)
})

/**
 * Computed: Statistics
 */
const totalLinks = computed(() => contactLinks.value.length)
const activeLinks = computed(
  () => contactLinks.value.filter((l) => l.isActive).length
)
const inactiveLinks = computed(
  () => contactLinks.value.filter((l) => !l.isActive).length
)

/**
 * Load contact links on mount (client-side only)
 */
onMounted(async () => {
  await fetchAllContactLinks()
})

/**
 * Refresh contact links list
 */
const refreshContactLinks = async () => {
  await fetchAllContactLinks()
}

/**
 * Handle contact link deletion
 */
const handleDelete = async (id: string, platform: string, label?: string) => {
  const displayName = label || platform
  if (!confirm(`Are you sure you want to delete "${displayName}"?`)) {
    return
  }

  const success = await deleteContactLink(id)
  if (success) {
    console.log('Contact link deleted successfully')
  }
}

/**
 * Sheet state for contact link form
 */
const isFormOpen = ref(false)

/**
 * Edit contact link state
 */
const editingContactLink = ref<ContactLink | null>(null)

/**
 * Open form in create mode
 */
const openCreateForm = () => {
  editingContactLink.value = null
  isFormOpen.value = true
}

/**
 * Open form in edit mode
 */
const openEditForm = (contactLink: ContactLink) => {
  editingContactLink.value = contactLink
  isFormOpen.value = true
}

/**
 * Handle form success
 */
const handleFormSuccess = async () => {
  isFormOpen.value = false
  editingContactLink.value = null
  await refreshContactLinks()
}

/**
 * Handle form close
 */
const handleFormClose = () => {
  isFormOpen.value = false
  editingContactLink.value = null
}

/**
 * Platform display labels
 */
const platformLabels: Record<string, string> = {
  email: 'Email',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
  twitter: 'Twitter / X',
  website: 'Website',
  other: 'Other',
}

/**
 * Get display label for a platform
 */
const getPlatformLabel = (platform: string): string => {
  return platformLabels[platform] || platform
}

/**
 * Truncate text helper
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format date helper
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Contact & Social Links</h2>
          <p class="text-muted-foreground">
            Manage contact methods and social media links displayed on the website
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="refreshContactLinks"
            :disabled="loading"
          >
            <RefreshCw
              class="mr-2 h-4 w-4"
              :class="{ 'animate-spin': loading }"
            />
            Refresh
          </Button>
          <Sheet v-model:open="isFormOpen">
            <SheetTrigger as-child>
              <Button @click="openCreateForm">
                <Plus class="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </SheetTrigger>
            <SheetContent class="w-full sm:max-w-2xl">
              <ContactLinkForm
                :open="isFormOpen"
                :edit-contact-link="editingContactLink"
                @close="handleFormClose"
                @success="handleFormSuccess"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Total Links
          </div>
          <div class="text-2xl font-bold">{{ totalLinks }}</div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Active
          </div>
          <div class="text-2xl font-bold text-green-600">
            {{ activeLinks }}
          </div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Inactive
          </div>
          <div class="text-2xl font-bold text-yellow-600">
            {{ inactiveLinks }}
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="hasError && error"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">Error Loading Contact Links</h3>
            <p class="text-sm">{{ error.message }}</p>
          </div>
          <Button variant="ghost" size="sm" @click="clearError">
            Dismiss
          </Button>
        </div>
      </div>

      <!-- Contact Links Content -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <!-- Loading State -->
        <div
          v-if="loading && !hasContactLinks"
          class="flex items-center justify-center p-12"
        >
          <div class="text-center">
            <RefreshCw class="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">
              Loading contact links...
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!hasContactLinks"
          class="flex flex-col items-center justify-center p-12"
        >
          <div class="text-center">
            <h3 class="text-lg font-semibold">No contact links found</h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Get started by adding your first contact or social media link
            </p>
            <Button class="mt-4" @click="openCreateForm">
              <Plus class="mr-2 h-4 w-4" />
              Add Link
            </Button>
          </div>
        </div>

        <!-- Contact Links List -->
        <div v-else class="divide-y">
          <div
            v-for="link in sortedContactLinks"
            :key="link.id"
            class="flex gap-4 p-4 transition-colors hover:bg-muted/50"
          >
            <!-- Platform Badge -->
            <div class="flex flex-shrink-0 items-center">
              <span
                class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary"
              >
                {{ getPlatformLabel(link.platform).substring(0, 2).toUpperCase() }}
              </span>
            </div>

            <!-- Link Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2">
                <h4 class="font-semibold text-sm">
                  {{ getPlatformLabel(link.platform) }}
                </h4>
                <!-- Sort Order Badge -->
                <span
                  class="inline-flex flex-shrink-0 items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  #{{ link.sortOrder }}
                </span>
                <!-- Active/Inactive Badge -->
                <span
                  class="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="link.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'"
                >
                  <Eye v-if="link.isActive" class="h-3 w-3" />
                  <EyeOff v-else class="h-3 w-3" />
                  {{ link.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>

              <!-- URL (truncated) -->
              <p class="mt-1 text-sm text-muted-foreground truncate">
                {{ truncateText(link.url, 80) }}
              </p>

              <!-- Meta info -->
              <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span v-if="link.label">Label: {{ link.label }}</span>
                <span>Created {{ formatDate(link.createdAt) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-shrink-0 items-start gap-1">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                title="Open link"
              >
                <ExternalLink class="h-4 w-4" />
              </a>
              <Button
                variant="ghost"
                size="sm"
                title="Edit link"
                @click="openEditForm(link)"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Delete link"
                @click="handleDelete(link.id, link.platform, link.label)"
              >
                <Trash2 class="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>

          <!-- Footer count -->
          <div
            class="flex items-center justify-between border-t px-4 py-4"
          >
            <div class="text-sm text-muted-foreground">
              Showing <strong>{{ sortedContactLinks.length }}</strong> link{{ sortedContactLinks.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
