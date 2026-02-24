<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-vue-next'

interface Props {
  modelValue?: string
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  placeholder: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    const currentHtml = editor.value.getHTML()
    if (currentHtml !== value) {
      editor.value.commands.setContent(value || '', false)
    }
  },
)

watch(
  () => props.disabled,
  (disabled) => {
    editor.value?.setEditable(!disabled)
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

interface ToolbarAction {
  icon: typeof Bold
  label: string
  action: () => void
  isActive: () => boolean
}

const toolbarActions = computed((): ToolbarAction[] => {
  if (!editor.value) return []
  const e = editor.value
  return [
    {
      icon: Bold,
      label: 'Gras',
      action: () => e.chain().focus().toggleBold().run(),
      isActive: () => e.isActive('bold'),
    },
    {
      icon: Italic,
      label: 'Italique',
      action: () => e.chain().focus().toggleItalic().run(),
      isActive: () => e.isActive('italic'),
    },
    {
      icon: Heading2,
      label: 'Titre 2',
      action: () => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => e.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      label: 'Titre 3',
      action: () => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => e.isActive('heading', { level: 3 }),
    },
    {
      icon: List,
      label: 'Liste',
      action: () => e.chain().focus().toggleBulletList().run(),
      isActive: () => e.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      label: 'Liste ordonnee',
      action: () => e.chain().focus().toggleOrderedList().run(),
      isActive: () => e.isActive('orderedList'),
    },
    {
      icon: Minus,
      label: 'Ligne horizontale',
      action: () => e.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
    {
      icon: Undo2,
      label: 'Annuler',
      action: () => e.chain().focus().undo().run(),
      isActive: () => false,
    },
    {
      icon: Redo2,
      label: 'Refaire',
      action: () => e.chain().focus().redo().run(),
      isActive: () => false,
    },
  ]
})
</script>

<template>
  <div
    class="border-input overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow]"
    :class="[
      disabled ? 'pointer-events-none opacity-50' : '',
      'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
    ]"
  >
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-0.5 border-b bg-muted/40 px-1 py-1">
      <button
        v-for="(btn, index) in toolbarActions"
        :key="index"
        type="button"
        :title="btn.label"
        :disabled="disabled"
        class="flex h-8 w-8 items-center justify-center rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        :class="btn.isActive() ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'"
        @click="btn.action"
      >
        <component :is="btn.icon" class="h-4 w-4" />
      </button>
    </div>

    <!-- Editor -->
    <EditorContent :editor="editor" class="rich-text-editor" />
  </div>
</template>

<style>
.rich-text-editor .tiptap {
  min-height: 120px;
  padding: 0.5rem 0.75rem;
  outline: none;
  font-size: 0.875rem;
  line-height: 1.625;
}

.rich-text-editor .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--muted-foreground);
  pointer-events: none;
  height: 0;
}

.rich-text-editor .tiptap h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.75rem 0 0.25rem;
  line-height: 1.3;
}

.rich-text-editor .tiptap h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.5rem 0 0.25rem;
  line-height: 1.3;
}

.rich-text-editor .tiptap p {
  margin: 0.25rem 0;
}

.rich-text-editor .tiptap ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 0.25rem 0;
}

.rich-text-editor .tiptap ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 0.25rem 0;
}

.rich-text-editor .tiptap li {
  margin: 0.125rem 0;
}

.rich-text-editor .tiptap hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 0.75rem 0;
}

.rich-text-editor .tiptap strong {
  font-weight: 700;
}

.rich-text-editor .tiptap em {
  font-style: italic;
}
</style>
