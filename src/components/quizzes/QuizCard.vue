<script setup>
// Horizontal quiz card (from the mockup): grayscale image on the left; on the
// right an olive band (title + linked course) above a white band with a status
// pill and the main button. Dumb component — the page decides the texts/links.
defineProps({
  image: { type: String, default: null },
  title: { type: String, required: true },
  courseTitle: { type: String, default: '' },
  courseTo: { type: String, default: '' },
  status: { type: Object, default: null }, // { label, tone: 'leaf' | 'ochre' | 'wine' | 'taupe' }
  action: { type: Object, required: true }, // { label, to }
  secondary: { type: Object, default: null }, // optional small link under the button
})

const TONES = { leaf: 'bg-leaf', ochre: 'bg-ochre', wine: 'bg-wine', taupe: 'bg-taupe' }
</script>

<template>
  <article
    class="grid grid-cols-[38%_1fr] rounded-xl overflow-hidden bg-white shadow-[0_4px_12px_rgba(0,0,0,0.45)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-[transform,box-shadow] duration-300 motion-reduce:transition-none motion-reduce:transform-none"
  >
    <!-- Proportions from the mockup: ~237px tall, olive band ~57%, white band ~43% -->
    <div class="bg-parchment min-h-[12.5rem] md:min-h-[14.75rem]">
      <img v-if="image" :src="image" alt="" loading="lazy" class="w-full h-full object-cover grayscale" />
    </div>

    <div class="flex flex-col">
      <div class="bg-olive text-white px-4 md:px-6 py-4 md:py-5 flex-1 flex flex-col justify-center gap-1">
        <h2 class="font-button text-xl md:text-[1.75rem] leading-tight">{{ title }}</h2>
        <RouterLink v-if="courseTitle && courseTo" :to="courseTo" class="text-xs text-cream/90 underline hover:text-white">
          {{ courseTitle }}
        </RouterLink>
      </div>

      <div class="px-3 md:px-4 py-4 min-h-[5.5rem] md:min-h-[6.25rem] flex flex-wrap items-center justify-center gap-2 md:gap-4">
        <span
          v-if="status"
          class="text-white text-xs font-semibold px-3 py-2 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.3)] text-center leading-tight min-w-[7rem] max-w-[9rem]"
          :class="TONES[status.tone]"
        >
          {{ status.label }}
        </span>
        <div class="flex flex-col items-center gap-1">
          <RouterLink
            :to="action.to"
            class="font-button px-5 py-2 rounded-md bg-olive text-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] hover:bg-olive/90 transition-colors whitespace-nowrap"
          >
            {{ action.label }}
          </RouterLink>
          <RouterLink v-if="secondary" :to="secondary.to" class="text-xs font-semibold text-bark hover:text-olive hover:underline">
            {{ secondary.label }}
          </RouterLink>
        </div>
      </div>
    </div>
  </article>
</template>
