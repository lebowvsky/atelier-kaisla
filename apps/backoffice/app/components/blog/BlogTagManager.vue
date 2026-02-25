<!--
  @pattern Mediator + Chain of Responsibility Patterns
  @purpose Blog tag CRUD management with inline editing

  Patterns Applied:
  - Mediator Pattern: Centralized tag management with parent communication
  - Chain of Responsibility: Validation pipeline for tag names
-->

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-vue-next'
import type { BlogTag } from '@/types/blog'

/**
 * Component Props
 */
interface Props {
  tags: BlogTag[]
  loading: boolean
}

/**
 * Component Emits
 */
interface Emits {
  (e: 'create', name: string): void
  (e: 'update', id: string, name: string): void
  (e: 'delete', id: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * New tag input state
 */
const newTagName = ref('')

/**
 * Edit state
 */
const editingTagId = ref<string | null>(null)
const editingTagName = ref('')

/**
 * Validation errors
 */
const createError = ref('')
const editError = ref('')

/**
 * Handle create tag
 */
const handleCreate = () => {
  createError.value = ''
  const name = newTagName.value.trim()

  if (!name) {
    createError.value = 'Le nom du tag est requis'
    return
  }

  if (name.length > 100) {
    createError.value = 'Le nom doit contenir moins de 100 caractères'
    return
  }

  emit('create', name)
  newTagName.value = ''
}

/**
 * Start editing a tag
 */
const startEdit = (tag: BlogTag) => {
  editingTagId.value = tag.id
  editingTagName.value = tag.name
  editError.value = ''
}

/**
 * Cancel editing
 */
const cancelEdit = () => {
  editingTagId.value = null
  editingTagName.value = ''
  editError.value = ''
}

/**
 * Save tag edit
 */
const saveEdit = () => {
  editError.value = ''
  const name = editingTagName.value.trim()

  if (!name) {
    editError.value = 'Le nom du tag est requis'
    return
  }

  if (name.length > 100) {
    editError.value = 'Le nom doit contenir moins de 100 caractères'
    return
  }

  if (editingTagId.value) {
    emit('update', editingTagId.value, name)
    editingTagId.value = null
    editingTagName.value = ''
  }
}

/**
 * Handle delete tag with confirmation
 */
const handleDelete = (tag: BlogTag) => {
  if (!confirm(`Supprimer le tag "${tag.name}" ? Il sera retiré de tous les articles associés.`)) {
    return
  }
  emit('delete', tag.id)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Create new tag -->
    <div class="space-y-2">
      <Label>Ajouter un tag</Label>
      <div class="flex gap-2">
        <Input
          v-model="newTagName"
          type="text"
          placeholder="Nom du tag..."
          maxlength="100"
          :disabled="loading"
          class="flex-1"
          @keyup.enter="handleCreate"
        />
        <Button
          type="button"
          size="sm"
          :disabled="loading || !newTagName.trim()"
          @click="handleCreate"
        >
          <Plus class="mr-1 h-4 w-4" />
          Ajouter
        </Button>
      </div>
      <p v-if="createError" class="text-sm text-red-600">
        {{ createError }}
      </p>
    </div>

    <!-- Tag list -->
    <div class="space-y-2">
      <Label>Tags existants ({{ tags.length }})</Label>

      <!-- Empty state -->
      <div
        v-if="tags.length === 0"
        class="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 dark:border-gray-700"
      >
        <p class="text-sm text-muted-foreground">Aucun tag pour le moment</p>
      </div>

      <!-- Tags list -->
      <div v-else class="flex flex-wrap gap-2">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="group flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <!-- View mode -->
          <template v-if="editingTagId !== tag.id">
            <span class="font-medium">{{ tag.name }}</span>
            <button
              type="button"
              class="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100"
              title="Modifier"
              :disabled="loading"
              @click="startEdit(tag)"
            >
              <Pencil class="h-3 w-3" />
            </button>
            <button
              type="button"
              class="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900 dark:hover:text-red-400"
              title="Supprimer"
              :disabled="loading"
              @click="handleDelete(tag)"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <input
              v-model="editingTagName"
              type="text"
              maxlength="100"
              class="w-24 border-b border-primary bg-transparent text-sm outline-none"
              :disabled="loading"
              @keyup.enter="saveEdit"
              @keyup.escape="cancelEdit"
            />
            <button
              type="button"
              class="flex h-5 w-5 items-center justify-center rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
              title="Enregistrer"
              :disabled="loading"
              @click="saveEdit"
            >
              <Check class="h-3 w-3" />
            </button>
            <button
              type="button"
              class="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
              title="Annuler"
              :disabled="loading"
              @click="cancelEdit"
            >
              <X class="h-3 w-3" />
            </button>
          </template>
        </div>
      </div>

      <p v-if="editError" class="text-sm text-red-600">
        {{ editError }}
      </p>
    </div>
  </div>
</template>
