<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Delete' },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div v-if="open" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl p-6 max-w-sm w-full">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-red-500">⚠</span>
        <h2 class="text-sm font-semibold text-bark">{{ title }}</h2>
      </div>
      <p class="text-xs text-bark/70 mb-5 leading-relaxed">{{ message }}</p>
      <div class="flex justify-end gap-2">
        <button
          class="text-xs px-4 py-2 rounded-md border border-olive text-olive"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="text-xs px-4 py-2 rounded-md bg-red-500 text-white"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>