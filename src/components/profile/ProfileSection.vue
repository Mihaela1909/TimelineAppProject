<script setup>
// White card used on the profile page (mockup): title, a line with a diamond
// at each end, and the big dot pattern fading in on the right.
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <section class="relative overflow-hidden bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] px-5 py-6 md:px-14 md:py-9">
    <img src="/images/home/who-are-we/dots.webp" alt="" class="absolute right-0 top-0 h-full w-auto max-w-none opacity-60 pointer-events-none" />
    <div class="relative">
      <h2 class="font-voice text-bark text-3xl md:text-4xl mb-2 md:ml-4">{{ title }}</h2>
      <div class="flex items-center mb-6 md:mb-8" aria-hidden="true">
        <span class="w-2.5 h-2.5 bg-bark rotate-45 -mr-1 flex-shrink-0"></span>
        <span class="flex-1 h-0.5 bg-bark/80"></span>
        <span class="w-2.5 h-2.5 bg-bark rotate-45 -ml-1 flex-shrink-0"></span>
      </div>
      <slot />
    </div>
  </section>
</template>
