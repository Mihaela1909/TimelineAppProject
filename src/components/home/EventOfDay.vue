<script setup>
import { onMounted } from 'vue'
import { useEventOfDay } from '../../composables/useEventOfDay'
import SectionHeading from '../ui/SectionHeading.vue'
import AppIcon from '../ui/AppIcon.vue'

const { date, featured, loading, error, fetchToday } = useEventOfDay()
onMounted(fetchToday)
</script>

<template>
  <section class="px-5 md:px-8 py-14 md:py-20 max-w-7xl mx-auto">
    <SectionHeading title="Event of the Day" />

    <div class="grid md:grid-cols-2 gap-10 md:gap-6 items-center">
      <!-- Today's date inside the picture frame -->
      <div class="relative w-full max-w-md mx-auto md:mx-0">
        <img src="/images/home/event-of-the-day.webp" alt="" class="w-full h-auto" />
        <!-- Positioned over the frame's inner window (measured from the artwork) -->
        <div class="absolute left-[16%] top-[16%] w-[43%] h-[61%] flex flex-col items-center justify-center text-bark font-voice text-center">
          <span class="text-lg md:text-2xl">{{ date.year }}</span>
          <span class="text-5xl md:text-7xl leading-none my-1">{{ date.day }}</span>
          <span class="text-lg md:text-2xl">{{ date.month }}</span>
        </div>
      </div>

      <!-- Speech bubble with the event -->
      <div class="relative max-w-md w-full mx-auto md:ml-auto md:mr-0">
        <div class="relative bg-olive text-white rounded-md shadow-lg px-8 py-8 md:py-10 text-center">
          <span
            class="absolute -left-4 top-6 w-8 h-8 bg-olive [clip-path:polygon(100%_0,100%_100%,0_0)]"
            aria-hidden="true"
          ></span>
          <h3 class="text-2xl md:text-3xl font-semibold mb-3">Today:</h3>

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

          <p v-else-if="featured" class="text-base md:text-lg leading-snug">
            <span class="font-bold">{{ featured.year }}</span> {{ featured.text }}
            <a
              v-if="featured.url"
              :href="featured.url"
              target="_blank"
              rel="noopener"
              class="block mt-3 text-sm text-cream/90 underline hover:text-white"
            >
              Read on Wikipedia<span class="sr-only"> (opens in a new tab)</span>
            </a>
          </p>

          <p v-else class="text-cream/90">No events found for today.</p>
        </div>

        <img
          src="/images/home/books.webp"
          alt=""
          class="hidden md:block absolute -right-6 xl:-right-10 -bottom-20 w-40 pointer-events-none"
        />
      </div>
    </div>

    <div class="flex justify-end mt-12 md:mt-16">
      <RouterLink to="/event-of-the-day" class="inline-flex items-center gap-2 text-sm font-semibold text-bark hover:text-olive">
        See full calendar <AppIcon name="arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>
  </section>
</template>
