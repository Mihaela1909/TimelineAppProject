<script setup>
import { formatDate } from '../../utils/time'
import ProfileSection from './ProfileSection.vue'

// Profile → "Quiz History". Dumb: attempts + a quiz lookup from useProfileProgress.
const props = defineProps({
  attempts: { type: Array, required: true },
  quizById: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})
const emit = defineEmits(['retry'])

const percent = (a) => Math.round((a.score / a.totalQuestions) * 100)
const passed = (a) => percent(a) >= (props.quizById[a.quizId]?.passingScore || 70)
</script>

<template>
  <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center text-sm" role="alert">
    <p class="mb-3">{{ error }}</p>
    <button class="px-4 py-2 rounded-md border border-red-400" @click="emit('retry')">Retry</button>
  </div>

  <ProfileSection v-else title="Review performance:">
    <div v-if="loading" class="space-y-3" aria-live="polite">
      <div v-for="n in 3" :key="n" class="h-16 bg-olive-light rounded-lg animate-pulse"></div>
    </div>

    <p v-else-if="attempts.length === 0" class="text-center text-bark/70 py-6">
      You haven't taken any quizzes yet.
      <RouterLink to="/quizzes" class="text-olive font-semibold hover:underline">Browse quizzes →</RouterLink>
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="attempt in attempts"
        :key="attempt.$id"
        class="flex items-center gap-4 bg-cream border border-taupe/60 rounded-lg px-4 py-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
      >
        <div class="flex-1 min-w-0">
          <RouterLink :to="`/quizzes/${attempt.quizId}`" class="block font-semibold text-bark truncate hover:text-olive">
            {{ quizById[attempt.quizId]?.title || 'Quiz' }}
          </RouterLink>
          <div class="text-sm text-bark/60">{{ formatDate(attempt.$createdAt) }}</div>
        </div>
        <span class="text-sm text-bark/70 whitespace-nowrap">{{ attempt.score }}/{{ attempt.totalQuestions }}</span>
        <span
          class="text-sm font-semibold px-3 py-1 rounded-md whitespace-nowrap"
          :class="passed(attempt) ? 'bg-leaf/30 text-bark' : 'bg-butter text-bark'"
        >
          {{ percent(attempt) }}% · {{ passed(attempt) ? 'Passed' : 'Failed' }}
        </span>
      </li>
    </ul>
  </ProfileSection>
</template>
