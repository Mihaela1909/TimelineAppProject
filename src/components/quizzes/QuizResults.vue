<script setup>
import { computed } from 'vue'

// Results screen (no mockup yet — built in the same style as the intro).
const props = defineProps({
  correct: { type: Number, required: true },
  total: { type: Number, required: true },
  passingScore: { type: Number, required: true },
  courseTo: { type: String, default: '' },
  isLoggedIn: { type: Boolean, default: false },
})
const emit = defineEmits(['retake'])

const pct = computed(() => Math.round((props.correct / props.total) * 100))
const passed = computed(() => pct.value >= props.passingScore)
</script>

<template>
  <div class="text-center">
    <span
      class="pop inline-block text-white px-8 py-1.5 rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.3)] mb-6"
      :class="passed ? 'bg-leaf' : 'bg-ochre'"
    >
      {{ passed ? 'Passed' : 'Not passed yet' }}
    </span>
    <h1 class="font-voice text-bark text-3xl md:text-5xl mb-2">Quiz complete</h1>
    <p class="text-6xl md:text-8xl font-bold text-olive leading-none my-6">{{ correct }}/{{ total }}</p>
    <p class="text-bark text-xl mb-10">
      {{ pct }}% — {{ passed ? 'well done!' : `you need ${passingScore}% to pass. Try again?` }}
    </p>
    <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
      <button
        type="button"
        class="font-button w-full max-w-xs py-3 rounded-md bg-olive text-white text-xl shadow-[0_4px_8px_rgba(0,0,0,0.35)] hover:bg-olive/90 transition-colors"
        @click="emit('retake')"
      >
        Retake Quiz
      </button>
      <RouterLink
        :to="courseTo || '/quizzes'"
        class="font-button w-full max-w-xs py-3 rounded-md border-2 border-olive text-olive text-xl hover:bg-olive-light/50 transition-colors"
      >
        {{ courseTo ? 'Back to Course' : 'All Quizzes' }}
      </RouterLink>
    </div>
    <p v-if="!isLoggedIn" class="text-sm text-bark/60 mt-6">
      <RouterLink to="/login" class="text-olive font-semibold hover:underline">Log in</RouterLink> to save your scores next time.
    </p>
  </div>
</template>

<style scoped>
.pop {
  animation: pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.4); }
}
@media (prefers-reduced-motion: reduce) {
  .pop { animation: none; }
}
</style>
