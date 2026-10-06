<script setup>
// Grayscale banner across the top of a course and its lessons (the course's
// header image, falling back to its cover), with the umber fade at the bottom.
defineProps({
  image: { type: String, default: null }, // URL
})
</script>

<template>
  <div class="relative h-40 md:h-[clamp(11rem,17vw,16rem)] bg-umber overflow-hidden" aria-hidden="true">
    <img v-if="image" :src="image" alt="" class="w-full h-full object-cover grayscale" />
    <div
      class="absolute inset-x-0 bottom-0 h-1/2"
      style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 100%)"
    ></div>
  </div>
</template>
