<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

// Horizontal card row: swipe/scroll on touch screens, arrow buttons on
// larger screens. Dumb wrapper — the parent passes the cards in the slot.
defineProps({
  label: { type: String, required: true }, // e.g. "Popular courses", for screen readers
})

const track = ref(null)

// One "page" = the visible width, so each click reveals the next set of cards.
function scroll(direction) {
  track.value?.scrollBy({ left: direction * track.value.clientWidth * 0.9, behavior: 'smooth' })
}
</script>

<template>
  <div class="relative md:px-14" role="region" :aria-label="label">
    <button
      type="button"
      class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md items-center justify-center text-bark hover:bg-parchment transition-colors"
      aria-label="Scroll left"
      @click="scroll(-1)"
    >
      <AppIcon name="chevron-left" class="w-5 h-5" />
    </button>

    <div
      ref="track"
      class="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <slot />
    </div>

    <button
      type="button"
      class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-md items-center justify-center text-bark hover:bg-parchment transition-colors"
      aria-label="Scroll right"
      @click="scroll(1)"
    >
      <AppIcon name="chevron-right" class="w-5 h-5" />
    </button>
  </div>
</template>
