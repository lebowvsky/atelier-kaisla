<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2, CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from 'lucide-vue-next'
import type { PageContent, CreatePageContentDto, UpdatePageContentDto } from '@/types/page-content'

interface Props {
  open: boolean
  editContent?: PageContent | null
  defaultPage?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  editContent: null,
  defaultPage: '',
})
const emit = defineEmits<Emits>()

const {
  createContent,
  createContentWithImage,
  updateContent,
  updateContentImage,
  loading,
  error,
  clearError,
} = usePageContent()

const isEditMode = computed(() => !!props.editContent)

const formData = ref({
  page: '',
  section: '',
  title: '',
  content: '',
  imageAlt: '',
  metadata: '',
  sortOrder: 0,
  isPublished: false,
})

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const validationErrors = ref<Record<string, string>>({})
const showSuccess = ref(false)

const validateForm = (): boolean => {
  validationErrors.value = {}
  let isValid = true

  if (!formData.value.page.trim()) {
    validationErrors.value.page = 'La page est requise'
    isValid = false
  }

  if (!formData.value.section.trim()) {
    validationErrors.value.section = 'La section est requise'
    isValid = false
  }

  if (formData.value.title && formData.value.title.length > 255) {
    validationErrors.value.title = 'Le titre doit contenir moins de 255 caractères'
    isValid = false
  }

  if (formData.value.metadata.trim()) {
    try {
      JSON.parse(formData.value.metadata)
    } catch {
      validationErrors.value.metadata = 'Le JSON des métadonnées est invalide'
      isValid = false
    }
  }

  if (formData.value.sortOrder < 0) {
    validationErrors.value.sortOrder = "L'ordre d'affichage doit être 0 ou plus"
    isValid = false
  }

  return isValid
}

const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Type de fichier invalide. Formats acceptés : JPEG, PNG, WebP'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'La taille du fichier dépasse la limite de 5 Mo'
  }
  return null
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (!files || files.length === 0) return

  validationErrors.value.image = ''

  const file = files[0] as File
  const fileError = validateFile(file)
  if (fileError) {
    validationErrors.value.image = fileError
    input.value = ''
    return
  }

  imageFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      imagePreview.value = e.target.result as string
    }
  }
  reader.readAsDataURL(file)

  input.value = ''
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = null
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const currentImageUrl = computed(() => {
  if (imagePreview.value) return imagePreview.value
  if (props.editContent?.image) return props.editContent.image
  return null
})

const handleSubmit = async () => {
  clearError()
  validationErrors.value = {}

  if (!validateForm()) {
    return
  }

  const parsedMetadata = formData.value.metadata.trim()
    ? JSON.parse(formData.value.metadata)
    : undefined

  if (isEditMode.value && props.editContent) {
    const dto: UpdatePageContentDto = {
      page: formData.value.page,
      section: formData.value.section,
      title: formData.value.title || undefined,
      content: formData.value.content || undefined,
      imageAlt: formData.value.imageAlt || undefined,
      metadata: parsedMetadata,
      sortOrder: formData.value.sortOrder,
      isPublished: formData.value.isPublished,
    }

    const result = await updateContent(props.editContent.id, dto)
    if (!result) return

    if (imageFile.value) {
      const imageResult = await updateContentImage(props.editContent.id, imageFile.value)
      if (!imageResult) return
    }

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      resetForm()
      emit('success')
      emit('close')
    }, 1500)
  } else {
    const dto: CreatePageContentDto = {
      page: formData.value.page,
      section: formData.value.section,
      title: formData.value.title || undefined,
      content: formData.value.content || undefined,
      imageAlt: formData.value.imageAlt || undefined,
      metadata: parsedMetadata,
      sortOrder: formData.value.sortOrder,
      isPublished: formData.value.isPublished,
    }

    let result
    if (imageFile.value) {
      result = await createContentWithImage(dto, imageFile.value)
    } else {
      result = await createContent(dto)
    }

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

const resetForm = () => {
  formData.value = {
    page: props.defaultPage || '',
    section: '',
    title: '',
    content: '',
    imageAlt: '',
    metadata: '',
    sortOrder: 0,
    isPublished: false,
  }
  imageFile.value = null
  imagePreview.value = null
  validationErrors.value = {}
  clearError()
  showSuccess.value = false
}

const populateFromEditContent = () => {
  if (props.editContent) {
    formData.value = {
      page: props.editContent.page,
      section: props.editContent.section,
      title: props.editContent.title || '',
      content: props.editContent.content || '',
      imageAlt: props.editContent.imageAlt || '',
      metadata: props.editContent.metadata
        ? JSON.stringify(props.editContent.metadata, null, 2)
        : '',
      sortOrder: props.editContent.sortOrder,
      isPublished: props.editContent.isPublished,
    }
    imageFile.value = null
    imagePreview.value = null
  }
}

const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.editContent) {
        populateFromEditContent()
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
        {{ isEditMode ? 'Modifier le contenu' : 'Ajouter un contenu' }}
      </h2>
      <p class="text-muted-foreground text-sm">
        {{ isEditMode ? 'Modifier les détails du contenu de page' : 'Créer un nouveau contenu de page' }}
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
          {{ isEditMode ? 'Contenu mis à jour avec succès !' : 'Contenu créé avec succès !' }}
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
        <!-- Page -->
        <div class="space-y-2">
          <Label for="page">Page *</Label>
          <Input
            id="page"
            v-model="formData.page"
            type="text"
            placeholder="ex. home, wall-hanging, rugs"
            maxlength="100"
            :aria-invalid="!!validationErrors.page"
            :disabled="loading || !!defaultPage"
          />
          <p v-if="validationErrors.page" class="text-sm text-red-600">
            {{ validationErrors.page }}
          </p>
        </div>

        <!-- Section -->
        <div class="space-y-2">
          <Label for="section">Section *</Label>
          <Input
            id="section"
            v-model="formData.section"
            type="text"
            placeholder="ex. hero, intro, features"
            maxlength="100"
            :aria-invalid="!!validationErrors.section"
            :disabled="loading"
          />
          <p v-if="validationErrors.section" class="text-sm text-red-600">
            {{ validationErrors.section }}
          </p>
        </div>

        <!-- Title -->
        <div class="space-y-2">
          <Label for="title">Titre</Label>
          <Input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="ex. Bienvenue chez Atelier Kaisla"
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

        <!-- Content -->
        <div class="space-y-2">
          <Label for="content">Contenu</Label>
          <Textarea
            id="content"
            v-model="formData.content"
            placeholder="Texte du contenu de la section..."
            rows="4"
            :disabled="loading"
          />
        </div>

        <!-- Image Upload -->
        <div class="space-y-3">
          <Label for="image">Image</Label>

          <input
            ref="fileInputRef"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            class="hidden"
            @change="handleFileChange"
            :disabled="loading"
          />

          <div class="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              @click="triggerFileInput"
              :disabled="loading"
              class="w-full justify-center gap-2"
            >
              <Upload class="h-4 w-4" />
              {{ imageFile ? "Remplacer l'image" : (isEditMode ? "Changer l'image" : 'Téléverser une image') }}
            </Button>
            <p class="text-muted-foreground text-xs">
              Formats : JPEG, PNG, WebP. Taille max : 5 Mo.
            </p>
          </div>

          <p v-if="validationErrors.image" class="text-sm text-red-600">
            {{ validationErrors.image }}
          </p>

          <!-- Image Preview -->
          <div
            v-if="currentImageUrl"
            class="group relative overflow-hidden rounded-md border bg-gray-50 dark:bg-gray-900"
          >
            <img
              :src="currentImageUrl"
              :alt="formData.imageAlt || 'Image preview'"
              class="h-48 w-full object-cover"
            />

            <div
              v-if="imageFile"
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white"
            >
              <p class="truncate text-xs font-medium">
                {{ imageFile.name }}
              </p>
              <p class="text-xs opacity-90">
                {{ formatFileSize(imageFile.size) }}
              </p>
            </div>
            <div
              v-else-if="isEditMode"
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white"
            >
              <p class="text-xs font-medium">Image actuelle</p>
            </div>

            <button
              v-if="imageFile"
              type="button"
              @click="removeImage"
              :disabled="loading"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Remove selected image"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900"
          >
            <ImageIcon class="h-12 w-12 text-gray-400" />
            <p class="text-muted-foreground text-sm font-medium">Aucune image</p>
            <p class="text-muted-foreground text-xs text-center">
              L'image est optionnelle pour le contenu de page
            </p>
          </div>
        </div>

        <!-- Image Alt Text -->
        <div class="space-y-2">
          <Label for="imageAlt">Texte alternatif</Label>
          <Input
            id="imageAlt"
            v-model="formData.imageAlt"
            type="text"
            placeholder="ex. Illustration de la section hero"
            maxlength="255"
            :disabled="loading"
          />
        </div>

        <!-- Metadata -->
        <div class="space-y-2">
          <Label for="metadata">Métadonnées (JSON)</Label>
          <Textarea
            id="metadata"
            v-model="formData.metadata"
            placeholder='ex. {"buttonText": "Découvrir", "link": "/products"}'
            rows="3"
            :aria-invalid="!!validationErrors.metadata"
            :disabled="loading"
          />
          <p v-if="validationErrors.metadata" class="text-sm text-red-600">
            {{ validationErrors.metadata }}
          </p>
          <p class="text-muted-foreground text-xs">
            Données supplémentaires au format JSON (optionnel)
          </p>
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
            (Seul le contenu publié apparaît sur le site)
          </span>
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
            : (isEditMode ? 'Enregistrer' : 'Créer le contenu')
          }}
        </Button>
      </div>
    </div>
  </div>
</template>
