<!--
  @pattern Builder + Chain of Responsibility + Decorator Patterns
  @purpose About section creation/editing form with validation and API integration

  Patterns Applied:
  - Builder Pattern: Progressive form data construction
  - Chain of Responsibility: Validation pipeline
  - Decorator Pattern: Loading/error state management (via useAboutSections composable)
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2, CheckCircle2, AlertCircle, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-vue-next'
import type { AboutSection, CreateAboutSectionDto, UpdateAboutSectionDto } from '@/types/about-section'

/**
 * Component Props
 */
interface Props {
  open: boolean
  editSection?: AboutSection | null
}

/**
 * Component Emits
 */
interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  editSection: null,
})
const emit = defineEmits<Emits>()

/**
 * Pattern: Facade Pattern - Centralized about section management
 */
const {
  createSectionWithImage,
  updateSection,
  updateSectionImage,
  loading,
  error,
  clearError,
} = useAboutSections()

/**
 * Computed: Determine if this is edit mode
 */
const isEditMode = computed(() => !!props.editSection)

/**
 * Form state (Builder Pattern)
 */
const formData = ref({
  title: '',
  paragraphs: [''] as string[],
  imageAlt: '',
  sortOrder: 0,
  isPublished: false,
})

/**
 * Image file state
 */
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

/**
 * Image validation constants
 */
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
    validationErrors.value.title = 'Title is required'
    isValid = false
  } else if (formData.value.title.length > 255) {
    validationErrors.value.title = 'Title must be less than 255 characters'
    isValid = false
  }

  // Paragraphs: at least one non-empty paragraph
  const nonEmptyParagraphs = formData.value.paragraphs.filter((p) => p.trim().length > 0)
  if (nonEmptyParagraphs.length === 0) {
    validationErrors.value.paragraphs = 'At least one paragraph is required'
    isValid = false
  }

  // Image: required for create, optional for edit
  if (!isEditMode.value && !imageFile.value) {
    validationErrors.value.image = 'An image is required'
    isValid = false
  }

  // Image alt text: required
  if (!formData.value.imageAlt.trim()) {
    validationErrors.value.imageAlt = 'Image alt text is required'
    isValid = false
  } else if (formData.value.imageAlt.length > 255) {
    validationErrors.value.imageAlt = 'Image alt text must be less than 255 characters'
    isValid = false
  }

  // Sort order: must be >= 0
  if (formData.value.sortOrder < 0) {
    validationErrors.value.sortOrder = 'Sort order must be 0 or greater'
    isValid = false
  }

  return isValid
}

/**
 * Validate a single file (Chain of Responsibility Pattern)
 */
const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Allowed: JPEG, PNG, WebP'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size exceeds 5MB limit'
  }
  return null
}

/**
 * Handle file input change
 */
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

  // Generate preview
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      imagePreview.value = e.target.result as string
    }
  }
  reader.readAsDataURL(file)

  input.value = ''
}

/**
 * Remove selected image
 */
const removeImage = () => {
  imageFile.value = null
  imagePreview.value = null
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
 * Add a new paragraph
 */
const addParagraph = () => {
  formData.value.paragraphs.push('')
}

/**
 * Remove a paragraph by index
 */
const removeParagraph = (index: number) => {
  if (formData.value.paragraphs.length > 1) {
    formData.value.paragraphs.splice(index, 1)
  }
}

/**
 * Get current image URL for edit mode
 */
const currentImageUrl = computed(() => {
  if (imagePreview.value) return imagePreview.value
  if (props.editSection?.image) return props.editSection.image
  return null
})

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  clearError()
  validationErrors.value = {}

  if (!validateForm()) {
    return
  }

  // Filter out empty paragraphs
  const cleanParagraphs = formData.value.paragraphs.filter((p) => p.trim().length > 0)

  if (isEditMode.value && props.editSection) {
    // Edit mode: update text fields, optionally update image
    const dto: UpdateAboutSectionDto = {
      title: formData.value.title,
      paragraphs: cleanParagraphs,
      imageAlt: formData.value.imageAlt,
      sortOrder: formData.value.sortOrder,
      isPublished: formData.value.isPublished,
    }

    const result = await updateSection(props.editSection.id, dto)
    if (!result) return

    // Also update the image if a new one was selected
    if (imageFile.value) {
      const imageResult = await updateSectionImage(props.editSection.id, imageFile.value)
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
    // Create mode
    if (!imageFile.value) return

    const dto: CreateAboutSectionDto = {
      title: formData.value.title,
      paragraphs: cleanParagraphs,
      imageAlt: formData.value.imageAlt,
      sortOrder: formData.value.sortOrder,
      isPublished: formData.value.isPublished,
    }

    const result = await createSectionWithImage(dto, imageFile.value)

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
    paragraphs: [''],
    imageAlt: '',
    sortOrder: 0,
    isPublished: false,
  }
  imageFile.value = null
  imagePreview.value = null
  validationErrors.value = {}
  clearError()
  showSuccess.value = false
}

/**
 * Populate form from edit section data
 */
const populateFromEditSection = () => {
  if (props.editSection) {
    formData.value = {
      title: props.editSection.title,
      paragraphs: props.editSection.paragraphs.length > 0
        ? [...props.editSection.paragraphs]
        : [''],
      imageAlt: props.editSection.imageAlt,
      sortOrder: props.editSection.sortOrder,
      isPublished: props.editSection.isPublished,
    }
    imageFile.value = null
    imagePreview.value = null
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
      if (props.editSection) {
        populateFromEditSection()
      } else {
        resetForm()
      }
    }
  },
)
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b px-6 py-4">
      <h2 class="text-lg font-semibold">
        {{ isEditMode ? 'Edit Section' : 'Add New Section' }}
      </h2>
      <p class="text-muted-foreground text-sm">
        {{ isEditMode ? 'Update the about section details' : 'Create a new about section for the About page' }}
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
          {{ isEditMode ? 'Section updated successfully!' : 'Section created successfully!' }}
        </p>
        <p class="text-sm">Redirecting...</p>
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
          {{ isEditMode ? 'Error updating section' : 'Error creating section' }}
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
          <Label for="title">Title *</Label>
          <Input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="e.g., Our Story"
            maxlength="255"
            :aria-invalid="!!validationErrors.title"
            :disabled="loading"
          />
          <p v-if="validationErrors.title" class="text-sm text-red-600">
            {{ validationErrors.title }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ formData.title.length }} / 255 characters
          </p>
        </div>

        <!-- Paragraphs (dynamic list) -->
        <div class="space-y-3">
          <Label>Paragraphs *</Label>
          <div
            v-for="(paragraph, index) in formData.paragraphs"
            :key="index"
            class="flex gap-2"
          >
            <Textarea
              v-model="formData.paragraphs[index]"
              :placeholder="`Paragraph ${index + 1}...`"
              rows="3"
              class="flex-1"
              :disabled="loading"
            />
            <Button
              v-if="formData.paragraphs.length > 1"
              type="button"
              variant="ghost"
              size="sm"
              @click="removeParagraph(index)"
              :disabled="loading"
              class="mt-1 flex-shrink-0 text-red-600 hover:text-red-700"
              :aria-label="`Remove paragraph ${index + 1}`"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="addParagraph"
            :disabled="loading"
            class="w-full justify-center gap-2"
          >
            <Plus class="h-4 w-4" />
            Add Paragraph
          </Button>
          <p v-if="validationErrors.paragraphs" class="text-sm text-red-600">
            {{ validationErrors.paragraphs }}
          </p>
        </div>

        <!-- Image Upload -->
        <div class="space-y-3">
          <Label for="image">Image {{ isEditMode ? '' : '*' }}</Label>

          <!-- File Input (hidden) -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            class="hidden"
            @change="handleFileChange"
            :disabled="loading"
          />

          <!-- Upload Button -->
          <div class="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              @click="triggerFileInput"
              :disabled="loading"
              class="w-full justify-center gap-2"
            >
              <Upload class="h-4 w-4" />
              {{ imageFile ? 'Replace Image' : (isEditMode ? 'Change Image' : 'Upload Image') }}
            </Button>
            <p class="text-muted-foreground text-xs">
              Formats: JPEG, PNG, WebP. Max size: 5MB.
            </p>
          </div>

          <!-- Validation Error -->
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
              :alt="formData.imageAlt || 'Section image preview'"
              class="h-48 w-full object-cover"
            />

            <!-- Image Info Overlay -->
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
              <p class="text-xs font-medium">Current image</p>
            </div>

            <!-- Remove Button (only for newly selected files) -->
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

          <!-- Empty State (no image) -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900"
          >
            <ImageIcon class="h-12 w-12 text-gray-400" />
            <p class="text-muted-foreground text-sm font-medium">No image uploaded</p>
            <p class="text-muted-foreground text-xs text-center">
              Click the button above to upload a section image
            </p>
          </div>
        </div>

        <!-- Image Alt Text -->
        <div class="space-y-2">
          <Label for="imageAlt">Image Alt Text *</Label>
          <Input
            id="imageAlt"
            v-model="formData.imageAlt"
            type="text"
            placeholder="e.g., Artisan working in the studio"
            maxlength="255"
            :aria-invalid="!!validationErrors.imageAlt"
            :disabled="loading"
          />
          <p v-if="validationErrors.imageAlt" class="text-sm text-red-600">
            {{ validationErrors.imageAlt }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ formData.imageAlt.length }} / 255 characters
          </p>
        </div>

        <!-- Sort Order -->
        <div class="space-y-2">
          <Label for="sortOrder">Sort Order</Label>
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
            Lower numbers appear first on the About page.
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
            Published
          </Label>
          <span class="text-muted-foreground text-xs">
            (Only published sections appear on the frontend)
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
          Cancel
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="loading || showSuccess"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading
            ? (isEditMode ? 'Saving...' : 'Creating...')
            : (isEditMode ? 'Save Changes' : 'Create Section')
          }}
        </Button>
      </div>
    </div>
  </div>
</template>
