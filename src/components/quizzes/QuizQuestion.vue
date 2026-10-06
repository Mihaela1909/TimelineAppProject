<script setup>
import { computed } from 'vue'

// One question (mockup): "Question N of M" + course link + green progress bar,
// the question, a 2×2 grid of answers, then Submit → feedback → Next.
// Dumb component: the page owns the quiz state and passes it in.
const props = defineProps({
  question: { type: Object, required: true }, // { questionText, options, correctOptionIndex, explanation? }
  index: { type: Number, required: true }, // 0-based
  total: { type: Number, required: true },
  courseTitle: { type: String, default: '' },
  courseTo: { type: String, default: '' },
  selectedIndex: { type: Number, default: null },
  answered: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
})
const emit = defineEmits(['select', 'submit', 'next'])

const isCorrect = computed(() => props.selectedIndex === props.question.correctOptionIndex)
const correctText = computed(() => props.question.options[props.question.correctOptionIndex])

function optionClass(i) {
  const q = props.question
  if (!props.answered) {
    return props.selectedIndex === i ? 'bg-olive text-white border-olive' : 'bg-white text-olive border-olive hover:bg-olive-light/50'
  }
  if (i === q.correctOptionIndex) return 'bg-leaf/25 text-leaf border-leaf'
  if (i === props.selectedIndex) return 'bg-red-100 text-red-700 border-red-600'
  return 'bg-white text-olive border-olive opacity-70'
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Progress -->
    <div class="flex items-start gap-6 md:gap-12 mb-10 md:mb-14">
      <div class="whitespace-nowrap">
        <div class="text-bark text-lg md:text-xl">Question {{ index + 1 }} of {{ total }}</div>
        <RouterLink v-if="courseTitle && courseTo" :to="courseTo" class="text-xs text-ochre underline hover:text-bark">{{ courseTitle }}</RouterLink>
      </div>
      <div class="flex-1 h-2 mt-3 bg-black/10 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="index + 1" aria-valuemin="1" :aria-valuemax="total" aria-label="Quiz progress">
        <div class="h-full bg-leaf rounded-full transition-[width] duration-500" :style="{ width: `${((index + 1) / total) * 100}%` }"></div>
      </div>
    </div>

    <h1 class="font-voice text-bark text-2xl md:text-4xl leading-tight text-center mb-10 md:mb-14">{{ question.questionText }}</h1>

    <!-- Answers -->
    <div class="grid sm:grid-cols-2 gap-4 md:gap-x-10 md:gap-y-6 mb-8" role="radiogroup" :aria-label="question.questionText">
      <button
        v-for="(option, i) in question.options"
        :key="i"
        type="button"
        role="radio"
        :aria-checked="selectedIndex === i"
        :disabled="answered"
        class="font-sans text-lg md:text-2xl font-semibold px-4 py-4 md:py-5 rounded-2xl border-[3px] shadow-[0_4px_8px_rgba(0,0,0,0.3)] transition-colors disabled:cursor-default"
        :class="optionClass(i)"
        @click="emit('select', i)"
      >
        {{ option }}
      </button>
    </div>

    <!-- Feedback -->
    <div
      v-if="answered"
      class="feedback max-w-2xl mx-auto mb-8 rounded-lg px-6 py-6 text-center text-lg"
      :class="isCorrect ? 'bg-leaf/25 text-leaf' : 'bg-red-100 text-red-700'"
      role="status"
    >
      <strong>{{ isCorrect ? 'Correct!' : 'Not quite.' }}</strong>
      <template v-if="question.explanation"> {{ question.explanation }}</template>
      <template v-else-if="!isCorrect"> The answer is "{{ correctText }}".</template>
    </div>

    <div class="flex justify-center">
      <button
        v-if="!answered"
        type="button"
        class="font-button w-full max-w-md py-4 rounded-xl bg-olive text-white text-2xl md:text-3xl shadow-[0_4px_8px_rgba(0,0,0,0.35)] hover:bg-olive/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="selectedIndex === null"
        @click="emit('submit')"
      >
        Submit Answer
      </button>
      <button
        v-else
        type="button"
        class="font-button w-full max-w-md py-4 rounded-xl bg-olive text-white text-2xl md:text-3xl shadow-[0_4px_8px_rgba(0,0,0,0.35)] hover:bg-olive/90 transition-colors"
        @click="emit('next')"
      >
        {{ isLast ? 'See Results' : 'Next Question' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.feedback {
  animation: feedback-in 0.3s ease-out;
}
@keyframes feedback-in {
  from { opacity: 0; transform: translateY(8px); }
}
@media (prefers-reduced-motion: reduce) {
  .feedback { animation: none; }
}
</style>
