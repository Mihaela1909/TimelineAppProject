<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useQuizTaking } from '../composables/useQuizTaking'
import { useCourseProgress } from '../composables/useCourseProgress'
import { getImagePreviewUrl } from '../services/mediaService'
import { timeAgo } from '../utils/time'
import QuizIntro from '../components/quizzes/QuizIntro.vue'
import QuizQuestion from '../components/quizzes/QuizQuestion.vue'
import QuizResults from '../components/quizzes/QuizResults.vue'
import AppIcon from '../components/ui/AppIcon.vue'

const DEFAULT_PASSING_SCORE = 70
const MINUTES_PER_QUESTION = 0.4

const route = useRoute()
const { currentUser } = useAuth()
const {
  quiz,
  course,
  questions,
  pastAttempts,
  courseLessonCount,
  loading,
  error,
  phase,
  currentIndex,
  selectedIndex,
  answered,
  correctCount,
  currentQuestion,
  isLastQuestion,
  fetchQuiz,
  startQuiz,
  selectOption,
  submitAnswer,
  nextQuestion,
  retake,
} = useQuizTaking()
const { completedLessonIds, fetchCompleted } = useCourseProgress()

async function load() {
  await fetchQuiz(route.params.id, currentUser.value?.$id)
  if (quiz.value?.courseId) fetchCompleted(currentUser.value?.$id, quiz.value.courseId)
}
onMounted(load)

const isLoggedIn = computed(() => !!currentUser.value)
const passingScore = computed(() => quiz.value?.passingScore || DEFAULT_PASSING_SCORE)
const courseTo = computed(() => (course.value ? `/courses/${course.value.$id}` : ''))
const banner = computed(() => {
  const id = quiz.value?.headerImageId || quiz.value?.coverImageId || course.value?.headerImageId || course.value?.coverImageId
  return id ? getImagePreviewUrl(id) : null
})

// "Course not completed" = logged in, the quiz has a course, and not every lesson is done.
const courseDone = computed(() => Math.min(completedLessonIds.value.length, courseLessonCount.value))
const courseUnfinished = computed(
  () => isLoggedIn.value && !!course.value && courseLessonCount.value > 0 && courseDone.value < courseLessonCount.value
)

// Best attempt (by %) + summary for "Your history with this quiz".
const history = computed(() => {
  if (!pastAttempts.value.length) return null
  const pctOf = (a) => (a.totalQuestions ? Math.round((a.score / a.totalQuestions) * 100) : 0)
  const best = pastAttempts.value.reduce((b, a) => (pctOf(a) > pctOf(b) ? a : b))
  const last = pastAttempts.value.reduce((l, a) => (new Date(a.$createdAt) > new Date(l.$createdAt) ? a : l))
  return { best: best.score, bestOf: best.totalQuestions, bestPct: pctOf(best), attempts: pastAttempts.value.length, last: timeAgo(last.$createdAt) }
})

const status = computed(() => {
  if (courseUnfinished.value) return { label: 'Course not completed', tone: 'wine' }
  if (history.value) return history.value.bestPct >= passingScore.value
    ? { label: `Passed · ${history.value.bestPct}%`, tone: 'leaf' }
    : { label: `Failed · ${history.value.bestPct}%`, tone: 'ochre' }
  return null
})

const description = computed(() => quiz.value?.description || (course.value ? `Test what you learned in ${course.value.title}.` : ''))
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-bark mb-6" aria-label="Breadcrumb">
      <AppIcon name="arrow-left" class="w-4 h-4" />
      <RouterLink to="/quizzes" class="hover:text-olive">Back to All Quizzes</RouterLink>
      <template v-if="course">
        <span class="text-bark/50">/</span>
        <RouterLink :to="courseTo" class="font-semibold text-olive hover:underline">{{ course.title }}</RouterLink>
      </template>
    </nav>

    <article class="relative bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <!-- Banner (quiz header → cover → course image), grayscale with the umber fade -->
      <div class="relative h-32 md:h-[clamp(10rem,20vw,20rem)] bg-umber shadow-[0_4px_8px_rgba(0,0,0,0.3)]" aria-hidden="true">
        <img v-if="banner" :src="banner" alt="" class="w-full h-full object-cover grayscale" />
        <div class="absolute inset-x-0 bottom-0 h-1/3" style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 100%)"></div>
      </div>

      <!-- Body, with the dot pattern from "Who are we" on the right -->
      <div class="relative px-5 py-10 md:px-16 md:py-16">
        <img src="/images/home/who-are-we/dots.webp" alt="" class="absolute right-0 top-0 h-full w-auto max-w-none opacity-60 pointer-events-none" />

        <div class="relative">
          <div v-if="loading" class="max-w-3xl mx-auto space-y-4" aria-live="polite">
            <div class="h-8 w-48 mx-auto bg-olive-light rounded animate-pulse"></div>
            <div class="h-16 bg-olive-light rounded animate-pulse"></div>
            <div class="h-24 bg-olive-light rounded animate-pulse"></div>
          </div>

          <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
            <p class="mb-3">{{ error }}</p>
            <button class="px-4 py-2 rounded-md border border-red-400" @click="load">Retry</button>
          </div>

          <div v-else-if="questions.length === 0" class="text-center text-bark/60 py-10">This quiz doesn't have any questions yet.</div>

          <!-- Each phase fades in when it changes (keyed). Only rendered once the quiz has loaded. -->
          <Transition v-else name="phase" mode="out-in">
            <QuizIntro
              v-if="phase === 'start'"
              key="start"
              :title="quiz.title"
              :description="description"
              :status="status"
              :question-count="questions.length"
              :minutes="Math.max(1, Math.round(questions.length * MINUTES_PER_QUESTION))"
              :passing-score="passingScore"
              :button-label="history ? 'Retake Quiz' : 'Start Quiz'"
              :finish-course-to="courseUnfinished ? courseTo : ''"
              :history="history"
              :course-progress="courseUnfinished ? { done: courseDone, total: courseLessonCount } : null"
              :is-logged-in="isLoggedIn"
              @start="startQuiz"
            />
            <QuizQuestion
              v-else-if="phase === 'question'"
              :key="`q${currentIndex}`"
              :question="currentQuestion"
              :index="currentIndex"
              :total="questions.length"
              :course-title="course?.title || ''"
              :course-to="courseTo"
              :selected-index="selectedIndex"
              :answered="answered"
              :is-last="isLastQuestion"
              @select="selectOption"
              @submit="submitAnswer"
              @next="nextQuestion(currentUser?.$id)"
            />
            <QuizResults
              v-else-if="phase === 'results'"
              key="results"
              :correct="correctCount"
              :total="questions.length"
              :passing-score="passingScore"
              :course-to="courseTo"
              :is-logged-in="isLoggedIn"
              @retake="retake"
            />
          </Transition>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.phase-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
.phase-leave-active {
  transition: opacity 0.15s ease-in;
}
.phase-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.phase-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .phase-enter-active,
  .phase-leave-active {
    transition: none;
  }
}
</style>
