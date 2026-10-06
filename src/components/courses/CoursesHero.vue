<script setup>
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
  { src: 'stefancelmare', alt: 'Stephen the Great', left: -5.3, top: -5.6, width: 66.1 },
  { src: 'jeandarc', alt: 'Joan of Arc', left: 34.8, top: 18.5, width: 53.9 },
  { src: 'pharaoh', alt: 'Tutankhamun', left: -16.4, top: 29.3, width: 57.9 },
  { src: 'vladtepes', alt: 'Vlad the Impaler', left: 19.4, top: 47.8, width: 49.3 },
  { src: 'dante', alt: 'Dante Alighieri', left: 69.2, top: 56.4, width: 37.9 },
]

const rightGroup = [
  { src: 'marie', alt: 'Marie Antoinette', left: 51.1, top: -2.3, width: 47.2 },
  { src: 'augustus', alt: 'Augustus', left: 61.8, top: 31.3, width: 56.2 },
  { src: 'alexander', alt: 'Alexander the Great', left: 22.7, top: 12.9, width: 50.9 },
  { src: 'lincoln', alt: 'Abraham Lincoln', left: 50.5, top: 53.3, width: 38.0 },
  { src: 'davinci', alt: 'Leonardo da Vinci', left: 1.0, top: 57.0, width: 38.6 },
]

const place = (f) => ({ left: `${f.left}%`, top: `${f.top}%`, width: `${f.width}%` })
</script>

<template>
  <section
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
        class="absolute h-auto max-w-none"
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
        class="absolute h-auto max-w-none"
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
      <h1 class="font-voice text-white text-5xl md:text-[clamp(2.5rem,5vw,5.5rem)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
        All Courses
      </h1>
    </div>
  </section>
</template>
