<script setup>
import AppIcon from './AppIcon.vue'

// Page switcher: ‹ 1 2 3 ›. Dumb component — v-model is the current page (1-based).
const props = defineProps({
  modelValue: { type: Number, required: true },
  pageCount: { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue'])

function go(page) {
  if (page >= 1 && page <= props.pageCount && page !== props.modelValue) emit('update:modelValue', page)
}
</script>

<template>
  <nav v-if="pageCount > 1" class="flex justify-center gap-3" aria-label="Pages">
    <button
      type="button"
      class="w-10 h-10 rounded-md bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] flex items-center justify-center text-bark hover:bg-parchment disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="modelValue === 1"
      aria-label="Previous page"
      @click="go(modelValue - 1)"
    >
      <AppIcon name="chevron-left" class="w-5 h-5" />
    </button>
    <button
      v-for="page in pageCount"
      :key="page"
      type="button"
      class="w-10 h-10 rounded-md text-sm font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-colors"
      :class="page === modelValue ? 'bg-olive text-white' : 'bg-white text-bark hover:bg-parchment'"
      :aria-current="page === modelValue ? 'page' : undefined"
      :aria-label="`Page ${page}`"
      @click="go(page)"
    >
      {{ page }}
    </button>
    <button
      type="button"
      class="w-10 h-10 rounded-md bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] flex items-center justify-center text-bark hover:bg-parchment disabled:opacity-40 disabled:cursor-not-allowed"
      :disabled="modelValue === pageCount"
      aria-label="Next page"
      @click="go(modelValue + 1)"
    >
      <AppIcon name="chevron-right" class="w-5 h-5" />
    </button>
  </nav>
</template>
