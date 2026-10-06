<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCourses } from '../composables/useCourses'
import { useCourseStatuses } from '../composables/useCourseStatuses'
import { useAuth } from '../composables/useAuth'
import { getImagePreviewUrl } from '../services/mediaService'
import CoursesHero from '../components/courses/CoursesHero.vue'
import HistoryCard from '../components/ui/HistoryCard.vue'
import PaginationNav from '../components/ui/PaginationNav.vue'
import AppIcon from '../components/ui/AppIcon.vue'

const PAGE_SIZE = 6

const { courses, loading, error, fetchAllPublished } = useCourses()
const { statusById, fetchFor: fetchStatuses } = useCourseStatuses()
const { currentUser } = useAuth()

const searchTerm = ref('')
const activeCategory = ref('All')
const sortBy = ref('newest')
const page = ref(1)

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'A–Z' },
  { value: 'lessons', label: 'Most lessons' },
]

onMounted(() => {
  fetchAllPublished()
  fetchStatuses(currentUser.value?.$id)
})

const categories = computed(() => ['All', ...new Set(courses.value.map((c) => c.category).filter(Boolean))])

const filteredCourses = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const list = courses.value.filter((course) => {
    const matchesCategory = activeCategory.value === 'All' || course.category === activeCategory.value
    return matchesCategory && course.title.toLowerCase().includes(term)
  })
  const sorters = {
    newest: (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt),
    az: (a, b) => a.title.localeCompare(b.title),
    lessons: (a, b) => (b.lessonCount || 0) - (a.lessonCount || 0),
  }
  return [...list].sort(sorters[sortBy.value])
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredCourses.value.length / PAGE_SIZE)))
const pagedCourses = computed(() => filteredCourses.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// Card animation: the first set of cards fades up one by one; after that, any
// change to the results (search / category / sort / page) gives the grid a
// quick fade, so it's clear the list changed. Changing the key re-mounts the grid.
const gridKey = ref(0)
const firstLoad = ref(true)
watch([searchTerm, activeCategory, sortBy, page], () => {
  firstLoad.value = false
  gridKey.value++
})

// RESET: any change to search / filter / sort starts again from page 1.
watch([searchTerm, activeCategory, sortBy], () => (page.value = 1))

// "Ancient Egypt" → white band "Ancient", olive band "Egypt" (same as the home page cards).
function splitTitle(title = '') {
  const [first, ...rest] = title.trim().split(/\s+/)
  return rest.length ? { label: first, title: rest.join(' ') } : { label: '', title: first }
}
const lessonsText = (n) => (n ? `${n} lesson${n === 1 ? '' : 's'}` : '')

function statusBadge(courseId) {
  const status = statusById.value[courseId]
  if (!status) return {}
  return status.state === 'completed'
    ? { badge: 'Completed', badgeTone: 'leaf' }
    : { badge: 'In Progress', badgeTone: 'ochre', progress: status.ratio }
}
</script>

<template>
  <div>
    <CoursesHero />

    <div class="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <!-- Search + sort -->
      <div class="flex gap-3 md:gap-5 mb-4">
        <label class="relative flex-1">
          <span class="sr-only">Search courses</span>
          <AppIcon name="search" class="w-5 h-5 text-bark/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Search courses..."
            class="w-full pl-12 pr-4 py-2.5 md:py-3 bg-white border border-field-border rounded-md text-base text-bark placeholder:text-bark/50 shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
          />
        </label>
        <label class="relative">
          <span class="sr-only">Sort courses</span>
          <select
            v-model="sortBy"
            class="appearance-none h-full pl-3 md:pl-4 pr-8 md:pr-10 py-2.5 md:py-3 bg-white border border-field-border rounded-md text-xs md:text-base font-semibold text-ochre shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 cursor-pointer"
          >
            <option v-for="s in SORTS" :key="s.value" :value="s.value">Sort: {{ s.label }}</option>
          </select>
          <AppIcon name="chevron" class="w-4 h-4 md:w-5 md:h-5 text-ochre absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </label>
      </div>

      <!-- Category pills (scroll sideways on phones) -->
      <div class="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap mb-8 md:mb-12 [scrollbar-width:none]" role="group" aria-label="Filter by category">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="flex-shrink-0 px-5 py-1 rounded-full text-base border shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-colors"
          :class="activeCategory === cat ? 'bg-olive text-white border-olive font-semibold' : 'bg-white text-olive border-bark/30 hover:bg-parchment'"
          :aria-pressed="activeCategory === cat"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" aria-live="polite">
        <div v-for="n in 6" :key="n" class="h-56 rounded-xl bg-white animate-pulse"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
        <p class="mb-3">{{ error }}</p>
        <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAllPublished">Retry</button>
      </div>

      <!-- Empty (search / filter has no matches) -->
      <div v-else-if="filteredCourses.length === 0" class="bg-white rounded-lg p-12 text-center text-sm text-bark/60">
        No courses match<span v-if="searchTerm.trim()"> "{{ searchTerm.trim() }}"</span><span v-if="activeCategory !== 'All'"> in {{ activeCategory }}</span>.
      </div>

      <!-- Results -->
      <template v-else>
        <div :key="gridKey" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12" :class="firstLoad ? 'cards-stagger' : 'cards-swap'">
          <HistoryCard
            v-for="course in pagedCourses"
            :key="course.$id"
            layout="grid"
            :to="`/courses/${course.$id}`"
            :image="course.coverImageId ? getImagePreviewUrl(course.coverImageId) : null"
            :label="splitTitle(course.title).label"
            :title="splitTitle(course.title).title"
            :meta="lessonsText(course.lessonCount)"
            label-large
            v-bind="statusBadge(course.$id)"
          />
        </div>
        <PaginationNav v-model="page" :page-count="pageCount" />
      </template>
    </div>
  </div>
</template>

<style scoped>
/* First load: cards fade up one after another */
.cards-stagger > * {
  animation: card-in 0.6s ease-out backwards;
}
.cards-stagger > :nth-child(2) { animation-delay: 0.08s; }
.cards-stagger > :nth-child(3) { animation-delay: 0.16s; }
.cards-stagger > :nth-child(4) { animation-delay: 0.24s; }
.cards-stagger > :nth-child(5) { animation-delay: 0.32s; }
.cards-stagger > :nth-child(6) { animation-delay: 0.4s; }

/* Results changed: one quick fade for the whole grid */
.cards-swap {
  animation: swap-in 0.25s ease-out;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(14px); }
}
@keyframes swap-in {
  from { opacity: 0; transform: translateY(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .cards-stagger > *,
  .cards-swap {
    animation: none;
  }
}
</style>
