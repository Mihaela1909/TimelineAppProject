<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useInView } from '../../composables/useInView'

// Horizontal card row: swipe/scroll on touch screens, arrow buttons on
// larger screens. Dumb wrapper — the parent passes the cards in the slot.
defineProps({
  label: { type: String, required: true }, // e.g. "Popular courses", for screen readers
})

const track = ref(null)

// Cards fade up one after another the first time the row scrolls into view.
// Only once: people scroll past these rows a lot, and re-animating content
// every time gets annoying (the big illustrated sections replay instead).
const { inView } = useInView(track, { threshold: 0.2, once: true })

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
      :class="{ 'is-revealed': inView }"
      class="track flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth scroll-px-3 px-3 -mx-3 pt-2 -mt-2 pb-5 -mb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

<style scoped>
/* Staggered entrance for the cards passed in the slot.
   `backwards` (not `forwards`): the animation only holds its START state during
   the delay, then lets go — so the card's own hover lift still works afterwards. */
.track :slotted(*) {
  opacity: 0;
}
.track.is-revealed :slotted(*) {
  opacity: 1;
  animation: card-in 0.6s ease-out backwards;
}
.track.is-revealed :slotted(:nth-child(2)) { animation-delay: 0.1s; }
.track.is-revealed :slotted(:nth-child(3)) { animation-delay: 0.2s; }
.track.is-revealed :slotted(:nth-child(4)) { animation-delay: 0.3s; }
.track.is-revealed :slotted(:nth-child(n + 5)) { animation-delay: 0.4s; }

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .track :slotted(*) {
    opacity: 1;
  }
  .track.is-revealed :slotted(*) {
    animation: none;
  }
}
</style>
