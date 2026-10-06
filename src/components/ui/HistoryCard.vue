<script setup>
// Card used by the home page carousels (courses + blog posts):
// grayscale image → cream band (label) → olive band (title + meta).
// Hover: the card lifts, the shadow deepens, and the photo zooms slightly.
defineProps({
  to: { type: String, required: true },
  image: { type: String, default: null }, // URL, or null for a plain placeholder
  badge: { type: String, default: '' }, // small pill top-right on the image
  label: { type: String, default: '' }, // text in the cream band
  labelLarge: { type: Boolean, default: false }, // course cards: label is part of the title
  title: { type: String, required: true },
  meta: { type: String, default: '' }, // e.g. "6 lessons", "4 min read"
  badgeTone: { type: String, default: 'olive' }, // 'olive' | 'ochre' (in progress) | 'leaf' (completed)
  progress: { type: Number, default: null }, // 0–1: thin bar under the badge (in-progress courses)
  layout: { type: String, default: 'carousel' }, // 'carousel' (fixed widths, snap) | 'grid' (fills its cell)
})

const BADGE_TONES = { olive: 'bg-olive', ochre: 'bg-ochre', leaf: 'bg-leaf' }
const LAYOUTS = {
  carousel: 'snap-start flex-shrink-0 w-[78%] sm:w-[45%] lg:w-[calc((100%-2.5rem)/3)]',
  grid: 'w-full',
}
</script>

<template>
  <RouterLink
    :to="to"
    :class="LAYOUTS[layout]"
    class="group rounded-xl overflow-hidden bg-olive shadow-[0_4px_12px_rgba(0,0,0,0.45)] hover:shadow-[0_10px_20px_rgba(0,0,0,0.45)] hover:-translate-y-1 focus-visible:-translate-y-1 transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none focus:outline-none focus-visible:ring-4 focus-visible:ring-olive/40"
  >
    <div class="relative h-40 bg-white overflow-hidden">
      <img
        v-if="image"
        :src="image"
        alt=""
        loading="lazy"
        class="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none"
      />
      <div v-if="badge" class="absolute top-2 right-2 flex flex-col items-stretch gap-1">
        <span class="text-white text-xs font-semibold px-2.5 py-0.5 rounded" :class="BADGE_TONES[badgeTone]">
          {{ badge }}
        </span>
        <span v-if="progress !== null" class="h-1 rounded-full bg-white/80 overflow-hidden" aria-hidden="true">
          <span class="block h-full bg-ochre" :style="{ width: `${Math.round(progress * 100)}%` }"></span>
        </span>
      </div>
    </div>

    <div v-if="label" class="bg-white px-4" :class="labelLarge ? 'py-1.5' : 'py-1'">
      <span :class="labelLarge ? 'font-button text-2xl text-olive' : 'text-sm text-bark'">{{ label }}</span>
    </div>

    <!-- Courses: title + meta on one row. Blog: title, then meta underneath. -->
    <div
      class="px-4 py-2.5 min-h-[3.5rem]"
      :class="labelLarge ? 'flex items-end justify-between gap-3' : 'flex flex-col gap-1'"
    >
      <span class="font-button text-white leading-snug" :class="labelLarge ? 'text-[1.75rem]' : 'text-xl'">{{ title }}</span>
      <span v-if="meta" class="text-xs text-cream/80 whitespace-nowrap" :class="labelLarge ? 'pb-1' : ''">{{ meta }}</span>
    </div>
  </RouterLink>
</template>
