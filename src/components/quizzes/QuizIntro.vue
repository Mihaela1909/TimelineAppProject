<script setup>
// Quiz start screen (mockup): status pill, title, description, 3 stat boxes,
// Start/Retake button, then either "Your history with this quiz" or the
// linked course's progress. Dumb component — the page passes everything in.
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: Object, default: null }, // { label, tone }
  questionCount: { type: Number, required: true },
  minutes: { type: Number, required: true },
  passingScore: { type: Number, required: true },
  buttonLabel: { type: String, required: true },
  finishCourseTo: { type: String, default: '' }, // shows "or finish the course first"
  history: { type: Object, default: null }, // { best, bestOf, bestPct, attempts, last }
  courseProgress: { type: Object, default: null }, // { done, total }
  isLoggedIn: { type: Boolean, default: false },
})
const emit = defineEmits(['start'])

const TONES = { leaf: 'bg-leaf', ochre: 'bg-ochre', wine: 'bg-wine', taupe: 'bg-taupe' }
</script>

<template>
  <div class="text-center">
    <span
      v-if="status"
      class="inline-block text-white px-8 py-1.5 rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.3)] mb-6"
      :class="TONES[status.tone]"
    >
      {{ status.label }}
    </span>

    <h1 class="font-voice text-bark text-3xl md:text-5xl leading-tight mb-3">{{ title }}</h1>
    <p v-if="description" class="text-bark text-lg md:text-xl max-w-xl mx-auto leading-snug mb-10">{{ description }}</p>
    <div v-else class="mb-8"></div>

    <!-- Stat boxes -->
    <dl class="flex justify-center gap-4 md:gap-8 mb-10">
      <div v-for="stat in [
        { value: questionCount, label: questionCount === 1 ? 'Question' : 'Questions' },
        { value: `~${minutes} min`, label: 'Est. time' },
        { value: `${passingScore}%`, label: 'To pass' },
      ]" :key="stat.label" class="w-24 md:w-36 py-3 md:py-4 rounded-xl bg-white border-2 border-olive shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
        <dd class="text-2xl md:text-4xl font-bold text-olive">{{ stat.value }}</dd>
        <dt class="text-sm md:text-lg text-olive">{{ stat.label }}</dt>
      </div>
    </dl>

    <button
      type="button"
      class="font-button w-full max-w-xs py-3 rounded-md bg-olive text-white text-xl shadow-[0_4px_8px_rgba(0,0,0,0.35)] hover:bg-olive/90 transition-colors"
      @click="emit('start')"
    >
      {{ buttonLabel }}
    </button>
    <div v-if="finishCourseTo" class="mt-2">
      <RouterLink :to="finishCourseTo" class="text-olive text-lg underline hover:text-bark">or finish the course first</RouterLink>
    </div>
    <p v-if="!isLoggedIn" class="text-sm text-bark/60 mt-3">
      <RouterLink to="/login" class="text-olive font-semibold hover:underline">Log in</RouterLink> to save your score.
    </p>

    <template v-if="history || courseProgress">
      <hr class="border-t-2 border-bark/80 my-8 md:my-10 max-w-3xl mx-auto" />

      <!-- History with this quiz -->
      <div v-if="history" class="max-w-xl mx-auto text-left bg-cream border border-field-border rounded-xl shadow-[0_4px_8px_rgba(0,0,0,0.25)] px-6 md:px-10 py-6">
        <h2 class="text-lg text-bark/80 font-semibold pb-2 mb-3 border-b border-bark/60">Your history with this quiz</h2>
        <dl class="space-y-3 text-bark">
          <div class="flex justify-between"><dt class="font-bold">Best score</dt><dd class="font-semibold">{{ history.best }}/{{ history.bestOf }} · {{ history.bestPct }}%</dd></div>
          <div class="flex justify-between"><dt class="font-bold">Attempts</dt><dd class="font-semibold">{{ history.attempts }}</dd></div>
          <div class="flex justify-between"><dt class="font-bold">Last attempt</dt><dd class="font-semibold">{{ history.last }}</dd></div>
        </dl>
      </div>

      <!-- Course progress (when the course isn't finished and there's no history yet) -->
      <div v-else-if="courseProgress" class="max-w-xl mx-auto text-left">
        <h2 class="text-ochre text-xl font-bold mb-2">Course progress</h2>
        <p class="text-taupe-dark text-lg mb-3">{{ courseProgress.done }}/{{ courseProgress.total }} complete</p>
        <div class="h-1.5 bg-black/10 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="courseProgress.done" aria-valuemin="0" :aria-valuemax="courseProgress.total" aria-label="Course progress">
          <div class="bar-fill h-full bg-ochre rounded-full" :style="{ width: `${(courseProgress.done / courseProgress.total) * 100}%` }"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bar-fill {
  animation: bar-fill 0.9s cubic-bezier(0.3, 0.7, 0.3, 1) 0.2s backwards;
}
@keyframes bar-fill {
  from { width: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .bar-fill { animation: none; }
}
</style>
