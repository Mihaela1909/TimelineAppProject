<script setup>
import { onMounted, ref } from 'vue'
import AnimatedLogo from '../layout/AnimatedLogo.vue'
import NapoleonWindow from '../ui/NapoleonWindow.vue'

// Full-screen frame for the login and register pages (from the mockup):
// dotted background + olive diagonal, the Napoleon window on the right, and
// a white card on the left holding the brown logo, a title and the form (slot).
defineProps({
  title: { type: String, required: true },
})

// Napoleon rides in once the page has loaded.
const playing = ref(false)
onMounted(() => requestAnimationFrame(() => (playing.value = true)))
</script>

<template>
  <main id="main" tabindex="-1" class="focus:outline-none relative min-h-screen overflow-hidden bg-white flex items-center">
    <!-- Background: big dots on the left, olive diagonal on the right -->
    <img src="/images/home/who-are-we/dots.webp" alt="" class="absolute left-0 top-0 h-full w-auto max-w-none -scale-x-100 opacity-90 pointer-events-none" />
    <div class="hidden xl:block absolute inset-0 bg-olive [clip-path:polygon(93%_0,100%_0,100%_100%,37.6%_100%)]" aria-hidden="true"></div>

    <!-- Artwork (wide screens only, 1280px+; the form is the priority on smaller ones) -->
    <div class="hidden xl:block absolute right-[8%] top-1/2 -translate-y-1/2 w-[41%] max-w-[52rem]" aria-hidden="true">
      <NapoleonWindow :playing="playing" layout="auth" />
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full px-5 xl:pl-[10.6%] py-10 flex justify-center xl:justify-start">
      <div class="card w-full max-w-[33rem] bg-white border-2 border-olive rounded-2xl shadow-[0_6px_14px_rgba(0,0,0,0.3)] px-7 md:px-14 py-8 md:py-10">
        <RouterLink to="/" class="block w-56 mx-auto mb-4 text-bark" aria-label="Timeline — home">
          <AnimatedLogo :animated="false" class="w-full h-auto" />
        </RouterLink>
        <h1 class="font-voice text-bark text-4xl md:text-[3.25rem] leading-tight text-center mb-6 whitespace-nowrap">{{ title }}</h1>
        <slot />
      </div>
    </div>
  </main>
</template>

<style scoped>
.card {
  animation: card-in 0.6s ease-out 0.1s backwards;
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(16px); }
}
@media (prefers-reduced-motion: reduce) {
  .card { animation: none; }
}
</style>
