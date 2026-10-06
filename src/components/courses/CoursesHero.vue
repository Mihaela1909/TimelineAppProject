<script setup>
import { ref } from 'vue'
import { useInView } from '../../composables/useInView'

// "All Courses" banner: a stone-hall background with two groups of historical
// figures, measured from the Figma mockup (1648×604 frame).
//
// How the numbers were made: each figure's size + position was found by
// matching its image against the mockup pixels (best correlation over a range
// of scales and offsets), then verified with a difference overlay. The result
// is stored in % of its GROUP box. Each group is anchored to a bottom corner with a fixed
// aspect ratio, so on md+ (where the hero keeps the mockup's 1648/604 shape)
// every figure lands exactly where it is in Figma, at any screen width.
// Order = back → front. Augustus is cut by the right edge on purpose.
const FIGURES = '/images/courses/figures'

const leftGroup = [
  { src: 'stefancelmare', alt: 'Stephen the Great', left: -5.3, top: -5.6, width: 66.1, row: 0 },
  { src: 'jeandarc', alt: 'Joan of Arc', left: 34.8, top: 18.5, width: 53.9, row: 1 },
  { src: 'pharaoh', alt: 'Tutankhamun', left: -16.4, top: 29.3, width: 57.9, row: 1 },
  { src: 'vladtepes', alt: 'Vlad the Impaler', left: 19.4, top: 47.8, width: 49.3, row: 2 },
  { src: 'dante', alt: 'Dante Alighieri', left: 69.2, top: 56.4, width: 37.9, row: 2 },
]

const rightGroup = [
  { src: 'marie', alt: 'Marie Antoinette', left: 51.1, top: -2.3, width: 47.2, row: 0 },
  { src: 'augustus', alt: 'Augustus', left: 61.8, top: 31.3, width: 56.2, row: 1 },
  { src: 'alexander', alt: 'Alexander the Great', left: 22.7, top: 12.9, width: 50.9, row: 1 },
  { src: 'lincoln', alt: 'Abraham Lincoln', left: 50.5, top: 53.3, width: 38.0, row: 2 },
  { src: 'davinci', alt: 'Leonardo da Vinci', left: 1.0, top: 57.0, width: 38.6, row: 2 },
]

// Entrance: rows rise up from below the bottom edge, back row first, then each
// row in front of it (`row`: 0 = back … 2 = front). Replays on scroll-in.
const ROW_DELAY = 0.28 // seconds between rows
const hero = ref(null)
const { inView } = useInView(hero, { threshold: 0.3, once: false })

const place = (f) => ({
  left: `${f.left}%`,
  top: `${f.top}%`,
  width: `${f.width}%`,
  '--delay': `${0.15 + f.row * ROW_DELAY}s`,
})
</script>

<template>
  <section
    ref="hero"
    :class="{ 'is-playing': inView }"
    class="relative overflow-hidden bg-umber h-[95vw] max-h-[34rem] md:h-auto md:max-h-none md:aspect-[1648/604]"
  >
    <!-- Background: stone hall -->
    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('/images/courses/hero-bg.webp')" aria-hidden="true"></div>

    <!-- Left group (bottom-left corner) -->
    <!-- Group boxes = mockup regions x 0–560 / 1000–1648, y 100–604 (px of 1648×604) -->
    <div class="absolute left-0 bottom-0 w-[58%] md:w-[33.98%] aspect-[560/504]" aria-hidden="true">
      <img
        v-for="f in leftGroup"
        :key="f.src"
        :src="`${FIGURES}/${f.src}.webp`"
        alt=""
        class="figure absolute h-auto max-w-none"
        :style="place(f)"
      />
    </div>

    <!-- Right group (bottom-right corner; Augustus is cut by the edge on purpose) -->
    <div class="absolute right-0 bottom-0 w-[62%] md:w-[39.32%] aspect-[648/504]" aria-hidden="true">
      <img
        v-for="f in rightGroup"
        :key="f.src"
        :src="`${FIGURES}/${f.src}.webp`"
        alt=""
        class="figure absolute h-auto max-w-none"
        :style="place(f)"
      />
    </div>

    <!-- Bottom fade (same umber as the home hero, but shorter); it sits over the
         figures so they melt into the page like in the mockup. -->
    <div
      class="absolute inset-x-0 bottom-0 h-[28%] pointer-events-none"
      style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 100%)"
      aria-hidden="true"
    ></div>

    <!-- Title (in front of the figures) -->
    <div class="relative z-10 h-full flex items-start md:items-center justify-center pt-[18%] md:pt-0 md:pb-0">
      <h1 class="title font-voice text-white text-5xl md:text-[clamp(2.5rem,5vw,5.5rem)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        All Courses
      </h1>
    </div>
  </section>
</template>

<style scoped>
/* Start below the hero's bottom edge (the section clips them), then rise into
   place with a small overshoot. --delay sets each figure's row turn. */
.figure {
  opacity: 0;
  transform: translateY(140%);
}
.is-playing .figure {
  animation: rise 0.9s cubic-bezier(0.25, 1.25, 0.45, 1) var(--delay) forwards;
}
@keyframes rise {
  0% { opacity: 0; transform: translateY(140%); }
  25% { opacity: 1; }
  100% { opacity: 1; transform: none; }
}

/* Title fades up just after the back row starts rising */
.title {
  opacity: 0;
  transform: translateY(14px);
}
.is-playing .title {
  animation: title-in 0.7s ease-out 0.35s forwards;
}
@keyframes title-in {
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .title {
    opacity: 1;
    transform: none;
  }
  .is-playing .title {
    animation: none;
  }
  .figure {
    opacity: 1;
    transform: none;
  }
  .is-playing .figure {
    animation: none;
  }
}
</style>
