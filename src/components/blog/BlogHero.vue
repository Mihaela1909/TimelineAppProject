<script setup>
import { ref } from 'vue'
import { useInView } from '../../composables/useInView'

// "Blog" banner: Fitzgerald + Woolf bottom-left, Camus + Kafka bottom-right.
// Positions were fitted against the 1408×520 mockup (pixel matching) and stored
// in % of two bottom-anchored group boxes — same approach as Courses/Quizzes.
// Entrance (replays on scroll-in): back portraits rise first, then the front ones.
const IMG = '/images/blog'

const leftGroup = [
  { src: 'fitzgerald', row: 0, left: -9.1, top: 0.9, width: 73.3 },
  { src: 'woolf', row: 1, left: 38.9, top: 22.1, width: 59.3 },
]
const rightGroup = [
  { src: 'kafka', row: 0, left: 38.3, top: 3.0, width: 71.5 },
  { src: 'camus', row: 1, left: 3.9, top: 23.7, width: 70.7 },
]

const hero = ref(null)
const { inView } = useInView(hero, { threshold: 0.3, once: false })

const place = (f) => ({
  left: `${f.left}%`,
  top: `${f.top}%`,
  width: `${f.width}%`,
  '--delay': `${0.15 + f.row * 0.3}s`,
})
</script>

<template>
  <section
    ref="hero"
    :class="{ 'is-playing': inView }"
    class="relative overflow-hidden bg-umber h-[95vw] max-h-[34rem] md:h-auto md:max-h-none md:aspect-[1408/520]"
  >
    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('/images/blog/hero-bg.webp')" aria-hidden="true"></div>

    <!-- Group boxes = mockup regions x 0–540 / 868–1408, y 90 → bottom (px of 1408×520) -->
    <div class="absolute left-0 bottom-0 w-[58%] md:w-[38.35%] aspect-[540/430]" aria-hidden="true">
      <img v-for="f in leftGroup" :key="f.src" :src="`${IMG}/${f.src}.webp`" alt="" class="figure absolute h-auto max-w-none" :style="place(f)" />
    </div>
    <div class="absolute right-0 bottom-0 w-[58%] md:w-[38.35%] aspect-[540/430]" aria-hidden="true">
      <img v-for="f in rightGroup" :key="f.src" :src="`${IMG}/${f.src}.webp`" alt="" class="figure absolute h-auto max-w-none" :style="place(f)" />
    </div>

    <div
      class="absolute inset-x-0 bottom-0 h-[28%] pointer-events-none"
      style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 100%)"
      aria-hidden="true"
    ></div>

    <div class="relative z-10 h-full flex items-start md:items-center justify-center pt-[16%] md:pt-0 md:pb-[6%]">
      <h1 class="title font-voice text-white text-5xl md:text-[clamp(2.5rem,5vw,5.5rem)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">Blog</h1>
    </div>
  </section>
</template>

<style scoped>
.figure {
  opacity: 0;
  transform: translateY(120%);
}
.is-playing .figure {
  animation: rise 0.9s cubic-bezier(0.25, 1.25, 0.45, 1) var(--delay) forwards;
}
.title {
  opacity: 0;
  transform: translateY(14px);
}
.is-playing .title {
  animation: title-in 0.7s ease-out 0.35s forwards;
}
@keyframes rise {
  0% { opacity: 0; transform: translateY(120%); }
  25% { opacity: 1; }
  100% { opacity: 1; transform: none; }
}
@keyframes title-in {
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .figure,
  .title {
    opacity: 1;
    transform: none;
  }
  .is-playing .figure,
  .is-playing .title {
    animation: none;
  }
}
</style>
