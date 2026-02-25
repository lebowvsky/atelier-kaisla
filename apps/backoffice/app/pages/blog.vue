<!--
  @pattern Facade + Strategy + Observer Patterns
  @purpose Blog articles and tags management page with real API integration

  Patterns Applied:
  - Facade: useBlogArticles and useBlogTags composables simplify complex API operations
  - Strategy: Sorting by sortOrder
  - Observer: Reactive state updates from API
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import BlogArticleForm from '@/components/blog/BlogArticleForm.vue'
import BlogTagManager from '@/components/blog/BlogTagManager.vue'
import { Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff, BookOpen, Tag, Image as ImageIcon } from 'lucide-vue-next'
import type { BlogArticle } from '@/types/blog'

/**
 * SEO Configuration
 */
useSeoMeta({
  title: 'Blog - Atelier Kaisla Backoffice',
  description: 'Gérer les articles et tags du blog pour Atelier Kaisla',
})

/**
 * Pattern: Facade Pattern - Centralized data management
 */
const {
  articles,
  loading: articlesLoading,
  error: articlesError,
  hasArticles,
  hasError: hasArticlesError,
  fetchAllArticles,
  deleteArticle,
  clearError: clearArticlesError,
} = useBlogArticles()

const {
  tags,
  loading: tagsLoading,
  hasError: hasTagsError,
  error: tagsError,
  fetchAllTags,
  createTag,
  updateTag,
  deleteTag,
  clearError: clearTagsError,
} = useBlogTags()

/**
 * Combined loading state
 */
const loading = computed(() => articlesLoading.value || tagsLoading.value)

/**
 * Computed: Sorted articles by sortOrder
 */
const sortedArticles = computed(() => {
  return [...articles.value].sort((a, b) => a.sortOrder - b.sortOrder)
})

/**
 * Computed: Statistics
 */
const totalArticles = computed(() => articles.value.length)
const publishedArticles = computed(
  () => articles.value.filter((a) => a.isPublished).length
)
const draftArticles = computed(
  () => articles.value.filter((a) => !a.isPublished).length
)

/**
 * Load data on mount (client-side only)
 */
onMounted(async () => {
  await Promise.all([fetchAllArticles(), fetchAllTags()])
})

/**
 * Refresh data
 */
const refreshData = async () => {
  await Promise.all([fetchAllArticles(), fetchAllTags()])
}

/**
 * Handle article deletion
 */
const handleDelete = async (id: string, title: string) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ? Les images associées seront aussi supprimées.`)) {
    return
  }

  const success = await deleteArticle(id)
  if (success) {
    console.log('Article deleted successfully')
  }
}

/**
 * Sheet state for article form
 */
const isFormOpen = ref(false)

/**
 * Edit article state
 */
const editingArticle = ref<BlogArticle | null>(null)

/**
 * Tag manager visibility
 */
const showTagManager = ref(false)

/**
 * Open form in create mode
 */
const openCreateForm = () => {
  editingArticle.value = null
  isFormOpen.value = true
}

/**
 * Open form in edit mode
 */
const openEditForm = (article: BlogArticle) => {
  editingArticle.value = article
  isFormOpen.value = true
}

/**
 * Handle form success
 */
const handleFormSuccess = async () => {
  isFormOpen.value = false
  editingArticle.value = null
  await refreshData()
}

/**
 * Handle form close
 */
const handleFormClose = () => {
  isFormOpen.value = false
  editingArticle.value = null
}

/**
 * Handle tag creation
 */
const handleCreateTag = async (name: string) => {
  await createTag({ name })
}

/**
 * Handle tag update
 */
const handleUpdateTag = async (id: string, name: string) => {
  await updateTag(id, { name })
}

/**
 * Handle tag deletion
 */
const handleDeleteTag = async (id: string) => {
  await deleteTag(id)
}

/**
 * Truncate text helper
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Strip HTML tags for display
 */
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

/**
 * Format date helper
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get article cover image URL or placeholder
 */
const getArticleCover = (article: BlogArticle): string => {
  const cover = article.images?.find((img) => img.isCover)
  if (cover) return cover.url
  if (article.images && article.images.length > 0) return article.images[0].url
  return 'https://placehold.co/120x80/e2e8f0/64748b?text=No+Image'
}
</script>

<template>
  <NuxtLayout name="default">
    <div class="space-y-6 py-6">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Blog</h2>
          <p class="text-muted-foreground">
            Gérez les articles et les tags du blog
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="refreshData"
          >
            <RefreshCw
              class="mr-2 h-4 w-4"
              :class="{ 'animate-spin': loading }"
            />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="showTagManager = !showTagManager"
          >
            <Tag class="mr-2 h-4 w-4" />
            Gérer les tags
          </Button>
          <Sheet v-model:open="isFormOpen">
            <SheetTrigger as-child>
              <Button @click="openCreateForm">
                <Plus class="mr-2 h-4 w-4" />
                Ajouter un article
              </Button>
            </SheetTrigger>
            <SheetContent class="w-full sm:max-w-2xl">
              <BlogArticleForm
                :open="isFormOpen"
                :edit-article="editingArticle"
                :available-tags="tags"
                @close="handleFormClose"
                @success="handleFormSuccess"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <!-- Tag Manager Panel -->
      <div
        v-if="showTagManager"
        class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
      >
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Gestion des tags</h3>
          <Button
            variant="ghost"
            size="sm"
            @click="showTagManager = false"
          >
            Fermer
          </Button>
        </div>

        <!-- Tag Error -->
        <div
          v-if="hasTagsError && tagsError"
          class="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          <div class="flex items-start justify-between">
            <p class="text-sm">{{ tagsError.message }}</p>
            <Button variant="ghost" size="sm" @click="clearTagsError">
              Fermer
            </Button>
          </div>
        </div>

        <BlogTagManager
          :tags="tags"
          :loading="tagsLoading"
          @create="handleCreateTag"
          @update="handleUpdateTag"
          @delete="handleDeleteTag"
        />
      </div>

      <!-- Statistics Cards -->
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Total articles
          </div>
          <div class="text-2xl font-bold">{{ totalArticles }}</div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Publiés
          </div>
          <div class="text-2xl font-bold text-green-600">
            {{ publishedArticles }}
          </div>
        </div>
        <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div class="text-sm font-medium text-muted-foreground">
            Brouillons
          </div>
          <div class="text-2xl font-bold text-yellow-600">
            {{ draftArticles }}
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="hasArticlesError && articlesError"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">Erreur de chargement des articles</h3>
            <p class="text-sm">{{ articlesError.message }}</p>
          </div>
          <Button variant="ghost" size="sm" @click="clearArticlesError">
            Fermer
          </Button>
        </div>
      </div>

      <!-- Articles Content -->
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <!-- Loading State -->
        <div
          v-if="articlesLoading && !hasArticles"
          class="flex items-center justify-center p-12"
        >
          <div class="text-center">
            <RefreshCw class="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p class="mt-2 text-sm text-muted-foreground">
              Chargement des articles...
            </p>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="!hasArticles"
          class="flex flex-col items-center justify-center p-12"
        >
          <div class="text-center">
            <BookOpen class="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 class="mt-2 text-lg font-semibold">Aucun article trouvé</h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Commencez par créer votre premier article de blog
            </p>
            <Button class="mt-4" @click="openCreateForm">
              <Plus class="mr-2 h-4 w-4" />
              Ajouter un article
            </Button>
          </div>
        </div>

        <!-- Articles List (cards) -->
        <div v-else class="divide-y">
          <div
            v-for="article in sortedArticles"
            :key="article.id"
            class="flex gap-4 p-4 transition-colors hover:bg-muted/50"
          >
            <!-- Cover Image Thumbnail -->
            <div class="flex-shrink-0">
              <img
                :src="getArticleCover(article)"
                :alt="article.title"
                class="h-20 w-32 rounded-md object-cover border"
              />
            </div>

            <!-- Article Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2 flex-wrap">
                <h4 class="font-semibold text-sm truncate">
                  {{ article.title }}
                </h4>
                <!-- Sort Order Badge -->
                <span
                  class="inline-flex flex-shrink-0 items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  #{{ article.sortOrder }}
                </span>
                <!-- Published/Draft Badge -->
                <span
                  class="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="article.isPublished
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'"
                >
                  <Eye v-if="article.isPublished" class="h-3 w-3" />
                  <EyeOff v-else class="h-3 w-3" />
                  {{ article.isPublished ? 'Publié' : 'Brouillon' }}
                </span>
              </div>

              <!-- Subtitle -->
              <p
                v-if="article.subtitle"
                class="mt-0.5 text-sm font-medium text-muted-foreground"
              >
                {{ article.subtitle }}
              </p>

              <!-- Content preview (stripped of HTML, truncated) -->
              <p class="mt-1 text-sm text-muted-foreground line-clamp-2">
                {{ truncateText(stripHtml(article.content), 150) }}
              </p>

              <!-- Tags -->
              <div v-if="article.tags && article.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
                <span
                  v-for="tag in article.tags"
                  :key="tag.id"
                  class="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                >
                  {{ tag.name }}
                </span>
              </div>

              <!-- Meta info -->
              <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <ImageIcon class="h-3 w-3" />
                  {{ article.images?.length || 0 }} image{{ (article.images?.length || 0) !== 1 ? 's' : '' }}
                </span>
                <span v-if="article.publishedAt">
                  Publié le {{ formatDate(article.publishedAt) }}
                </span>
                <span v-else>
                  Créé le {{ formatDate(article.createdAt) }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-shrink-0 items-start gap-1">
              <Button
                variant="ghost"
                size="sm"
                title="Modifier l'article"
                @click="openEditForm(article)"
              >
                <Pencil class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Supprimer l'article"
                @click="handleDelete(article.id, article.title)"
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
              Affichage de <strong>{{ sortedArticles.length }}</strong> article{{ sortedArticles.length !== 1 ? 's' : '' }}
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
