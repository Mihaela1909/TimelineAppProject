<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import AppIcon from './AppIcon.vue'

// This component owns the TipTap instance and emits plain HTML strings
// via v-model — the parent form never touches TipTap directly, it just
// binds :model-value / @update:model-value like any other input.
const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: {
      class: 'lesson-editor-content min-h-[100px] px-5 py-4 text-base text-bark focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Keep the editor in sync if the parent resets modelValue externally
// (e.g. loading a different lesson into the same form instance).
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, false)
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  const url = window.prompt('Enter a URL')
  if (url) editor.value.chain().focus().setLink({ href: url }).run()
}

// Toolbar buttons, in display order. `null` = a small gap between groups.
// Each `run` is the same TipTap command the old text buttons used.
const toolbar = [
  { icon: 'bold', label: 'Bold', active: 'bold', run: () => editor.value.chain().focus().toggleBold().run() },
  { icon: 'italic', label: 'Italic', active: 'italic', run: () => editor.value.chain().focus().toggleItalic().run() },
  null,
  { icon: 'h2', label: 'Heading 2', active: ['heading', { level: 2 }], run: () => editor.value.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: 'h3', label: 'Heading 3', active: ['heading', { level: 3 }], run: () => editor.value.chain().focus().toggleHeading({ level: 3 }).run() },
  null,
  { icon: 'list', label: 'Bullet list', active: 'bulletList', run: () => editor.value.chain().focus().toggleBulletList().run() },
  { icon: 'list-numbers', label: 'Numbered list', active: 'orderedList', run: () => editor.value.chain().focus().toggleOrderedList().run() },
  null,
  { icon: 'link', label: 'Link', active: 'link', run: setLink },
  { icon: 'quote', label: 'Quote', active: 'blockquote', run: () => editor.value.chain().focus().toggleBlockquote().run() },
]

const isActive = (active) => (Array.isArray(active) ? editor.value.isActive(...active) : editor.value.isActive(active))
</script>

<template>
  <div>
    <div v-if="editor" class="flex items-center gap-1 mb-2" role="toolbar" aria-label="Text formatting">
      <template v-for="(button, i) in toolbar" :key="button ? button.icon : `gap-${i}`">
        <span v-if="!button" class="w-2" aria-hidden="true"></span>
        <button
          v-else
          type="button"
          class="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
          :class="isActive(button.active) ? 'bg-olive-light text-olive' : 'text-sand-dark hover:text-olive hover:bg-olive-light/50'"
          :title="button.label"
          :aria-label="button.label"
          :aria-pressed="isActive(button.active)"
          @click="button.run"
        >
          <AppIcon :name="button.icon" class="w-5 h-5" />
        </button>
      </template>
    </div>
    <div class="bg-field border border-field-border rounded-md focus-within:border-olive focus-within:ring-2 focus-within:ring-olive/20 transition-colors">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>
