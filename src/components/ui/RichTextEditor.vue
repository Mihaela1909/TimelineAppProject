<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

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
      class: 'lesson-editor-content min-h-[140px] px-3 py-2 text-sm focus:outline-none',
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
</script>

<template>
  <div class="border border-black/10 rounded-md overflow-hidden">
    <div v-if="editor" class="flex items-center gap-1 px-2 py-1.5 border-b border-black/10 bg-cream/40">
      <button
        type="button"
        class="w-7 h-7 rounded text-xs font-bold"
        :class="editor.isActive('bold') ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="editor.chain().focus().toggleBold().run()"
      >
        B
      </button>
      <button
        type="button"
        class="w-7 h-7 rounded text-xs italic"
        :class="editor.isActive('italic') ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        I
      </button>
      <span class="w-px h-4 bg-black/10 mx-1"></span>
      <button
        type="button"
        class="px-2 h-7 rounded text-xs font-semibold"
        :class="editor.isActive('heading', { level: 2 }) ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="px-2 h-7 rounded text-xs font-semibold"
        :class="editor.isActive('heading', { level: 3 }) ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>
      <span class="w-px h-4 bg-black/10 mx-1"></span>
      <button
        type="button"
        class="w-7 h-7 rounded text-xs"
        :class="editor.isActive('bulletList') ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        •≡
      </button>
      <button
        type="button"
        class="w-7 h-7 rounded text-xs"
        :class="editor.isActive('orderedList') ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1≡
      </button>
      <span class="w-px h-4 bg-black/10 mx-1"></span>
      <button
        type="button"
        class="w-7 h-7 rounded text-xs"
        :class="editor.isActive('link') ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="setLink"
      >
        🔗
      </button>
      <button
        type="button"
        class="w-7 h-7 rounded text-xs"
        :class="editor.isActive('blockquote') ? 'bg-olive text-white' : 'text-bark/60 hover:bg-black/5'"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        "
      </button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>