<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useQuizTaking } from '../composables/useQuizTaking'
import { getImagePreviewUrl } from '../services/mediaService'

const route = useRoute()
const { currentUser } = useAuth()
const {
  quiz,
  course,
  questions,
  pastAttempts,
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

onMounted(() => fetchQuiz(route.params.id, currentUser.value?.$id))

const bestScore = () =>
  pastAttempts.value.length
    ? Math.max(...pastAttempts.value.map((a) => Math.round((a.score / a.totalQuestions) * 100)))
    : null
</script>

<template>
  <div class="max-w-md mx-auto px-6 py-10">
    <div v-if="loading" class="space-y-3" aria-live="polite">
      <div class="h-8 bg-white rounded-lg animate-pulse"></div>
      <div class="h-40 bg-white rounded-lg animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm">
      {{ error }}
    </div>

    <div v-else-if="questions.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
      This quiz doesn't have any questions yet.
    </div>

    <!-- START -->
    <div v-else-if="phase === 'start'" class="bg-white rounded-2xl p-8 text-center">
      <img
        v-if="quiz.headerImageId || quiz.coverImageId"
        :src="getImagePreviewUrl(quiz.headerImageId || quiz.coverImageId)"
        :alt="quiz.title"
        class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4"
      />
      <div
        v-else
        class="w-14 h-14 rounded-full bg-olive-light flex items-center justify-center text-olive text-xl font-voice mx-auto mb-4"
      >
        ?
      </div>
      <h1 class="font-voice text-xl text-bark mb-1">{{ quiz.title }}</h1>
      <p v-if="course" class="text-xs text-bark/50 mb-5">{{ course.title }}</p>

      <div class="flex justify-center gap-6 mb-6 text-sm">
        <div><div class="font-semibold text-bark">{{ questions.length }}</div><div class="text-xs text-bark/50">questions</div></div>
        <div><div class="font-semibold text-bark">{{ quiz.passingScore }}%</div><div class="text-xs text-bark/50">to pass</div></div>
      </div>

      <div v-if="pastAttempts.length" class="bg-cream rounded-lg p-4 mb-6 text-left text-xs">
        <div class="text-bark/50 mb-1 uppercase tracking-wide">Your history</div>
        <div class="flex justify-between"><span>Best score</span><span class="font-medium text-olive">{{ bestScore() }}%</span></div>
        <div class="flex justify-between"><span>Attempts</span><span class="font-medium">{{ pastAttempts.length }}</span></div>
      </div>
      <div v-else-if="currentUser" class="text-xs text-bark/50 mb-6">First attempt — good luck!</div>
      <div v-else class="text-xs text-bark/50 mb-6">Log in to save your score.</div>

      <button class="px-6 py-2.5 bg-olive text-white rounded-lg text-sm font-medium" @click="startQuiz">
        {{ pastAttempts.length ? 'Retake Quiz' : 'Start Quiz' }}
      </button>
    </div>

    <!-- QUESTION -->
    <div v-else-if="phase === 'question'" class="bg-white rounded-2xl p-6">
      <div class="flex items-center gap-2 mb-5">
        <span class="text-xs text-bark/50 whitespace-nowrap">Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
        <div class="flex-1 h-1 bg-black/5 rounded-full">
          <div class="h-full bg-olive rounded-full" :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"></div>
        </div>
      </div>

      <div class="text-base font-semibold text-bark text-center mb-5">{{ currentQuestion.questionText }}</div>

      <div class="space-y-2 mb-4">
        <div
          v-for="(option, i) in currentQuestion.options"
          :key="i"
          class="border rounded-lg px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors"
          :class="[
            !answered && selectedIndex === i && 'border-olive bg-olive-light/40',
            !answered && selectedIndex !== i && 'border-black/10',
            answered && i === currentQuestion.correctOptionIndex && 'border-olive bg-olive-light text-bark',
            answered && i === selectedIndex && i !== currentQuestion.correctOptionIndex && 'border-red-300 bg-red-50 text-red-700',
            answered && i !== selectedIndex && i !== currentQuestion.correctOptionIndex && 'border-black/10 text-bark/40',
          ]"
          @click="selectOption(i)"
        >
          {{ option }}
          <span v-if="answered && i === currentQuestion.correctOptionIndex">✓</span>
          <span v-else-if="answered && i === selectedIndex">✕</span>
        </div>
      </div>

      <button
        v-if="!answered"
        class="w-full py-2.5 bg-olive text-white rounded-lg text-sm font-medium disabled:opacity-40"
        :disabled="selectedIndex === null"
        @click="submitAnswer"
      >
        Submit Answer
      </button>
      <button
        v-else
        class="w-full py-2.5 bg-olive text-white rounded-lg text-sm font-medium"
        @click="nextQuestion(currentUser?.$id)"
      >
        {{ isLastQuestion ? 'See Results' : 'Next Question →' }}
      </button>
    </div>

    <!-- RESULTS -->
    <div v-else-if="phase === 'results'" class="bg-white rounded-2xl p-8 text-center">
      <div class="text-3xl mb-2">🏆</div>
      <div class="text-xs text-bark/50 mb-1">Quiz complete</div>
      <div class="text-3xl font-bold text-bark mb-2">{{ correctCount }} / {{ questions.length }}</div>
      <span
        class="inline-block text-xs px-3 py-1 rounded-full mb-6"
        :class="Math.round((correctCount / questions.length) * 100) >= quiz.passingScore
          ? 'bg-olive-light text-olive'
          : 'bg-butter text-bark'"
      >
        {{ Math.round((correctCount / questions.length) * 100) }}%
        {{ Math.round((correctCount / questions.length) * 100) >= quiz.passingScore ? '· Passed' : '· Below passing score' }}
      </span>

      <div class="flex flex-col gap-2">
        <button class="py-2.5 bg-olive text-white rounded-lg text-sm font-medium" @click="retake">
          Retake Quiz
        </button>
        <RouterLink
          v-if="course"
          :to="`/courses/${course.$id}`"
          class="py-2.5 border border-olive text-olive rounded-lg text-sm font-medium"
        >
          Back to Course
        </RouterLink>
      </div>
    </div>
  </div>
</template>