<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuizzes } from '../../composables/useQuizzes'
import { useInView } from '../../composables/useInView'

// "Start Quiz" opens a random published quiz (falls back to the quiz list
// while loading or if there are none).
const { quizzes, fetchPublished } = useQuizzes()
onMounted(fetchPublished)

const startLink = computed(() => {
  if (!quizzes.value.length) return '/quizzes'
  const pick = quizzes.value[Math.floor(Math.random() * quizzes.value.length)]
  return `/quizzes/${pick.$id}`
})

// The bridge collage slides in from the right each time the section scrolls into view.
const art = ref(null)
const { inView } = useInView(art, { threshold: 0.3, once: false })

// The text fades up piece by piece (same feel as the hero / "Who are we").
const textCol = ref(null)
const { inView: textInView } = useInView(textCol, { threshold: 0.3, once: false })
</script>

<template>
  <!-- Built from separate layers like "Who are we": the olive diagonal is CSS,
       the dots/rings/collage are transparent images, the text has its own column. -->
  <section class="relative overflow-hidden bg-white shadow-[0_-4px_10px_-6px_rgba(0,0,0,0.25),0_6px_10px_-6px_rgba(0,0,0,0.25)]">
    <!-- Dot pattern behind everything (left side) -->
    <img
      src="/images/home/test-quiz/dots.webp"
      alt=""
      class="absolute left-0 bottom-0 h-full w-auto max-w-none opacity-80 pointer-events-none"
    />
    <!-- md+: olive diagonal rising to the top-right (measured from the mockup) -->
    <div
      class="hidden md:block absolute inset-0 bg-olive [clip-path:polygon(85.5%_0,100%_0,100%_100%,27%_100%)]"
      aria-hidden="true"
    ></div>

    <!-- min-height = the artwork stage height (58% width × 852/1168), so the art never sticks out above -->
    <div class="relative md:min-h-[42.4vw] max-w-7xl mx-auto px-5 md:px-8 pt-12 md:py-16 flex items-center">
      <!-- Text — pieces fade up in order (--delay) -->
      <div ref="textCol" class="md:max-w-[46%] relative z-10" :class="{ 'is-revealed': textInView }">
        <!-- md+: sizes follow the screen width like the Figma frame, so the heading never runs into the collage -->
        <h2 class="font-voice text-3xl md:text-[clamp(2rem,3.3vw,4.25rem)] text-olive mb-4 leading-tight reveal" style="--delay: 0.1s">
          Wanna test your knowledge?
        </h2>
        <p class="text-base md:text-[clamp(1rem,1.6vw,1.75rem)] text-bark/90 mb-8 leading-snug md:max-w-[85%] reveal" style="--delay: 0.3s">
          Take this short quiz to find out your general history knowledge level and get recommended a course from our selection.
        </p>
        <div class="flex flex-wrap gap-3">
          <RouterLink
            :to="startLink"
            style="--delay: 0.5s"
            class="reveal font-button px-6 lg:px-10 py-2.5 lg:py-3 rounded-md bg-olive text-white lg:text-lg shadow-[0_4px_8px_rgba(0,0,0,0.45)] hover:bg-olive/90 transition-colors"
          >
            Start Quiz
          </RouterLink>
          <RouterLink
            to="/quizzes"
            style="--delay: 0.6s"
            class="reveal font-button px-6 lg:px-10 py-2.5 lg:py-3 rounded-md bg-olive text-white lg:text-lg shadow-[0_4px_8px_rgba(0,0,0,0.45)] hover:bg-olive/90 transition-colors"
          >
            Browse Quizzes
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Artwork stage. md+: anchored bottom-right of the section; phones: below the text.
         Layers are positioned in % of the stage, so they stay aligned at any size.
         Order = back to front. -->
    <div class="relative md:absolute md:right-0 md:bottom-0 w-full md:w-[58%] mt-8 md:mt-0">
      <!-- Phones: the diagonal sits behind the artwork only -->
      <div
        class="md:hidden absolute inset-0 bg-olive [clip-path:polygon(70%_0,100%_0,100%_100%,0_100%)]"
        aria-hidden="true"
      ></div>

      <div ref="art" class="relative aspect-[1168/852]" :class="{ 'is-revealed': inView }">
        <img
          src="/images/home/test-quiz/building.webp"
          srcset="/images/home/test-quiz/building-sm.webp 800w, /images/home/test-quiz/building.webp 1611w"
          sizes="(min-width: 768px) 45vw, 90vw"
          width="1611"
          height="1055"
          alt="Collage of the Manhattan Bridge beside a brick building"
          class="absolute left-[8.8%] top-[11.2%] w-[91.2%] transition-[transform,opacity] duration-[1200ms] ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100"
          :class="inView ? 'translate-x-0 opacity-100' : 'translate-x-[25%] opacity-0'"
        />
        <img src="/images/home/test-quiz/rings-front.webp" alt="" style="--delay: 0.7s" class="ring-pop absolute left-0 top-[54.2%] w-[41.4%]" />
        <img src="/images/home/test-quiz/ring-right.webp" alt="" style="--delay: 0.5s" class="ring-pop absolute left-[80.1%] top-[3.3%] w-[35.3%]" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Text pieces: rise 14px while fading in, in order of --delay. */
.reveal {
  opacity: 0;
  transform: translateY(14px);
}
.is-revealed .reveal {
  animation: reveal-up 0.6s ease-out var(--delay, 0s) forwards;
}

/* Rings pop in while the bridge collage slides in */
.ring-pop {
  opacity: 0;
  transform: scale(0.6);
}
.is-revealed .ring-pop {
  animation: ring-pop 0.7s cubic-bezier(0.3, 1.4, 0.5, 1) var(--delay, 0s) forwards;
}

@keyframes reveal-up {
  to { opacity: 1; transform: none; }
}
@keyframes ring-pop {
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .ring-pop {
    opacity: 1;
    transform: none;
  }
  .is-revealed .reveal,
  .is-revealed .ring-pop {
    animation: none;
  }
}
</style>
