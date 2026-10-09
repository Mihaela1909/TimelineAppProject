<script setup>
// The Timeline logo (white artwork, for dark/olive backgrounds).
// `link` wraps it in a link to the home page; the hero uses it unlinked.
defineProps({
  size: { type: String, default: 'sm' }, // 'sm' admin sidebar · 'base' header · 'md' · 'lg' · 'fill' = container width (footer)
  link: { type: Boolean, default: true },
})

const SIZES = {
  sm: 'h-10 w-auto',
  base: 'h-12 md:h-14 w-auto',
  md: 'h-16 md:h-20 w-auto',
  lg: 'h-24 md:h-36 w-auto',
  fill: 'w-full h-auto',
}
</script>

<template>
  <component
    :is="link ? 'RouterLink' : 'div'"
    :to="link ? '/' : undefined"
    :class="size === 'fill' ? 'block w-full' : 'inline-block'"
    :aria-label="link ? 'Timeline — home' : undefined"
  >
    <img src="/images/logo.webp" alt="Timeline" width="1233" height="464" :class="SIZES[size]" />
  </component>
</template>
