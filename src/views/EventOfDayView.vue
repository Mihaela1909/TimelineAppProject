<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventOfDay, topicOf, displayText } from '../composables/useEventOfDay'
import { useToast } from '../composables/useToast'
import { TOPIC_STYLES } from '../constants/eventCategories'
import AppIcon from '../components/ui/AppIcon.vue'

// Browse any date in history. The date lives in the URL (?date=YYYY-MM-DD),
// so a date can be shared/bookmarked and the browser's back button works.
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { selectedDate, date, featured, alsoOnThisDay, loading, error, fetchFor, shiftDays, randomDate } = useEventOfDay()

const toIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
function parseIso(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '')
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : null
  return d && !isNaN(d) ? d : new Date() // invalid / missing → today
}

function goTo(d) {
  router.replace({ query: { ...route.query, date: toIso(d) } })
}
// URL → data (first load, back/forward, typed links)
watch(
  () => route.query.date,
  (value) => fetchFor(parseIso(value)),
  { immediate: false }
)
onMounted(() => fetchFor(parseIso(route.query.date)))

const isoValue = computed(() => toIso(selectedDate.value))
function onPick(e) {
  if (e.target.value) goTo(parseIso(e.target.value))
}

async function share() {
  const url = window.location.href
  const text = featured.value ? `${date.value.long}: ${featured.value.year} — ${featured.value.text}` : 'Event of the Day'
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Event of the Day · Timeline', text, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  } catch (err) {
    if (err?.name !== 'AbortError') toast.error('Could not share this page')
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-10">
    <article class="relative bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.25)] px-5 py-8 md:px-20 md:py-14">
      <!-- Dot waves: top as-is, bottom flipped (from the mockup) -->
      <img src="/images/event/dots-wave.webp" alt="" class="absolute inset-x-0 top-0 w-full h-auto pointer-events-none" />
      <img src="/images/event/dots-wave.webp" alt="" class="absolute inset-x-0 bottom-0 w-full h-auto -scale-y-100 pointer-events-none" />

      <div class="relative">
        <!-- Heading + share -->
        <div class="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 class="font-voice text-bark text-4xl md:text-6xl leading-tight">Event of the Day</h1>
            <p class="text-bark text-lg md:text-2xl">Browse any date in history</p>
          </div>
          <button
            type="button"
            class="font-sans flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-olive text-white font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 transition-colors"
            @click="share"
          >
            <AppIcon name="share" class="w-5 h-5" /> Share
          </button>
        </div>

        <!-- Date bar -->
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-2 border-olive rounded-lg bg-white px-3 md:px-6 py-2 mb-10">
          <span></span>
          <div class="flex items-center gap-3 md:gap-8">
            <button type="button" class="p-1 text-olive hover:text-bark" aria-label="Previous day" @click="goTo(shiftDays(-1))">
              <AppIcon name="chevron-left" class="w-7 h-7" />
            </button>
            <!-- The date text is a real date picker (transparent input on top) -->
            <label class="relative flex items-center gap-2 cursor-pointer font-bold text-bark md:text-xl">
              <AppIcon name="calendar" class="w-6 h-6 text-olive" />
              <span>{{ date.long }}</span>
              <input
                type="date"
                :value="isoValue"
                class="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Pick a date"
                @change="onPick"
              />
            </label>
            <button type="button" class="p-1 text-olive hover:text-bark" aria-label="Next day" @click="goTo(shiftDays(1))">
              <AppIcon name="chevron-right" class="w-7 h-7" />
            </button>
          </div>
          <button type="button" class="font-sans justify-self-end flex items-center gap-1.5 text-sm font-semibold text-olive hover:text-bark" @click="goTo(randomDate())">
            <AppIcon name="shuffle" class="w-4 h-4 md:hidden" />
            <span class="hidden md:inline">Get a random date</span>
            <span class="sr-only md:hidden">Get a random date</span>
          </button>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
          <p class="mb-3">{{ error }}</p>
          <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchFor(selectedDate)">Retry</button>
        </div>

        <template v-else>
          <!-- Featured event -->
          <section :key="isoValue" class="swap relative grid md:grid-cols-[minmax(0,22rem)_1fr] gap-6 md:gap-8 items-center bg-cream border border-ochre rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.2)] p-5 md:p-8 mb-16 md:mb-20" aria-label="Featured event">
            <!-- The home page frame image, cropped to the frame (no megaphone): x 6–69%, y 8.4–87.6% -->
            <div class="relative w-full max-w-[18rem] md:max-w-none mx-auto aspect-[683/657] overflow-hidden">
              <img src="/images/home/event-of-the-day.webp" alt="" class="absolute max-w-none w-[158.7%] left-[-9.5%] top-[-10.6%]" />
              <div class="absolute left-[15.9%] top-[9.6%] w-[68.3%] h-[77%] flex flex-col items-center justify-center gap-[0.15em] text-olive font-voice text-center leading-none">
                <span class="text-2xl md:text-3xl">{{ date.year }}</span>
                <span class="text-6xl md:text-7xl">{{ date.day }}</span>
                <span class="text-2xl md:text-3xl">{{ date.month }}</span>
              </div>
            </div>

            <div class="relative bg-white rounded-lg px-6 md:px-10 py-8 md:py-12 min-h-[12rem]">
              <h2 class="text-bark text-3xl md:text-5xl font-bold mb-3">FEATURED EVENT</h2>
              <div v-if="loading" class="space-y-3" aria-live="polite">
                <div class="h-6 w-20 bg-olive-light rounded animate-pulse"></div>
                <div class="h-5 bg-olive-light rounded animate-pulse"></div>
                <div class="h-5 w-2/3 bg-olive-light rounded animate-pulse"></div>
              </div>
              <template v-else-if="featured">
                <p class="text-ochre text-2xl font-bold">{{ featured.year }}</p>
                <p class="font-button text-bark text-xl md:text-2xl leading-snug mb-5">{{ featured.text }}</p>
                <div class="flex flex-wrap items-center gap-4">
                  <span class="px-6 py-1 rounded-md font-semibold" :class="TOPIC_STYLES[topicOf(featured)]">{{ topicOf(featured) }}</span>
                  <a v-if="featured.url" :href="featured.url" target="_blank" rel="noopener" class="text-sm text-olive underline hover:text-bark">
                    Read on Wikipedia<span class="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </template>
              <p v-else class="text-bark/60">No events found for this date.</p>
            </div>

            <img src="/images/home/books.webp" alt="" class="books hidden md:block absolute right-[-4%] bottom-[-18%] w-[22%] max-w-[15rem] pointer-events-none" />
          </section>

          <!-- Also on this day -->
          <section v-if="!loading && alsoOnThisDay.length" :key="`also-${isoValue}`" class="swap">
            <h2 class="text-bark text-2xl md:text-3xl font-bold mb-4">Also on this day</h2>
            <ul class="space-y-4">
              <li v-for="item in alsoOnThisDay" :key="item.text">
                <a
                  :href="item.url || undefined"
                  target="_blank"
                  rel="noopener"
                  class="flex flex-wrap md:flex-nowrap items-center gap-x-3 gap-y-2 md:gap-5 bg-cream border border-ochre rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.2)] px-4 md:px-6 py-3 md:py-4 hover:bg-white transition-colors"
                  :class="{ 'pointer-events-none': !item.url }"
                >
                  <span class="text-ochre text-lg md:text-2xl font-bold w-14 md:w-20 flex-shrink-0">{{ item.year }}</span>
                  <span class="hidden md:inline text-bark/40 text-2xl" aria-hidden="true">|</span>
                  <!-- Phones: the text drops to its own full-width line under year + badge -->
                  <span class="order-last md:order-none basis-full md:basis-auto flex-1 text-bark md:text-xl">{{ displayText(item) }}</span>
                  <span class="ml-auto md:ml-0 px-4 md:px-6 py-1 rounded-md text-sm md:text-base font-semibold flex-shrink-0" :class="TOPIC_STYLES[topicOf(item)]">{{ topicOf(item) }}</span>
                </a>
              </li>
            </ul>
          </section>
        </template>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* Changing the date: the featured block + list fade in; books pop */
.swap {
  animation: swap-in 0.35s ease-out;
}
.books {
  animation: books-pop 0.5s cubic-bezier(0.3, 1.5, 0.5, 1) 0.15s backwards;
}
@keyframes swap-in {
  from { opacity: 0; transform: translateY(8px); }
}
@keyframes books-pop {
  from { opacity: 0; transform: translateY(18px) scale(0.85); }
}
@media (prefers-reduced-motion: reduce) {
  .swap,
  .books {
    animation: none;
  }
}
</style>
