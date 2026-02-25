<!--
  @pattern Builder + Chain of Responsibility + Decorator + Mediator Patterns
  @purpose Blog article creation/editing form with validation, image gallery, and API integration

  Patterns Applied:
  - Builder Pattern: Progressive form data construction
  - Chain of Responsibility: Validation pipeline
  - Decorator Pattern: Loading/error state management (via useBlogArticles composable)
  - Mediator Pattern: Centralized form field management for create/edit modes
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2, CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from 'lucide-vue-next'
import type { BlogArticle, BlogArticleImage, BlogTag, CreateBlogArticleDto, UpdateBlogArticleDto } from '@/types/blog'

/**
 * Component Props
 */
interface Props {
  open: boolean
  editArticle?: BlogArticle | null
  availableTags: BlogTag[]
}

/**
 * Component Emits
 */
interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  editArticle: null,
})
const emit = defineEmits<Emits>()

/**
 * Pattern: Facade Pattern - Centralized blog article management
 */
const {
  createArticleWithImages,
  updateArticle,
  addImages,
  updateImage,
  removeImage: removeArticleImage,
  loading,
  error,
  clearError,
} = useBlogArticles()

/**
 * Computed: Determine if this is edit mode
 */
const isEditMode = computed(() => !!props.editArticle)

/**
 * Form state (Builder Pattern)
 */
const formData = ref({
  title: '',
  subtitle: '',
  content: '',
  publishedAt: '',
  isPublished: false,
  sortOrder: 0,
  selectedTagIds: [] as string[],
})

/**
 * Image files state (Strategy Pattern for file handling)
 */
const imageFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

/**
 * Cover index for new image uploads
 */
const coverIndex = ref<number>(0)

/**
 * Track existing images (edit mode)
 */
const existingImages = ref<BlogArticleImage[]>([])

/**
 * Track images to delete
 */
const imagesToDelete = ref<string[]>([])

/**
 * Track changed cover state for existing images
 */
const newCoverImageId = ref<string | null>(null)

/**
 * Track changed altText for existing images
 */
const changedAltTexts = ref<Map<string, string>>(new Map())

/**
 * Image validation constants
 */
const MAX_IMAGES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Validation errors (Chain of Responsibility Pattern)
 */
const validationErrors = ref<Record<string, string>>({})

/**
 * Success state
 */
const showSuccess = ref(false)

/**
 * Pattern: Chain of Responsibility - Validation pipeline
 */
const validateForm = (): boolean => {
  validationErrors.value = {}
  let isValid = true

  // Required field: title
  if (!formData.value.title.trim()) {
    validationErrors.value.title = 'Le titre est requis'
    isValid = false
  } else if (formData.value.title.length > 255) {
    validationErrors.value.title = 'Le titre doit contenir moins de 255 caractères'
    isValid = false
  }

  // Required field: content
  if (!formData.value.content.trim() || formData.value.content === '<p></p>') {
    validationErrors.value.content = 'Le contenu est requis'
    isValid = false
  }

  // Image validation - in create mode, at least one image required
  if (!isEditMode.value && imageFiles.value.length === 0) {
    validationErrors.value.images = 'Au moins une image est requise'
    isValid = false
  }

  // In edit mode, existing images count too
  if (isEditMode.value && imageFiles.value.length === 0 && existingImages.value.length === 0) {
    validationErrors.value.images = 'Au moins une image est requise'
    isValid = false
  }

  // Sort order: must be >= 0
  if (formData.value.sortOrder < 0) {
    validationErrors.value.sortOrder = "L'ordre d'affichage doit être 0 ou plus"
    isValid = false
  }

  return isValid
}

/**
 * Validate a single file (Chain of Responsibility Pattern)
 */
const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Type de fichier invalide. Formats acceptés : JPEG, PNG, WebP'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'La taille du fichier dépasse la limite de 5 Mo'
  }
  return null
}

/**
 * Handle file input change
 * Pattern: Decorator Pattern - Adds validation to file selection
 */
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (!files || files.length === 0) return

  // Clear previous errors
  validationErrors.value.images = ''

  // Convert FileList to Array
  const newFiles = Array.from(files)

  // Check total number of images (including existing images in edit mode)
  const totalImages = imageFiles.value.length + existingImages.value.length + newFiles.length
  if (totalImages > MAX_IMAGES) {
    validationErrors.value.images = `Maximum ${MAX_IMAGES} images autorisées. Vous en avez sélectionné ${totalImages}.`
    input.value = ''
    return
  }

  // Validate each file
  const validFiles: File[] = []
  for (const file of newFiles) {
    const fileError = validateFile(file)
    if (fileError) {
      validationErrors.value.images = `${file.name}: ${fileError}`
      input.value = ''
      return
    }
    validFiles.push(file)
  }

  // Add valid files to state
  imageFiles.value.push(...validFiles)

  // Generate previews for new files
  validFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })

  // Reset input to allow selecting the same file again
  input.value = ''
}

/**
 * Remove an image from the selection
 */
const removeNewImage = (index: number) => {
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)

  // Adjust cover index if needed
  if (coverIndex.value >= imageFiles.value.length && imageFiles.value.length > 0) {
    coverIndex.value = 0
  }

  // Clear validation error if images exist
  if (imageFiles.value.length > 0 || existingImages.value.length > 0) {
    validationErrors.value.images = ''
  }
}

/**
 * Mark an existing image for deletion (edit mode)
 */
const markImageForDeletion = (imageId: string) => {
  existingImages.value = existingImages.value.filter(img => img.id !== imageId)
  imagesToDelete.value.push(imageId)

  // If we removed the cover, reset the cover
  if (newCoverImageId.value === imageId) {
    newCoverImageId.value = null
  }
}

/**
 * Set cover image for new uploads
 */
const setCoverForNew = (index: number) => {
  coverIndex.value = index
  // Also clear existing cover if setting new image as cover
  newCoverImageId.value = null
}

/**
 * Set cover image for existing image
 */
const setCoverForExisting = (imageId: string) => {
  newCoverImageId.value = imageId
  // Reset new image cover index (no new image is cover)
  coverIndex.value = -1
}

/**
 * Get the effective altText value for an existing image
 */
const getExistingImageAltText = (img: BlogArticleImage): string => {
  if (changedAltTexts.value.has(img.id)) {
    return changedAltTexts.value.get(img.id)!
  }
  return img.altText || ''
}

/**
 * Update altText for an existing image
 */
const updateExistingAltText = (imageId: string, value: string) => {
  changedAltTexts.value.set(imageId, value)
}

/**
 * Is this existing image the cover?
 */
const isExistingImageCover = (img: BlogArticleImage): boolean => {
  if (newCoverImageId.value !== null) {
    return newCoverImageId.value === img.id
  }
  return img.isCover
}

/**
 * Toggle tag selection
 */
const toggleTag = (tagId: string) => {
  const index = formData.value.selectedTagIds.indexOf(tagId)
  if (index === -1) {
    formData.value.selectedTagIds.push(tagId)
  } else {
    formData.value.selectedTagIds.splice(index, 1)
  }
}

/**
 * Trigger file input click
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format datetime-local value from ISO string
 */
const formatDateTimeLocal = (isoString: string | null): string => {
  if (!isoString) return ''
  const date = new Date(isoString)
  // Format as YYYY-MM-DDTHH:mm
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  clearError()
  validationErrors.value = {}

  if (!validateForm()) {
    return
  }

  if (isEditMode.value && props.editArticle) {
    // === EDIT MODE ===

    // 1. Update article fields
    const articleDto: UpdateBlogArticleDto = {
      title: formData.value.title,
      subtitle: formData.value.subtitle || undefined,
      content: formData.value.content,
      publishedAt: formData.value.publishedAt || undefined,
      isPublished: formData.value.isPublished,
      sortOrder: formData.value.sortOrder,
      tagIds: formData.value.selectedTagIds,
    }

    const updated = await updateArticle(props.editArticle.id, articleDto)
    if (!updated) return

    // 2. Delete removed images
    for (const imageId of imagesToDelete.value) {
      await removeArticleImage(props.editArticle.id, imageId)
    }

    // 3. Update changed altTexts and cover for existing images
    for (const img of existingImages.value) {
      const hasAltTextChange = changedAltTexts.value.has(img.id)
      const hasCoverChange = newCoverImageId.value !== null && (isExistingImageCover(img) !== img.isCover)

      if (hasAltTextChange || hasCoverChange) {
        const updateData: { altText?: string; isCover?: boolean } = {}
        if (hasAltTextChange) {
          updateData.altText = changedAltTexts.value.get(img.id)
        }
        if (hasCoverChange) {
          updateData.isCover = isExistingImageCover(img)
        }
        await updateImage(props.editArticle.id, img.id, updateData)
      }
    }

    // 4. Upload new images
    if (imageFiles.value.length > 0) {
      await addImages(props.editArticle.id, imageFiles.value)
    }

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      resetForm()
      emit('success')
      emit('close')
    }, 1500)
  } else {
    // === CREATE MODE ===

    const articleDto: CreateBlogArticleDto = {
      title: formData.value.title,
      subtitle: formData.value.subtitle || undefined,
      content: formData.value.content,
      publishedAt: formData.value.publishedAt || undefined,
      isPublished: formData.value.isPublished,
      sortOrder: formData.value.sortOrder,
      tagIds: formData.value.selectedTagIds.length > 0 ? formData.value.selectedTagIds : undefined,
    }

    const result = await createArticleWithImages(
      articleDto,
      imageFiles.value,
      coverIndex.value >= 0 ? coverIndex.value : 0
    )

    if (result) {
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
        resetForm()
        emit('success')
        emit('close')
      }, 1500)
    }
  }
}

/**
 * Reset form to initial state
 */
const resetForm = () => {
  formData.value = {
    title: '',
    subtitle: '',
    content: '',
    publishedAt: '',
    isPublished: false,
    sortOrder: 0,
    selectedTagIds: [],
  }

  // Clear image files and previews
  imageFiles.value = []
  imagePreviews.value = []
  coverIndex.value = 0

  // Clear edit mode state
  existingImages.value = []
  imagesToDelete.value = []
  newCoverImageId.value = null
  changedAltTexts.value = new Map()

  validationErrors.value = {}
  clearError()
  showSuccess.value = false
}

/**
 * Populate form from edit article data
 */
const populateFromEditArticle = () => {
  if (props.editArticle) {
    formData.value = {
      title: props.editArticle.title,
      subtitle: props.editArticle.subtitle || '',
      content: props.editArticle.content,
      publishedAt: formatDateTimeLocal(props.editArticle.publishedAt),
      isPublished: props.editArticle.isPublished,
      sortOrder: props.editArticle.sortOrder,
      selectedTagIds: props.editArticle.tags.map((t) => t.id),
    }
    existingImages.value = [...(props.editArticle.images || [])]
    imagesToDelete.value = []
    newCoverImageId.value = null
    changedAltTexts.value = new Map()
    imageFiles.value = []
    imagePreviews.value = []
    coverIndex.value = -1
  }
}

/**
 * Handle close
 */
const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

/**
 * Watch open prop to reset/populate form when sheet opens
 */
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.editArticle) {
        populateFromEditArticle()
      } else {
        resetForm()
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b px-6 py-4">
      <h2 class="text-lg font-semibold">
        {{ isEditMode ? "Modifier l'article" : 'Ajouter un article' }}
      </h2>
      <p class="text-muted-foreground text-sm">
        {{ isEditMode ? "Modifier les détails de l'article" : 'Créer un nouvel article de blog' }}
      </p>
    </div>

    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="mx-6 mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
    >
      <CheckCircle2 class="h-5 w-5 flex-shrink-0" />
      <div>
        <p class="font-semibold">
          {{ isEditMode ? 'Article mis à jour avec succès !' : 'Article créé avec succès !' }}
        </p>
        <p class="text-sm">Redirection...</p>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="mx-6 mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
    >
      <AlertCircle class="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div class="flex-1">
        <p class="font-semibold">
          {{ isEditMode ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création' }}
        </p>
        <p class="text-sm">{{ error.message }}</p>
      </div>
      <button
        @click="clearError"
        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Form Content -->
    <div class="flex-1 overflow-y-auto px-6 py-4">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div class="space-y-2">
          <Label for="title">Titre *</Label>
          <Input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="ex. Les secrets du tissage artisanal"
            maxlength="255"
            :aria-invalid="!!validationErrors.title"
            :disabled="loading"
          />
          <p v-if="validationErrors.title" class="text-sm text-red-600">
            {{ validationErrors.title }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ formData.title.length }} / 255 caractères
          </p>
        </div>

        <!-- Subtitle -->
        <div class="space-y-2">
          <Label for="subtitle">Sous-titre</Label>
          <Input
            id="subtitle"
            v-model="formData.subtitle"
            type="text"
            placeholder="ex. Découvrez les techniques ancestrales"
            maxlength="255"
            :disabled="loading"
          />
          <p class="text-muted-foreground text-xs">
            {{ formData.subtitle.length }} / 255 caractères
          </p>
        </div>

        <!-- Content (Rich Text Editor) -->
        <div class="space-y-2">
          <Label for="content">Contenu *</Label>
          <ClientOnly>
            <RichTextEditor
              v-model="formData.content"
              placeholder="Rédigez le contenu de votre article..."
              :disabled="loading"
            />
            <template #fallback>
              <Textarea
                id="content"
                v-model="formData.content"
                placeholder="Rédigez le contenu de votre article..."
                rows="8"
                :disabled="loading"
              />
            </template>
          </ClientOnly>
          <p v-if="validationErrors.content" class="text-sm text-red-600">
            {{ validationErrors.content }}
          </p>
        </div>

        <!-- Published Date -->
        <div class="space-y-2">
          <Label for="publishedAt">Date de publication</Label>
          <Input
            id="publishedAt"
            v-model="formData.publishedAt"
            type="datetime-local"
            :disabled="loading"
          />
          <p class="text-muted-foreground text-xs">
            Laissez vide pour définir automatiquement lors de la publication.
          </p>
        </div>

        <!-- Tags Selection -->
        <div class="space-y-2">
          <Label>Tags</Label>
          <div v-if="availableTags.length === 0" class="text-sm text-muted-foreground">
            Aucun tag disponible. Créez des tags depuis le gestionnaire de tags.
          </div>
          <div v-else class="flex flex-wrap gap-2 rounded-md border p-3">
            <label
              v-for="tag in availableTags"
              :key="tag.id"
              class="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors"
              :class="formData.selectedTagIds.includes(tag.id)
                ? 'border-primary bg-primary/10 text-primary font-medium'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'"
            >
              <input
                type="checkbox"
                :checked="formData.selectedTagIds.includes(tag.id)"
                class="sr-only"
                :disabled="loading"
                @change="toggleTag(tag.id)"
              />
              {{ tag.name }}
            </label>
          </div>
        </div>

        <!-- Published Toggle -->
        <div class="flex items-center gap-2">
          <input
            id="isPublished"
            v-model="formData.isPublished"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            :disabled="loading"
          />
          <Label for="isPublished" class="cursor-pointer">
            Publié
          </Label>
          <span class="text-muted-foreground text-xs">
            (Seuls les articles publiés apparaissent sur le site)
          </span>
        </div>

        <!-- Sort Order -->
        <div class="space-y-2">
          <Label for="sortOrder">Ordre d'affichage</Label>
          <Input
            id="sortOrder"
            v-model.number="formData.sortOrder"
            type="number"
            min="0"
            placeholder="0"
            :aria-invalid="!!validationErrors.sortOrder"
            :disabled="loading"
          />
          <p v-if="validationErrors.sortOrder" class="text-sm text-red-600">
            {{ validationErrors.sortOrder }}
          </p>
          <p class="text-muted-foreground text-xs">
            Les nombres les plus bas apparaissent en premier.
          </p>
        </div>

        <!-- Existing Images (Edit Mode) -->
        <div v-if="isEditMode && existingImages.length > 0" class="space-y-2">
          <Label>Images actuelles</Label>
          <div class="grid grid-cols-2 gap-3 rounded-md border p-3">
            <div
              v-for="img in existingImages"
              :key="img.id"
              class="group relative overflow-hidden rounded-md border bg-gray-50 dark:bg-gray-900"
            >
              <img
                :src="img.url"
                :alt="getExistingImageAltText(img) || 'Image article'"
                class="aspect-square h-full w-full object-cover"
              />

              <!-- Cover Badge -->
              <div
                v-if="isExistingImageCover(img)"
                class="absolute left-1 top-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white"
              >
                Couverture
              </div>

              <!-- Remove Button -->
              <button
                type="button"
                @click="markImageForDeletion(img.id)"
                :disabled="loading"
                class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Supprimer l'image"
              >
                <X class="h-4 w-4" />
              </button>

              <!-- Bottom overlay: alt text + cover toggle -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <input
                  type="text"
                  :value="getExistingImageAltText(img)"
                  placeholder="Texte alt..."
                  class="mb-1 w-full rounded bg-black/30 px-1.5 py-0.5 text-xs text-white placeholder-white/60 outline-none"
                  :disabled="loading"
                  @input="updateExistingAltText(img.id, ($event.target as HTMLInputElement).value)"
                />
                <label class="flex items-center gap-1 text-xs text-white cursor-pointer">
                  <input
                    type="radio"
                    name="coverImage"
                    :checked="isExistingImageCover(img)"
                    class="h-3 w-3"
                    :disabled="loading"
                    @change="setCoverForExisting(img.id)"
                  />
                  Couverture
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Upload -->
        <div class="space-y-3">
          <Label for="images" :required="!isEditMode || existingImages.length === 0">
            {{ isEditMode ? 'Ajouter de nouvelles images' : 'Images de l\'article *' }}
          </Label>

          <!-- File Input (hidden) -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            class="hidden"
            @change="handleFileChange"
            :disabled="loading || (imageFiles.length + existingImages.length) >= MAX_IMAGES"
          />

          <!-- Upload Button -->
          <div class="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              @click="triggerFileInput"
              :disabled="loading || (imageFiles.length + existingImages.length) >= MAX_IMAGES"
              class="w-full justify-center gap-2"
            >
              <Upload class="h-4 w-4" />
              {{
                imageFiles.length === 0
                  ? 'Téléverser des images'
                  : `Ajouter des images (${imageFiles.length + existingImages.length}/${MAX_IMAGES})`
              }}
            </Button>
            <p class="text-muted-foreground text-xs">
              Téléversez jusqu'à {{ MAX_IMAGES }} images. Formats : JPEG, PNG, WebP. Taille max : 5 Mo par image.
            </p>
          </div>

          <!-- Validation Error -->
          <p v-if="validationErrors.images" class="text-sm text-red-600">
            {{ validationErrors.images }}
          </p>

          <!-- Image Previews Grid (new uploads) -->
          <div
            v-if="imagePreviews.length > 0"
            class="grid grid-cols-2 gap-3 rounded-md border p-3"
          >
            <div
              v-for="(preview, index) in imagePreviews"
              :key="index"
              class="group relative overflow-hidden rounded-md border bg-gray-50 dark:bg-gray-900"
            >
              <!-- Image Preview -->
              <img
                :src="preview"
                :alt="`Aperçu ${index + 1}`"
                class="aspect-square h-full w-full object-cover"
              />

              <!-- Cover Badge -->
              <div
                v-if="coverIndex === index && (existingImages.length === 0 || newCoverImageId === null)"
                class="absolute left-1 top-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white"
              >
                Couverture
              </div>

              <!-- Image Info Overlay -->
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white"
              >
                <p class="truncate text-xs font-medium">
                  {{ imageFiles[index]?.name }}
                </p>
                <div class="flex items-center justify-between">
                  <p class="text-xs opacity-90">
                    {{ formatFileSize(imageFiles[index]?.size || 0) }}
                  </p>
                  <label class="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="coverImage"
                      :checked="coverIndex === index && newCoverImageId === null"
                      class="h-3 w-3"
                      :disabled="loading"
                      @change="setCoverForNew(index)"
                    />
                    Couverture
                  </label>
                </div>
              </div>

              <!-- Remove Button -->
              <button
                type="button"
                @click="removeNewImage(index)"
                :disabled="loading"
                class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                :aria-label="`Supprimer l'image ${index + 1}`"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- Empty Slots (show how many more can be added) -->
            <div
              v-for="n in Math.max(0, MAX_IMAGES - imagePreviews.length - existingImages.length)"
              :key="`empty-${n}`"
              class="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
            >
              <ImageIcon class="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <!-- Empty State (no images uploaded and no existing images) -->
          <div
            v-else-if="existingImages.length === 0"
            class="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900"
          >
            <ImageIcon class="h-12 w-12 text-gray-400" />
            <p class="text-muted-foreground text-sm font-medium">Aucune image téléversée</p>
            <p class="text-muted-foreground text-xs text-center">
              Cliquez sur le bouton ci-dessus pour téléverser des images
            </p>
          </div>
        </div>
      </form>
    </div>

    <!-- Footer Actions -->
    <div class="border-t px-6 py-4">
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          @click="handleClose"
          :disabled="loading"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="loading || showSuccess"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading
            ? (isEditMode ? 'Enregistrement...' : 'Création...')
            : (isEditMode ? 'Enregistrer' : "Créer l'article")
          }}
        </Button>
      </div>
    </div>
  </div>
</template>
