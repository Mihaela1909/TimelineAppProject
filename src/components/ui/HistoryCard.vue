<script setup>
// Card used by the home page carousels (courses + blog posts):
// grayscale image → cream band (label) → olive band (title + meta).
defineProps({
  to: { type: String, required: true },
  image: { type: String, default: null }, // URL, or null for a plain placeholder
  badge: { type: String, default: '' }, // small pill top-right on the image
  label: { type: String, default: '' }, // text in the cream band
  labelLarge: { type: Boolean, default: false }, // course cards: label is part of the title
  title: { type: String, required: true },
  meta: { type: String, default: '' }, // e.g. "6 lessons", "4 min read"
})
</script>

<template>
  <RouterLink
    :to="to"
    class="group snap-start flex-shrink-0 w-[78%] sm:w-[45%] lg:w-[calc((100%-2.5rem)/3)] rounded-xl overflow-hidden bg-olive shadow-[0_4px_12px_rgba(0,0,0,0.45)] hover:shadow-[0_8px_18px_rgba(0,0,0,0.45)] transition-shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-olive/40"
  >
    <div class="relative h-40 bg-parchment overflow-hidden">
      <img
        v-if="image"
        :src="image"
        alt=""
        loading="lazy"
        class="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
      />
      <span v-if="badge" class="absolute top-2 right-2 bg-olive text-white text-xs px-2.5 py-0.5 rounded">
        {{ badge }}
      </span>
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
