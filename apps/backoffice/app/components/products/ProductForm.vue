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
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-vue-next'
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
const { createProduct, loading, error, clearError } = useProducts()

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
 * Image URLs state
 */
const imageUrls = ref<string>('')

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

  return isValid
}

/**
 * Process image URLs from textarea
 */
const processImageUrls = () => {
  if (!imageUrls.value.trim()) {
    formData.value.images = []
    return
  }

  // Split by newlines and filter empty strings
  const urls = imageUrls.value
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)

  formData.value.images = urls
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

  // Process image URLs
  processImageUrls()

  // Add dimensions if enabled
  if (dimensionsEnabled.value) {
    formData.value.dimensions = { ...dimensionsData.value }
  } else {
    formData.value.dimensions = undefined
  }

  // Create product via API
  const result = await createProduct(formData.value)

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
  imageUrls.value = ''
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

        <!-- Image URLs -->
        <div class="space-y-2">
          <Label for="images">Image URLs</Label>
          <Textarea
            id="images"
            v-model="imageUrls"
            placeholder="Enter image URLs, one per line&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            rows="4"
            :disabled="loading"
          />
          <p class="text-muted-foreground text-xs">
            Enter one URL per line. These images will be displayed in the product gallery.
          </p>
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
