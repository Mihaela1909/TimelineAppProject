<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuizzes } from '../composables/useQuizzes'
import { useCourses } from '../composables/useCourses'
import { useQuizStatuses } from '../composables/useQuizStatuses'
import { useAuth } from '../composables/useAuth'
import { getImagePreviewUrl } from '../services/mediaService'
import QuizzesHero from '../components/quizzes/QuizzesHero.vue'
import QuizCard from '../components/quizzes/QuizCard.vue'
import PaginationNav from '../components/ui/PaginationNav.vue'
import AppIcon from '../components/ui/AppIcon.vue'

const PAGE_SIZE = 6

const { quizzes, loading, error, fetchPublished } = useQuizzes()
// Published courses only — this is a public page, so it must not load drafts.
const { courses, fetchAllPublished: fetchCourses } = useCourses()
const { fetchFor: fetchStatuses, statusFor } = useQuizStatuses()
const { currentUser } = useAuth()

const searchTerm = ref('')
const activeCategory = ref('All')
const sortBy = ref('az')
const page = ref(1)

const SORTS = [
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
  { value: 'newest', label: 'Newest' },
]

onMounted(() => {
  fetchCourses()
  fetchPublished()
  fetchStatuses(currentUser.value?.$id)
})

const courseById = computed(() => Object.fromEntries(courses.value.map((c) => [c.$id, c])))

// Quizzes have no category of their own: they use their linked course's.
const categoryOf = (quiz) => courseById.value[quiz.courseId]?.category || null
const categories = computed(() => ['All', ...new Set(quizzes.value.map(categoryOf).filter(Boolean))])

const filteredQuizzes = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const list = quizzes.value.filter((quiz) => {
    const matchesCategory = activeCategory.value === 'All' || categoryOf(quiz) === activeCategory.value
    return matchesCategory && quiz.title.toLowerCase().includes(term)
  })
  const sorters = {
    az: (a, b) => a.title.localeCompare(b.title),
    za: (a, b) => b.title.localeCompare(a.title),
    newest: (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt),
  }
  return [...list].sort(sorters[sortBy.value])
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredQuizzes.value.length / PAGE_SIZE)))
const pagedQuizzes = computed(() => filteredQuizzes.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// Card animation (same as the courses page): stagger on first load, quick fade on changes.
const gridKey = ref(0)
const firstLoad = ref(true)
watch([searchTerm, activeCategory, sortBy, page], () => {
  firstLoad.value = false
  gridKey.value++
})
// RESET: any change to search / filter / sort starts again from page 1.
watch([searchTerm, activeCategory, sortBy], () => (page.value = 1))

function imageFor(quiz) {
  const id = quiz.coverImageId || courseById.value[quiz.courseId]?.coverImageId
  return id ? getImagePreviewUrl(id) : null
}

// Status pill + buttons for one quiz, from the user's results.
function cardProps(quiz) {
  const quizLink = `/quizzes/${quiz.$id}`
  const course = courseById.value[quiz.courseId]
  const status = statusFor(quiz, !!currentUser.value)
  const base = {
    image: imageFor(quiz),
    title: quiz.title,
    courseTitle: course?.title || '',
    courseTo: course ? `/courses/${course.$id}` : '',
  }
  switch (status?.state) {
    case 'passed':
      return { ...base, status: { label: `Passed · ${status.score}%`, tone: 'leaf' }, action: { label: 'Retake Quiz', to: quizLink } }
    case 'failed':
      return { ...base, status: { label: `Failed · ${status.score}%`, tone: 'ochre' }, action: { label: 'Retake Quiz', to: quizLink } }
    case 'course-unfinished':
      return {
        ...base,
        status: { label: 'Course not completed', tone: 'wine' },
        action: { label: 'Finish Course', to: base.courseTo },
        secondary: { label: 'Start anyway', to: quizLink },
      }
    case 'not-attempted':
      return { ...base, status: { label: 'Not attempted', tone: 'taupe' }, action: { label: 'Start Quiz', to: quizLink } }
    default:
      return { ...base, action: { label: 'Start Quiz', to: quizLink } } // guests
  }
}
</script>

<template>
  <div>
    <QuizzesHero />

    <div class="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <!-- Search + sort -->
      <div class="flex gap-3 md:gap-5 mb-4">
        <label class="relative flex-1">
          <span class="sr-only">Search quizzes</span>
          <AppIcon name="search" class="w-5 h-5 text-bark/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Search quizzes..."
            class="w-full pl-12 pr-4 py-2.5 md:py-3 bg-white border border-field-border rounded-md text-base text-bark placeholder:text-bark/50 shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
          />
        </label>
        <label class="relative">
          <span class="sr-only">Sort quizzes</span>
          <select
            v-model="sortBy"
            class="appearance-none h-full pl-3 md:pl-4 pr-8 md:pr-10 py-2.5 md:py-3 bg-white border border-field-border rounded-md text-xs md:text-base font-semibold text-ochre shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 cursor-pointer"
          >
            <option v-for="s in SORTS" :key="s.value" :value="s.value">Sort: {{ s.label }}</option>
          </select>
          <AppIcon name="chevron" class="w-4 h-4 md:w-5 md:h-5 text-ochre absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </label>
      </div>

      <!-- Category pills (from each quiz's course) -->
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
      <div v-if="loading" class="grid md:grid-cols-2 gap-6 md:gap-10" aria-live="polite">
        <div v-for="n in 4" :key="n" class="h-56 rounded-xl bg-white animate-pulse"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
        <p class="mb-3">{{ error }}</p>
        <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchPublished">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredQuizzes.length === 0" class="bg-white rounded-lg p-12 text-center text-sm text-bark/60">
        <template v-if="quizzes.length === 0">No quizzes yet. Check back soon.</template>
        <template v-else>
          No quizzes match<span v-if="searchTerm.trim()"> "{{ searchTerm.trim() }}"</span><span v-if="activeCategory !== 'All'"> in {{ activeCategory }}</span>.
        </template>
      </div>

      <!-- Results -->
      <template v-else>
        <div :key="gridKey" class="grid md:grid-cols-2 gap-6 md:gap-10 mb-12" :class="firstLoad ? 'cards-stagger' : 'cards-swap'">
          <QuizCard v-for="quiz in pagedQuizzes" :key="quiz.$id" v-bind="cardProps(quiz)" />
        </div>
        <PaginationNav v-model="page" :page-count="pageCount" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.cards-stagger > * {
  animation: card-in 0.6s ease-out backwards;
}
.cards-stagger > :nth-child(2) { animation-delay: 0.08s; }
.cards-stagger > :nth-child(3) { animation-delay: 0.16s; }
.cards-stagger > :nth-child(4) { animation-delay: 0.24s; }
.cards-stagger > :nth-child(5) { animation-delay: 0.32s; }
.cards-stagger > :nth-child(6) { animation-delay: 0.4s; }
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
