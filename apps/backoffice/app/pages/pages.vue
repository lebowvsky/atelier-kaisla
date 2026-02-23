<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import PageContentForm from '@/components/page-content/PageContentForm.vue'
import { Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff, Home, Package, Info, FileText } from 'lucide-vue-next'
import type { PageContent } from '@/types/page-content'

useSeoMeta({
  title: 'Pages - Atelier Kaisla Backoffice',
  description: 'Gérer le contenu des pages du site Atelier Kaisla',
})

const {
  contents: _contents,
  loading,
  error,
  hasContents,
  hasError,
  fetchAll,
  getByPage,
  deleteContent,
  clearError,
} = usePageContent()

const tabs = [
  { key: 'home', label: 'Accueil', icon: Home },
  { key: 'wall-hanging', label: 'Wall Hanging', icon: Package },
  { key: 'rugs', label: 'Tapis', icon: Package },
  { key: 'about', label: 'A propos', icon: Info },
  { key: 'blog', label: 'Blog', icon: FileText },
]

const activeTab = ref('home')

const pageContents = computed(() => getByPage(activeTab.value))

const totalForPage = computed(() => pageContents.value.length)
const publishedForPage = computed(() => pageContents.value.filter((c) => c.isPublished).length)
const draftForPage = computed(() => pageContents.value.filter((c) => !c.isPublished).length)

onMounted(async () => {
  await fetchAll()
})

const refreshContents = async () => {
  await fetchAll()
}

const handleDelete = async (id: string, section: string) => {
  if (!confirm(`Supprimer la section "${section}" ? Cette action est irréversible.`)) {
    return
  }
  await deleteContent(id)
}

const isFormOpen = ref(false)
const editingContent = ref<PageContent | null>(null)

const openCreateForm = () => {
  editingContent.value = null
  isFormOpen.value = true
}

const openEditForm = (content: PageContent) => {
  editingContent.value = content
  isFormOpen.value = true
}

const handleFormSuccess = async () => {
  isFormOpen.value = false
  editingContent.value = null
  await refreshContents()
}

const handleFormClose = () => {
  isFormOpen.value = false
  editingContent.value = null
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getContentImage = (image?: string): string => {
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
          <h2 class="text-3xl font-bold tracking-tight">Pages</h2>
          <p class="text-muted-foreground">
            Gérez le contenu des pages du site
          </p>
        </div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="loading"
            @click="refreshContents"
          >
            <RefreshCw
              class="mr-2 h-4 w-4"
              :class="{ 'animate-spin': loading }"
            />
            Actualiser
          </Button>
          <Sheet v-model:open="isFormOpen">
            <SheetTrigger as-child>
              <Button @click="openCreateForm">
                <Plus class="mr-2 h-4 w-4" />
                Ajouter une section
              </Button>
            </SheetTrigger>
            <SheetContent class="w-full sm:max-w-2xl">
              <PageContentForm
                :open="isFormOpen"
                :edit-content="editingContent"
                :default-page="activeTab"
                @close="handleFormClose"
                @success="handleFormSuccess"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <!-- Error Alert -->
      <div
        v-if="hasError && error"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-semibold">Erreur de chargement</h3>
            <p class="text-sm">{{ error.message }}</p>
          </div>
          <Button variant="ghost" size="sm" @click="clearError">
            Fermer
          </Button>
        </div>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab" default-value="home">
        <TabsList class="w-full justify-start">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.key"
            :value="tab.key"
            class="gap-2"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent v-for="tab in tabs" :key="tab.key" :value="tab.key">
          <!-- Statistics Cards -->
          <div class="mt-4 grid gap-4 md:grid-cols-3">
            <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div class="text-sm font-medium text-muted-foreground">
                Total sections
              </div>
              <div class="text-2xl font-bold">{{ totalForPage }}</div>
            </div>
            <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div class="text-sm font-medium text-muted-foreground">
                Publiées
              </div>
              <div class="text-2xl font-bold text-green-600">
                {{ publishedForPage }}
              </div>
            </div>
            <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div class="text-sm font-medium text-muted-foreground">
                Brouillon
              </div>
              <div class="text-2xl font-bold text-yellow-600">
                {{ draftForPage }}
              </div>
            </div>
          </div>

          <!-- Content Card -->
          <div class="mt-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <!-- Loading State -->
            <div
              v-if="loading && !hasContents"
              class="flex items-center justify-center p-12"
            >
              <div class="text-center">
                <RefreshCw class="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p class="mt-2 text-sm text-muted-foreground">
                  Chargement du contenu...
                </p>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="pageContents.length === 0"
              class="flex flex-col items-center justify-center p-12"
            >
              <div class="text-center">
                <h3 class="text-lg font-semibold">Aucune section</h3>
                <p class="mt-1 text-sm text-muted-foreground">
                  Aucun contenu pour cette page. Commencez par ajouter une section.
                </p>
                <Button class="mt-4" @click="openCreateForm">
                  <Plus class="mr-2 h-4 w-4" />
                  Ajouter une section
                </Button>
              </div>
            </div>

            <!-- Content List -->
            <div v-else class="divide-y">
              <div
                v-for="item in pageContents"
                :key="item.id"
                class="flex gap-4 p-4 transition-colors hover:bg-muted/50"
              >
                <!-- Image Thumbnail -->
                <div class="flex-shrink-0">
                  <img
                    :src="getContentImage(item.image)"
                    :alt="item.imageAlt || item.section"
                    class="h-20 w-32 rounded-md object-cover border"
                  >
                </div>

                <!-- Content Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start gap-2">
                    <!-- Section Badge -->
                    <span
                      class="inline-flex flex-shrink-0 items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                    >
                      {{ item.section }}
                    </span>
                    <!-- Sort Order Badge -->
                    <span
                      class="inline-flex flex-shrink-0 items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    >
                      #{{ item.sortOrder }}
                    </span>
                    <!-- Published/Draft Badge -->
                    <span
                      class="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="item.isPublished
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'"
                    >
                      <Eye v-if="item.isPublished" class="h-3 w-3" />
                      <EyeOff v-else class="h-3 w-3" />
                      {{ item.isPublished ? 'Publié' : 'Brouillon' }}
                    </span>
                  </div>

                  <!-- Title -->
                  <h4 v-if="item.title" class="mt-1 font-semibold text-sm truncate">
                    {{ item.title }}
                  </h4>

                  <!-- Content (truncated) -->
                  <p
                    v-if="item.content"
                    class="mt-1 text-sm text-muted-foreground line-clamp-2"
                  >
                    {{ truncateText(item.content, 150) }}
                  </p>

                  <!-- Meta info -->
                  <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Créé le {{ formatDate(item.createdAt) }}</span>
                    <span v-if="item.metadata">
                      {{ Object.keys(item.metadata).length }} métadonnée{{ Object.keys(item.metadata).length !== 1 ? 's' : '' }}
                    </span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-shrink-0 items-start gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Modifier"
                    @click="openEditForm(item)"
                  >
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Supprimer"
                    @click="handleDelete(item.id, item.section)"
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
                  Affichage de <strong>{{ pageContents.length }}</strong> section{{ pageContents.length !== 1 ? 's' : '' }}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
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
