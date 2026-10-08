<script setup>
import { ref, watch, nextTick, onBeforeUnmount, useId } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Delete' },
})
const emit = defineEmits(['confirm', 'cancel'])

const id = useId()
const dialog = ref(null)
const cancelButton = ref(null)
let returnFocusTo = null

// Accessible dialog: focus moves in on open (to Cancel, the safe choice),
// Tab stays inside, Escape cancels, and focus goes back where it was on close.
function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
  } else if (event.key === 'Tab') {
    const buttons = [...dialog.value.querySelectorAll('button')]
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      returnFocusTo = document.activeElement
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      cancelButton.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      returnFocusTo?.focus?.()
      returnFocusTo = null
    }
  },
  { immediate: true }
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="emit('cancel')">
    <div
      ref="dialog"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="`${id}-title`"
      :aria-describedby="`${id}-message`"
      class="bg-white rounded-xl p-6 max-w-md w-full shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
    >
      <div class="flex items-center gap-3 mb-3">
        <span class="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">⚠</span>
        <h2 :id="`${id}-title`" class="font-voice text-xl text-bark">{{ title }}</h2>
      </div>
      <p :id="`${id}-message`" class="text-sm text-bark/80 mb-6 leading-relaxed">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button
          ref="cancelButton"
          type="button"
          class="text-sm px-5 py-2 rounded-md border border-olive text-olive hover:bg-olive-light/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-olive/30"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="text-sm px-5 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
