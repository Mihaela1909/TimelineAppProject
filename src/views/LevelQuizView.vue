<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useLevelQuiz, QUESTIONS_PER_COURSE } from '../composables/useLevelQuiz'
import AppIcon from '../components/ui/AppIcon.vue'
import StatBoxes from '../components/ui/StatBoxes.vue'
import QuizQuestion from '../components/quizzes/QuizQuestion.vue'
import LevelQuizResults from '../components/quizzes/LevelQuizResults.vue'
import { estimatedMinutes } from '../utils/quizScore'

// "Test your knowledge" from the home page: a mixed quiz from every course,
// ending with a level and a recommended course. Same look as a normal quiz page.
const { currentUser } = useAuth()
const {
  questions,
  loading,
  error,
  phase,
  currentIndex,
  selectedIndex,
  answered,
  currentQuestion,
  isLastQuestion,
  courseCount,
  courseById,
  result,
  load,
  start,
  selectOption,
  submitAnswer,
  nextQuestion,
  retake,
} = useLevelQuiz()

const reload = () => load(currentUser.value?.$id)
onMounted(reload)
</script>

<template>
  <div class="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">
    <RouterLink to="/quizzes" class="inline-flex items-center gap-2 text-sm text-bark hover:text-olive mb-6">
      <AppIcon name="arrow-left" class="w-4 h-4" /> Back to All Quizzes
    </RouterLink>

    <article class="relative bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <div class="relative h-32 md:h-[clamp(10rem,20vw,20rem)] bg-umber shadow-[0_4px_8px_rgba(0,0,0,0.3)]" aria-hidden="true">
        <img src="/images/quizzes/quizbg.webp" alt="" class="w-full h-full object-cover object-bottom grayscale" />
        <div class="absolute inset-x-0 bottom-0 h-1/3" style="background-image: linear-gradient(to top, rgb(var(--color-umber)) 0%, rgb(var(--color-umber) / 0) 100%)"></div>
      </div>

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
            <button class="px-4 py-2 rounded-md border border-red-400" @click="reload">Retry</button>
          </div>

          <div v-else-if="questions.length === 0" class="text-center text-bark/70 py-10">
            There are no quiz questions yet, so we can't check your level.
            <RouterLink to="/courses" class="text-olive font-semibold hover:underline">Browse the courses →</RouterLink>
          </div>

          <Transition v-else name="phase" mode="out-in">
            <!-- Intro -->
            <div v-if="phase === 'start'" key="start" class="text-center">
              <h1 class="font-voice text-bark text-3xl md:text-5xl mb-4">What's your history level?</h1>
              <p class="text-bark/80 text-lg max-w-2xl mx-auto mb-8">
                {{ QUESTIONS_PER_COURSE }} questions from each of our courses. At the end you'll see your level and the course we'd recommend.
                No account needed, and nothing is saved.
              </p>
              <StatBoxes
                class="flex justify-center gap-4 md:gap-8 mb-10"
                item-class="w-24 md:w-36"
                :stats="[
                  { value: questions.length, label: 'Questions' },
                  { value: `~${estimatedMinutes(questions.length)} min`, label: 'Est. time' },
                  { value: courseCount, label: courseCount === 1 ? 'Course' : 'Courses' },
                ]"
              />
              <button
                type="button"
                class="font-button w-full max-w-xs py-3 rounded-md bg-olive text-white text-xl shadow-[0_4px_8px_rgba(0,0,0,0.35)] hover:bg-olive/90 transition-colors"
                @click="start"
              >
                Start
              </button>
            </div>

            <!-- Each question shows which course it comes from -->
            <QuizQuestion
              v-else-if="phase === 'question'"
              :key="`q${currentIndex}`"
              :question="currentQuestion"
              :index="currentIndex"
              :total="questions.length"
              :course-title="courseById[currentQuestion.courseId]?.title || ''"
              :selected-index="selectedIndex"
              :answered="answered"
              :is-last="isLastQuestion"
              @select="selectOption"
              @submit="submitAnswer"
              @next="nextQuestion"
            />

            <LevelQuizResults v-else-if="result" key="results" :result="result" @retake="retake" />
          </Transition>
        </div>
      </div>
    </article>
  </div>
</template>
