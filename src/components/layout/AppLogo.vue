<script setup>
// The Timeline logo (white artwork, for dark/olive backgrounds).
// `link` wraps it in a link to the home page; the hero uses it unlinked.
defineProps({
  size: { type: String, default: 'sm' }, // 'sm' header/sidebar · 'md' footer · 'lg' hero
  link: { type: Boolean, default: true },
})

const HEIGHTS = { sm: 'h-10', md: 'h-16 md:h-20', lg: 'h-24 md:h-36' }
</script>

<template>
  <component
    :is="link ? 'RouterLink' : 'div'"
    :to="link ? '/' : undefined"
    class="inline-block"
    :aria-label="link ? 'Timeline — home' : undefined"
  >
    <img src="/images/logo.webp" alt="Timeline" :class="[HEIGHTS[size], 'w-auto']" />
  </component>
</template>
