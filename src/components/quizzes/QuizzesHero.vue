<script setup>
import { ref } from 'vue'
import { useInView } from '../../composables/useInView'

// "All Quizzes" banner: the Thinker (+ "Eureka!") bottom-left and Tesla
// (+ "Hmmm..") bottom-right, on the spiral background. Positions were fitted
// against the 1459×540 mockup (pixel matching) and stored in % of two
// bottom-anchored group boxes — same approach as CoursesHero. On md+ the hero
// keeps the mockup's aspect ratio, so everything lands as in Figma.
//
// Entrance (replays on scroll-in): the figures rise from below, then their
// speech bubbles pop out like comic balloons.
const IMG = '/images/quizzes'

const leftGroup = [
  { src: 'think', alt: 'The Thinker', kind: 'figure', step: 0, left: 14.4, top: 20.1, width: 68.0 },
  { src: 'eureka', alt: '', kind: 'bubble', step: 1, left: 50.3, top: -0.1, width: 49.8 },
]
const rightGroup = [
  { src: 'tesla', alt: 'Nikola Tesla', kind: 'figure', step: 0, left: 0.0, top: 9.5, width: 100.7 },
  { src: 'hmm', alt: '', kind: 'bubble', step: 1, left: 15.1, top: 0.0, width: 46.0 },
]

const hero = ref(null)
const { inView } = useInView(hero, { threshold: 0.3, once: false })

const place = (f) => ({
  left: `${f.left}%`,
  top: `${f.top}%`,
  width: `${f.width}%`,
  '--delay': `${0.15 + f.step * 0.55}s`,
})
</script>

<template>
  <section
    ref="hero"
    :class="{ 'is-playing': inView }"
    class="relative overflow-hidden bg-umber h-[95vw] max-h-[34rem] md:h-auto md:max-h-none md:aspect-[1459/540]"
  >
    <!-- bg-bottom: matches the mockup (fitted) -->
    <div class="absolute inset-0 bg-cover bg-bottom" style="background-image: url('/images/quizzes/quizbg.webp')" aria-hidden="true"></div>

    <!-- Group boxes = mockup regions x 0–494 / 998–1459, from y 44 / 68 to the bottom (px of 1459×540) -->
    <div class="absolute left-0 bottom-0 w-[50%] md:w-[33.86%] aspect-[494/496]" aria-hidden="true">
      <img v-for="f in leftGroup" :key="f.src" :src="`${IMG}/${f.src}.webp`" alt="" class="absolute h-auto max-w-none" :class="f.kind" :style="place(f)" />
    </div>
    <div class="absolute right-0 bottom-0 w-[48%] md:w-[31.6%] aspect-[461/472]" aria-hidden="true">
      <img v-for="f in rightGroup" :key="f.src" :src="`${IMG}/${f.src}.webp`" alt="" class="absolute h-auto max-w-none" :class="f.kind" :style="place(f)" />
    </div>

    <!-- Short bottom fade, like the courses hero -->
    <div
      class="absolute inset-x-0 bottom-0 h-[28%] pointer-events-none"
      style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 100%)"
      aria-hidden="true"
    ></div>

    <div class="relative z-10 h-full flex items-start md:items-center justify-center pt-[16%] md:pt-0">
      <h1 class="title font-voice text-white text-5xl md:text-[clamp(2.5rem,5vw,5.5rem)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        All Quizzes
      </h1>
    </div>
  </section>
</template>

<style scoped>
/* Figures rise from below the bottom edge */
.figure {
  opacity: 0;
  transform: translateY(120%);
}
.is-playing .figure {
  animation: rise 0.9s cubic-bezier(0.25, 1.25, 0.45, 1) var(--delay) forwards;
}
/* Speech bubbles pop out with a comic overshoot */
.bubble {
  opacity: 0;
  transform: scale(0.2) rotate(-12deg);
}
.is-playing .bubble {
  animation: pop 0.55s cubic-bezier(0.3, 1.6, 0.5, 1) var(--delay) forwards;
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
@keyframes pop {
  to { opacity: 1; transform: none; }
}
@keyframes title-in {
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .figure,
  .bubble,
  .title {
    opacity: 1;
    transform: none;
  }
  .is-playing .figure,
  .is-playing .bubble,
  .is-playing .title {
    animation: none;
  }
}
</style>
