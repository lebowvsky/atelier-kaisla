<!--
  @pattern Builder + Chain of Responsibility + Decorator Patterns
  @purpose Contact link creation/editing form with validation and API integration

  Patterns Applied:
  - Builder Pattern: Progressive form data construction
  - Chain of Responsibility: Validation pipeline
  - Decorator Pattern: Loading/error state management (via useContactLinks composable)
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import type { ContactLink, ContactPlatform, CreateContactLinkDto, UpdateContactLinkDto, PlatformConfig } from '@/types/contact-link'

/**
 * Component Props
 */
interface Props {
  open: boolean
  editContactLink?: ContactLink | null
}

/**
 * Component Emits
 */
interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  editContactLink: null,
})
const emit = defineEmits<Emits>()

/**
 * Pattern: Facade Pattern - Centralized contact link management
 */
const {
  createContactLink,
  updateContactLink,
  loading,
  error,
  clearError,
} = useContactLinks()

/**
 * Platform options for the select dropdown
 */
const platformOptions: PlatformConfig[] = [
  { value: 'email', label: 'Email', placeholder: 'mailto:contact@example.com' },
  { value: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/page' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { value: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { value: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/username' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { value: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/username' },
  { value: 'website', label: 'Site web', placeholder: 'https://example.com' },
  { value: 'other', label: 'Autre', placeholder: 'https://...' },
]

/**
 * Computed: Determine if this is edit mode
 */
const isEditMode = computed(() => !!props.editContactLink)

/**
 * Form state (Builder Pattern)
 */
const formData = ref({
  platform: 'email' as ContactPlatform,
  url: '',
  label: '',
  sortOrder: 0,
  isActive: true,
})

/**
 * Validation errors (Chain of Responsibility Pattern)
 */
const validationErrors = ref<Record<string, string>>({})

/**
 * Success state
 */
const showSuccess = ref(false)

/**
 * Get the URL placeholder based on selected platform
 */
const urlPlaceholder = computed(() => {
  const config = platformOptions.find((p) => p.value === formData.value.platform)
  return config?.placeholder || 'https://...'
})

/**
 * Pattern: Chain of Responsibility - Validation pipeline
 */
const validateForm = (): boolean => {
  validationErrors.value = {}
  let isValid = true

  // Required field: platform
  if (!formData.value.platform) {
    validationErrors.value.platform = 'La plateforme est requise'
    isValid = false
  }

  // Required field: url
  if (!formData.value.url.trim()) {
    validationErrors.value.url = "L'URL est requise"
    isValid = false
  } else if (!/^(https?:\/\/|mailto:).+/.test(formData.value.url)) {
    validationErrors.value.url = "L'URL doit commencer par http://, https://, ou mailto:"
    isValid = false
  } else if (formData.value.url.length > 500) {
    validationErrors.value.url = "L'URL doit contenir moins de 500 caractères"
    isValid = false
  }

  // Optional field: label (validate only if provided)
  if (formData.value.label && formData.value.label.length > 255) {
    validationErrors.value.label = 'Le libellé doit contenir moins de 255 caractères'
    isValid = false
  } else if (formData.value.label && !/^[a-zA-ZÀ-ÿ0-9@_.\-\s]*$/.test(formData.value.label)) {
    validationErrors.value.label = 'Le libellé ne peut contenir que des lettres (y compris accentuées), chiffres, @, _, ., - et espaces'
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
 * Handle form submission
 */
const handleSubmit = async () => {
  clearError()
  validationErrors.value = {}

  if (!validateForm()) {
    return
  }

  if (isEditMode.value && props.editContactLink) {
    // Edit mode: update contact link
    const dto: UpdateContactLinkDto = {
      platform: formData.value.platform,
      url: formData.value.url,
      label: formData.value.label || undefined,
      sortOrder: formData.value.sortOrder,
      isActive: formData.value.isActive,
    }

    const result = await updateContactLink(props.editContactLink.id, dto)
    if (!result) return

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      resetForm()
      emit('success')
      emit('close')
    }, 1500)
  } else {
    // Create mode
    const dto: CreateContactLinkDto = {
      platform: formData.value.platform,
      url: formData.value.url,
      label: formData.value.label || undefined,
      sortOrder: formData.value.sortOrder,
      isActive: formData.value.isActive,
    }

    const result = await createContactLink(dto)

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
    platform: 'email',
    url: '',
    label: '',
    sortOrder: 0,
    isActive: true,
  }
  validationErrors.value = {}
  clearError()
  showSuccess.value = false
}

/**
 * Populate form from edit contact link data
 */
const populateFromEditContactLink = () => {
  if (props.editContactLink) {
    formData.value = {
      platform: props.editContactLink.platform,
      url: props.editContactLink.url,
      label: props.editContactLink.label || '',
      sortOrder: props.editContactLink.sortOrder,
      isActive: props.editContactLink.isActive,
    }
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
 * Uses immediate: true so it also fires on mount (the Sheet remounts content each time it opens,
 * so without immediate the watcher would not fire since open is already true at mount time)
 */
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.editContactLink) {
        populateFromEditContactLink()
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
        {{ isEditMode ? 'Modifier le lien' : 'Ajouter un lien' }}
      </h2>
      <p class="text-muted-foreground text-sm">
        {{ isEditMode ? 'Modifier les détails du lien' : 'Ajouter un nouveau lien de contact ou réseau social' }}
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
          {{ isEditMode ? 'Lien mis à jour avec succès !' : 'Lien créé avec succès !' }}
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
        <!-- Platform -->
        <div class="space-y-2">
          <Label for="platform">Plateforme *</Label>
          <Select
            id="platform"
            v-model="formData.platform"
            :aria-invalid="!!validationErrors.platform"
            :disabled="loading"
          >
            <option
              v-for="option in platformOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </Select>
          <p v-if="validationErrors.platform" class="text-sm text-red-600">
            {{ validationErrors.platform }}
          </p>
        </div>

        <!-- URL -->
        <div class="space-y-2">
          <Label for="url">URL *</Label>
          <Input
            id="url"
            v-model="formData.url"
            type="text"
            :placeholder="urlPlaceholder"
            maxlength="500"
            :aria-invalid="!!validationErrors.url"
            :disabled="loading"
          />
          <p v-if="validationErrors.url" class="text-sm text-red-600">
            {{ validationErrors.url }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ formData.url.length }} / 500 caractères. Doit commencer par http://, https://, ou mailto:
          </p>
        </div>

        <!-- Label -->
        <div class="space-y-2">
          <Label for="label">Libellé d'affichage</Label>
          <Input
            id="label"
            v-model="formData.label"
            type="text"
            placeholder="e.g., @atelier_kaisla"
            maxlength="255"
            :aria-invalid="!!validationErrors.label"
            :disabled="loading"
          />
          <p v-if="validationErrors.label" class="text-sm text-red-600">
            {{ validationErrors.label }}
          </p>
          <p class="text-muted-foreground text-xs">
            Nom d'affichage optionnel affiché sur le site (ex. @username, adresse email)
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
            Les nombres les plus bas apparaissent en premier. Les liens avec le même ordre sont triés par date de création.
          </p>
        </div>

        <!-- Active Toggle -->
        <div class="flex items-center gap-2">
          <input
            id="isActive"
            v-model="formData.isActive"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            :disabled="loading"
          />
          <Label for="isActive" class="cursor-pointer">
            Actif
          </Label>
          <span class="text-muted-foreground text-xs">
            (Seuls les liens actifs apparaissent sur le site)
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
            : (isEditMode ? 'Enregistrer' : 'Créer le lien')
          }}
        </Button>
      </div>
    </div>
  </div>
</template>
