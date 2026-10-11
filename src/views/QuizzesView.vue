<script setup>
import { computed, onMounted } from 'vue'
import { useQuizzes } from '../composables/useQuizzes'
import { useCourses } from '../composables/useCourses'
import { useQuizStatuses } from '../composables/useQuizStatuses'
import { useAuth } from '../composables/useAuth'
import { getImagePreviewUrl } from '../services/mediaService'
import QuizzesHero from '../components/quizzes/QuizzesHero.vue'
import QuizCard from '../components/quizzes/QuizCard.vue'
import PaginationNav from '../components/ui/PaginationNav.vue'
import ListControls from '../components/ui/ListControls.vue'
import { useListControls, byNewest, byTitle } from '../composables/useListControls'

const PAGE_SIZE = 6

const { quizzes, loading, error, fetchPublished } = useQuizzes()
// Published courses only — this is a public page, so it must not load drafts.
const { courses, fetchPublished: fetchCourses } = useCourses()
const { fetchFor: fetchStatuses, statusFor } = useQuizStatuses()
const { currentUser } = useAuth()

const SORTS = [
  { value: 'az', label: 'A–Z', compare: byTitle },
  { value: 'za', label: 'Z–A', compare: (a, b) => byTitle(b, a) },
  { value: 'newest', label: 'Newest', compare: byNewest },
]

onMounted(() => {
  fetchCourses()
  fetchPublished()
  fetchStatuses(currentUser.value?.$id)
})

const courseById = computed(() => Object.fromEntries(courses.value.map((c) => [c.$id, c])))

// Quizzes have no category of their own: they use their linked course's.
const categoryOf = (quiz) => courseById.value[quiz.courseId]?.category || null

const { searchTerm, activeCategory, sortBy, page, categories, filtered: filteredQuizzes, paged: pagedQuizzes, pageCount, gridKey, firstLoad } =
  useListControls(quizzes, { sorts: SORTS, pageSize: PAGE_SIZE, categoryOf })

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
      <ListControls
        v-model:search="searchTerm"
        v-model:sort="sortBy"
        v-model:category="activeCategory"
        noun="quizzes"
        :sorts="SORTS"
        :categories="categories"
      />

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
