<!--
  @pattern Builder + Chain of Responsibility + Decorator Patterns
  @purpose Product creation form with comprehensive validation and API integration

  Patterns Applied:
  - Builder Pattern: Progressive form data construction
  - Chain of Responsibility: Validation pipeline
  - Decorator Pattern: Loading/error state management (via useProducts composable)
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { X, Loader2, CheckCircle2, AlertCircle, Upload, Image as ImageIcon } from 'lucide-vue-next'
import type { CreateProductDto, ProductDimensions } from '@/types/product'

/**
 * Component Props
 */
interface Props {
  open: boolean
}

/**
 * Component Emits
 */
interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * Pattern: Facade Pattern - Centralized product management
 */
const { createProductWithImages, loading, error, clearError } = useProducts()

/**
 * Form state (Builder Pattern)
 */
const formData = ref<CreateProductDto>({
  name: '',
  description: '',
  category: 'wall-hanging',
  price: 0,
  status: 'draft',
  stockQuantity: 0,
  images: [],
  materials: '',
  dimensions: undefined,
})

/**
 * Dimensions state
 */
const dimensionsEnabled = ref(false)
const dimensionsData = ref<ProductDimensions>({
  width: 0,
  height: 0,
  unit: 'cm',
})

/**
 * Image files state (Strategy Pattern for file handling)
 */
const imageFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

/**
 * Image validation constants
 */
const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

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

  // Required field: name
  if (!formData.value.name.trim()) {
    validationErrors.value.name = 'Product name is required'
    isValid = false
  } else if (formData.value.name.length > 255) {
    validationErrors.value.name = 'Product name must be less than 255 characters'
    isValid = false
  }

  // Optional field: description
  if (formData.value.description && formData.value.description.length > 500) {
    validationErrors.value.description = 'Description must be less than 500 characters'
    isValid = false
  }

  // Required field: price
  if (formData.value.price <= 0) {
    validationErrors.value.price = 'Price must be greater than 0'
    isValid = false
  }

  // Stock quantity validation
  if (formData.value.stockQuantity !== undefined && formData.value.stockQuantity < 0) {
    validationErrors.value.stockQuantity = 'Stock quantity cannot be negative'
    isValid = false
  }

  // Dimensions validation (if enabled)
  if (dimensionsEnabled.value) {
    if (dimensionsData.value.width <= 0) {
      validationErrors.value.dimensions = 'Width must be greater than 0'
      isValid = false
    }
    if (dimensionsData.value.height <= 0) {
      validationErrors.value.dimensions = 'Height must be greater than 0'
      isValid = false
    }
  }

  // Image validation
  if (imageFiles.value.length === 0) {
    validationErrors.value.images = 'At least one product image is required'
    isValid = false
  }

  return isValid
}

/**
 * Validate a single file (Chain of Responsibility Pattern)
 * Returns error message or null if valid
 */
const validateFile = (file: File): string | null => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed: JPEG, PNG, WebP`
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 5MB limit`
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

  // Check total number of images
  const totalImages = imageFiles.value.length + newFiles.length
  if (totalImages > MAX_IMAGES) {
    validationErrors.value.images = `Maximum ${MAX_IMAGES} images allowed. You've selected ${totalImages} images.`
    input.value = '' // Reset input
    return
  }

  // Validate each file
  const validFiles: File[] = []
  for (const file of newFiles) {
    const error = validateFile(file)
    if (error) {
      validationErrors.value.images = `${file.name}: ${error}`
      input.value = '' // Reset input
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
 * @param index - Index of the image to remove
 */
const removeImage = (index: number) => {
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)

  // Clear validation error if images exist
  if (imageFiles.value.length > 0) {
    validationErrors.value.images = ''
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
 * Handle form submission
 */
const handleSubmit = async () => {
  // Clear previous errors
  clearError()
  validationErrors.value = {}

  // Validate form
  if (!validateForm()) {
    return
  }

  // Prepare product DTO (without images field)
  const productDto: Omit<CreateProductDto, 'images'> = {
    name: formData.value.name,
    description: formData.value.description,
    category: formData.value.category,
    price: formData.value.price,
    status: formData.value.status,
    stockQuantity: formData.value.stockQuantity,
    materials: formData.value.materials,
  }

  // Add dimensions if enabled
  if (dimensionsEnabled.value) {
    productDto.dimensions = { ...dimensionsData.value }
  }

  // Create product with image uploads via API
  const result = await createProductWithImages(productDto, imageFiles.value)

  if (result) {
    // Show success message
    showSuccess.value = true

    // Emit success event after a short delay
    setTimeout(() => {
      showSuccess.value = false
      resetForm()
      emit('success')
      emit('close')
    }, 1500)
  }
}

/**
 * Reset form to initial state
 */
const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    category: 'wall-hanging',
    price: 0,
    status: 'draft',
    stockQuantity: 0,
    images: [],
    materials: '',
    dimensions: undefined,
  }
  dimensionsEnabled.value = false
  dimensionsData.value = {
    width: 0,
    height: 0,
    unit: 'cm',
  }

  // Clear image files and previews
  imageFiles.value = []
  imagePreviews.value = []

  validationErrors.value = {}
  clearError()
  showSuccess.value = false
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
 * Watch open prop to reset form when sheet opens
 */
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  },
)
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <div class="border-b px-6 py-4">
      <h2 class="text-lg font-semibold">Add New Product</h2>
      <p class="text-muted-foreground text-sm">
        Create a new product for your catalog
      </p>
    </div>

    <!-- Success Message -->
    <div
      v-if="showSuccess"
      class="mx-6 mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
    >
      <CheckCircle2 class="h-5 w-5 flex-shrink-0" />
      <div>
        <p class="font-semibold">Product created successfully!</p>
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
        <p class="font-semibold">Error creating product</p>
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
        <!-- Product Name -->
        <div class="space-y-2">
          <Label for="name" required>Product Name</Label>
          <Input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="e.g., Handwoven Wall Hanging"
            :aria-invalid="!!validationErrors.name"
            :disabled="loading"
          />
          <p v-if="validationErrors.name" class="text-sm text-red-600">
            {{ validationErrors.name }}
          </p>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Describe your product..."
            rows="4"
            :aria-invalid="!!validationErrors.description"
            :disabled="loading"
          />
          <p v-if="validationErrors.description" class="text-sm text-red-600">
            {{ validationErrors.description }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ formData.description?.length || 0 }} / 500 characters
          </p>
        </div>

        <!-- Category -->
        <div class="space-y-2">
          <Label for="category" required>Category</Label>
          <Select id="category" v-model="formData.category" :disabled="loading">
            <option value="wall-hanging">Wall Hanging</option>
            <option value="rug">Rug</option>
          </Select>
        </div>

        <!-- Price -->
        <div class="space-y-2">
          <Label for="price" required>Price (EUR)</Label>
          <Input
            id="price"
            v-model.number="formData.price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            :aria-invalid="!!validationErrors.price"
            :disabled="loading"
          />
          <p v-if="validationErrors.price" class="text-sm text-red-600">
            {{ validationErrors.price }}
          </p>
        </div>

        <!-- Status -->
        <div class="space-y-2">
          <Label for="status">Status</Label>
          <Select id="status" v-model="formData.status" :disabled="loading">
            <option value="draft">Draft</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </Select>
        </div>

        <!-- Stock Quantity -->
        <div class="space-y-2">
          <Label for="stockQuantity">Stock Quantity</Label>
          <Input
            id="stockQuantity"
            v-model.number="formData.stockQuantity"
            type="number"
            min="0"
            placeholder="0"
            :aria-invalid="!!validationErrors.stockQuantity"
            :disabled="loading"
          />
          <p v-if="validationErrors.stockQuantity" class="text-sm text-red-600">
            {{ validationErrors.stockQuantity }}
          </p>
        </div>

        <!-- Materials -->
        <div class="space-y-2">
          <Label for="materials">Materials</Label>
          <Input
            id="materials"
            v-model="formData.materials"
            type="text"
            placeholder="e.g., Cotton, wool, natural dyes"
            :disabled="loading"
          />
        </div>

        <!-- Dimensions Toggle -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <input
              id="dimensionsEnabled"
              v-model="dimensionsEnabled"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
              :disabled="loading"
            />
            <Label for="dimensionsEnabled" class="cursor-pointer">
              Add Dimensions
            </Label>
          </div>

          <!-- Dimensions Fields (conditionally shown) -->
          <div v-if="dimensionsEnabled" class="space-y-4 rounded-md border p-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="width">Width</Label>
                <Input
                  id="width"
                  v-model.number="dimensionsData.width"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  :disabled="loading"
                />
              </div>
              <div class="space-y-2">
                <Label for="height">Height</Label>
                <Input
                  id="height"
                  v-model.number="dimensionsData.height"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  :disabled="loading"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="unit">Unit</Label>
              <Select id="unit" v-model="dimensionsData.unit" :disabled="loading">
                <option value="cm">Centimeters (cm)</option>
                <option value="inch">Inches (inch)</option>
              </Select>
            </div>
            <p v-if="validationErrors.dimensions" class="text-sm text-red-600">
              {{ validationErrors.dimensions }}
            </p>
          </div>
        </div>

        <!-- Image Upload -->
        <div class="space-y-3">
          <Label for="images" required>Product Images</Label>

          <!-- File Input (hidden) -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            class="hidden"
            @change="handleFileChange"
            :disabled="loading || imageFiles.length >= MAX_IMAGES"
          />

          <!-- Upload Button -->
          <div class="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              @click="triggerFileInput"
              :disabled="loading || imageFiles.length >= MAX_IMAGES"
              class="w-full justify-center gap-2"
            >
              <Upload class="h-4 w-4" />
              {{
                imageFiles.length === 0
                  ? 'Upload Images'
                  : `Add More Images (${imageFiles.length}/${MAX_IMAGES})`
              }}
            </Button>

            <p class="text-muted-foreground text-xs">
              Upload up to {{ MAX_IMAGES }} images. Formats: JPEG, PNG, WebP. Max size: 5MB per image.
            </p>
          </div>

          <!-- Validation Error -->
          <p v-if="validationErrors.images" class="text-sm text-red-600">
            {{ validationErrors.images }}
          </p>

          <!-- Image Previews Grid -->
          <div
            v-if="imagePreviews.length > 0"
            class="grid grid-cols-2 gap-3 rounded-md border p-3"
          >
            <div
              v-for="(preview, index) in imagePreviews"
              :key="index"
              class="group relative aspect-square overflow-hidden rounded-md border bg-gray-50 dark:bg-gray-900"
            >
              <!-- Image Preview -->
              <img
                :src="preview"
                :alt="`Preview ${index + 1}`"
                class="h-full w-full object-cover"
              />

              <!-- Image Info Overlay -->
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white"
              >
                <p class="truncate text-xs font-medium">
                  {{ imageFiles[index]?.name }}
                </p>
                <p class="text-xs opacity-90">
                  {{ formatFileSize(imageFiles[index]?.size || 0) }}
                </p>
              </div>

              <!-- Remove Button -->
              <button
                type="button"
                @click="removeImage(index)"
                :disabled="loading"
                class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                :aria-label="`Remove image ${index + 1}`"
              >
                <X class="h-4 w-4" />
              </button>

              <!-- Primary Badge (for first image) -->
              <div
                v-if="index === 0"
                class="absolute left-1 top-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white"
              >
                Primary
              </div>
            </div>

            <!-- Empty Slots (show how many more can be added) -->
            <div
              v-for="n in Math.max(0, MAX_IMAGES - imagePreviews.length)"
              :key="`empty-${n}`"
              class="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
            >
              <ImageIcon class="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <!-- Empty State (no images uploaded) -->
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900"
          >
            <ImageIcon class="h-12 w-12 text-gray-400" />
            <p class="text-muted-foreground text-sm font-medium">No images uploaded</p>
            <p class="text-muted-foreground text-xs text-center">
              Click the button above to upload product images
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
          Cancel
        </Button>
        <Button
          type="submit"
          @click="handleSubmit"
          :disabled="loading || showSuccess"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ loading ? 'Creating...' : 'Create Product' }}
        </Button>
      </div>
    </div>
  </div>
</template>
