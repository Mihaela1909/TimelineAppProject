<script setup>
import { useToast } from '../../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <!-- Live region: screen readers announce each toast as it appears -->
  <div class="fixed bottom-5 right-5 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="px-4 py-3 rounded-lg text-sm shadow-lg flex items-center gap-2 min-w-[220px]"
        :class="toast.type === 'success' ? 'bg-bark text-cream' : 'bg-red-50 border border-red-200 text-red-700'"
      >
        <span v-if="toast.type === 'success'" aria-hidden="true">✓</span>
        <span v-else aria-hidden="true">⚠</span>
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>