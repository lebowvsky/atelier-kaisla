<!--
  @pattern Facade + Strategy + Observer Patterns
  @purpose About sections management page with real API integration

  Patterns Applied:
  - Facade: useAboutSections composable simplifies complex API operations
  - Strategy: Sorting by sortOrder
  - Observer: Reactive state updates from API
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import AboutSectionForm from '@/components/about-sections/AboutSectionForm.vue'
import { Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-vue-next'
import type { AboutSection } from '@/types/about-section'

/**
 * SEO Configuration
 */
useSeoMeta({
  title: 'About Sections - Atelier Kaisla Backoffice',
  description: 'Manage about page sections for Atelier Kaisla e-commerce platform',
})

/**
 * Pattern: Facade Pattern - Centralized data management
 */
const {
  sections,
  loading,
  error,
  hasSections,
  hasError,
  fetchAllSections,
  deleteSection,
  clearError,
} = useAboutSections()

/**
 * Computed: Sorted sections by sortOrder
 */
const sortedSections = computed(() => {
  return [...sections.value].sort((a, b) => a.sortOrder - b.sortOrder)
})

/**
 * Computed: Statistics
 */
const totalSections = computed(() => sections.value.length)
const publishedSections = computed(
  () => sections.value.filter((s) => s.isPublished).length
)
const draftSections = computed(
  () => sections.value.filter((s) => !s.isPublished).length
)

/**
 * Load sections on mount (client-side only)
 */
onMounted(async () => {
  await fetchAllSections()
})

/**
 * Refresh sections list
 */
const refreshSections = async () => {
  await fetchAllSections()
}

/**
 * Handle section deletion
 */
const handleDelete = async (id: string, title: string) => {
  if (!confirm(`Are you sure you want to delete "${title}"? This will also delete its image.`)) {
    return
  }

  const success = await deleteSection(id)
  if (success) {
    console.log('Section deleted successfully')
  }
}

/**
 * Sheet state for section form
 */
const isFormOpen = ref(false)

/**
 * Edit section state
 */
const editingSection = ref<AboutSection | null>(null)

/**
 * Open form in create mode
 */
const openCreateForm = () => {
  editingSection.value = null
  isFormOpen.value = true
}

/**
 * Open form in edit mode
 */
const openEditForm = (section: AboutSection) => {
  editingSection.value = section
  isFormOpen.value = true
}

/**
 * Handle form success
 */
const handleFormSuccess = async () => {
  isFormOpen.value = false
  editingSection.value = null
  await refreshSections()
}

/**
 * Handle form close
 */
const handleFormClose = () => {
  isFormOpen.value = false
  editingSection.value = null
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

/**
 * Get section image URL or placeholder
 */
const getSectionImage = (image?: string): string => {
  if (image) return image
  return 'https://placehold.co/120x80/e2e8f0/64748b?text=No+Image'
}
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">About Sections</h2>
          <p class="text-muted-foreground">
            Manage the sections displayed on the About page
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="refreshSections"
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
                Add Section
              </Button>
            </SheetTrigger>
            <SheetContent class="w-full sm:max-w-2xl">
              <AboutSectionForm
                :open="isFormOpen"
                :edit-section="editingSection"
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
            Total Sections
          </div>
          <div class="text-2xl font-bold">{{ totalSections }}</div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Published
          </div>
          <div class="text-2xl font-bold text-green-600">
            {{ publishedSections }}
          </div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Draft
          </div>
          <div class="text-2xl font-bold text-yellow-600">
            {{ draftSections }}
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
            <h3 class="font-semibold">Error Loading Sections</h3>
            <p class="text-sm">{{ error.message }}</p>
          </div>
          <Button variant="ghost" size="sm" @click="clearError">
            Dismiss
          </Button>
        </div>
      </div>

      <!-- Sections Content -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <!-- Loading State -->
        <div
          v-if="loading && !hasSections"
          class="flex items-center justify-center p-12"
        >
          <div class="text-center">
            <RefreshCw class="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">
              Loading sections...
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!hasSections"
          class="flex flex-col items-center justify-center p-12"
        >
          <div class="text-center">
            <h3 class="text-lg font-semibold">No sections found</h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Get started by creating your first about section
            </p>
            <Button class="mt-4" @click="openCreateForm">
              <Plus class="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </div>

        <!-- Sections List (cards) -->
        <div v-else class="divide-y">
          <div
            v-for="section in sortedSections"
            :key="section.id"
            class="flex gap-4 p-4 transition-colors hover:bg-muted/50"
          >
            <!-- Image Thumbnail -->
            <div class="flex-shrink-0">
              <img
                :src="getSectionImage(section.image)"
                :alt="section.imageAlt || section.title"
                class="h-20 w-32 rounded-md object-cover border"
              />
            </div>

            <!-- Section Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2">
                <h4 class="font-semibold text-sm truncate">
                  {{ section.title }}
                </h4>
                <!-- Sort Order Badge -->
                <span
                  class="inline-flex flex-shrink-0 items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  #{{ section.sortOrder }}
                </span>
                <!-- Published/Draft Badge -->
                <span
                  class="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="section.isPublished
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'"
                >
                  <Eye v-if="section.isPublished" class="h-3 w-3" />
                  <EyeOff v-else class="h-3 w-3" />
                  {{ section.isPublished ? 'Published' : 'Draft' }}
                </span>
              </div>

              <!-- First paragraph (truncated) -->
              <p
                v-if="section.paragraphs && section.paragraphs.length > 0"
                class="mt-1 text-sm text-muted-foreground line-clamp-2"
              >
                {{ truncateText(section.paragraphs[0] ?? '', 150) }}
              </p>

              <!-- Meta info -->
              <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{{ section.paragraphs?.length || 0 }} paragraph{{ (section.paragraphs?.length || 0) !== 1 ? 's' : '' }}</span>
                <span>Created {{ formatDate(section.createdAt) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-shrink-0 items-start gap-1">
              <Button
                variant="ghost"
                size="sm"
                title="Edit section"
                @click="openEditForm(section)"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Delete section"
                @click="handleDelete(section.id, section.title)"
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
              Showing <strong>{{ sortedSections.length }}</strong> section{{ sortedSections.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
