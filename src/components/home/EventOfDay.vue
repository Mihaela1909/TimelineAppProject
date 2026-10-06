<script setup>
import { onMounted, ref } from 'vue'
import { useEventOfDay } from '../../composables/useEventOfDay'
import { useInView } from '../../composables/useInView'
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'

const { date, featured, loading, error, fetchToday } = useEventOfDay()
onMounted(fetchToday)

// Comic-strip "pop": the frame shakes (megaphone shouts), then the bubble grows
// out of its tail tip with an overshoot, the text fades in, and the books pop last.
// Replays each time the section scrolls back into view.
const stage = ref(null)
const { inView } = useInView(stage, { threshold: 0.35, once: false })
</script>

<template>
  <section class="px-5 md:px-8 py-14 md:py-20 max-w-7xl mx-auto">
    <SectionHeading title="Event of the Day" />

    <!-- Proportions measured from the mockup: frame ≈ 43% of the width, bubble
         starts level with the megaphone and its tail points back at it. -->
    <div ref="stage" class="grid md:grid-cols-[minmax(0,43%)_1fr] gap-12 md:gap-6 items-start" :class="{ 'is-playing': inView }">
      <!-- Today's date inside the picture frame -->
      <div class="relative w-full max-w-md mx-auto md:max-w-none md:mx-0">
        <img src="/images/home/event-of-the-day.webp" alt="" class="shout w-full h-auto" />
        <!-- Positioned over the frame's inner window (measured from the artwork) -->
        <div class="absolute left-[16%] top-[16%] w-[43%] h-[61%] flex flex-col items-center justify-center gap-[0.15em] text-olive font-voice text-center leading-none">
          <span class="text-2xl md:text-[clamp(1.25rem,2.4vw,2.25rem)]">{{ date.year }}</span>
          <span class="text-6xl md:text-[clamp(2.75rem,5.2vw,5rem)]">{{ date.day }}</span>
          <span class="text-2xl md:text-[clamp(1.25rem,2.4vw,2.25rem)]">{{ date.month }}</span>
        </div>
      </div>

      <!-- Speech bubble with the event; on md+ it starts level with the megaphone -->
      <div class="relative w-full md:mt-[clamp(4rem,9.5vw,8.5rem)] md:-ml-1 mb-20 md:mb-24">
        <div class="bubble relative bg-olive text-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.45)] px-6 md:px-12 pt-6 md:pt-8 pb-6 md:pb-7 text-center">
          <!-- Tail pointing back at the megaphone: up-left on md+, straight up on phones -->
          <span
            class="hidden md:block absolute -left-9 -top-2.5 w-12 h-16 bg-olive [clip-path:polygon(0_0,100%_16%,100%_100%)]"
            aria-hidden="true"
          ></span>
          <span
            class="md:hidden absolute right-[18%] -top-8 w-12 h-10 bg-olive [clip-path:polygon(100%_0,100%_100%,0_100%)]"
            aria-hidden="true"
          ></span>
          <div class="bubble-content">
          <h3 class="text-3xl md:text-4xl font-bold mb-3">Today:</h3>

          <div v-if="loading" class="space-y-2" aria-live="polite">
            <div class="h-4 bg-white/25 rounded animate-pulse"></div>
            <div class="h-4 w-2/3 mx-auto bg-white/25 rounded animate-pulse"></div>
          </div>

          <div v-else-if="error" role="alert">
            <p class="mb-3">{{ error }}</p>
            <button type="button" class="px-4 py-1.5 rounded-md border border-cream/70 hover:bg-white/10" @click="fetchToday">
              Retry
            </button>
          </div>

          <template v-else-if="featured">
            <!-- Wikipedia events can be long: show 2 lines, full text on hover + via the link -->
            <p class="text-lg md:text-2xl leading-snug line-clamp-3 md:line-clamp-2" :title="`${featured.year} ${featured.text}`">
              <span class="font-bold">{{ featured.year }}</span> {{ featured.text }}
            </p>
            <a
              v-if="featured.url"
              :href="featured.url"
              target="_blank"
              rel="noopener"
              class="block mt-4 text-sm text-left text-cream/90 underline hover:text-white"
            >
              Read the full story on Wikipedia<span class="sr-only"> (opens in a new tab)</span>
            </a>
          </template>

          <p v-else class="text-cream/90">No events found for today.</p>
          </div>
        </div>

        <img
          src="/images/home/books.webp"
          alt=""
          class="books absolute right-[-2%] xl:right-[-10%] top-[80%] md:top-[70%] xl:top-[58%] w-[30%] md:w-[28%] xl:w-[40%] max-w-[16rem] pointer-events-none"
        />
      </div>
    </div>

    <div class="flex justify-end">
      <RouterLink to="/event-of-the-day" class="inline-flex items-center gap-2 text-sm font-semibold text-bark hover:text-olive">
        See full calendar <AppIcon name="arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
/* ---------- Start state (before the section is in view) ---------- */
/* The bubble grows from its tail tip, which touches the megaphone:
   top-left corner on md+, the upward tail (top-right area) on phones. */
.bubble {
  transform: scale(0);
  transform-origin: 82% -2rem;
}
@media (min-width: 768px) {
  .bubble {
    transform-origin: -2.25rem -0.6rem;
  }
}
.bubble-content {
  opacity: 0;
}
.books {
  opacity: 0;
  transform: translateY(18px) scale(0.85);
}

/* ---------- Playing ---------- */
/* 1. The frame + megaphone give a quick shout-shake */
.is-playing .shout {
  animation: shout 0.45s ease-in-out 0.1s;
}
/* 2. The bubble pops out of the megaphone with a comic overshoot */
.is-playing .bubble {
  animation: pop 0.65s cubic-bezier(0.2, 0.9, 0.3, 1) 0.4s forwards;
}
/* 3. The text appears once the bubble is open */
.is-playing .bubble-content {
  animation: fade-in 0.35s ease-out 0.85s forwards;
}
/* 4. The books pop up last */
.is-playing .books {
  animation: books-pop 0.45s cubic-bezier(0.3, 1.5, 0.5, 1) 1s forwards;
}

@keyframes shout {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-2deg) scale(1.02); }
  50% { transform: rotate(1.5deg); }
  75% { transform: rotate(-1deg); }
}
@keyframes pop {
  0% { transform: scale(0) rotate(-8deg); }
  60% { transform: scale(1.08) rotate(1.5deg); }
  80% { transform: scale(0.97) rotate(-0.5deg); }
  100% { transform: scale(1) rotate(0); }
}
@keyframes fade-in {
  to { opacity: 1; }
}
@keyframes books-pop {
  to { opacity: 1; transform: none; }
}

/* Reduced motion: everything simply shown */
@media (prefers-reduced-motion: reduce) {
  .bubble,
  .books {
    transform: none;
  }
  .bubble-content,
  .books {
    opacity: 1;
  }
  .is-playing .shout,
  .is-playing .bubble,
  .is-playing .bubble-content,
  .is-playing .books {
    animation: none;
  }
}
</style>
