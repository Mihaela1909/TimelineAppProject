<script setup>
import { onMounted, ref, computed } from 'vue'
import * as quizService from '../services/quizService'
import { useAdminCourses } from '../composables/useAdminCourses'
import { getImagePreviewUrl } from '../services/mediaService'

const quizzes = ref([])
const loading = ref(true)
const error = ref(null)
const { courses, fetchAll: fetchCourses } = useAdminCourses()

onMounted(async () => {
  fetchCourses()
  try {
    quizzes.value = await quizService.getPublishedQuizzes()
  } catch (err) {
    error.value = 'Could not load quizzes.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const courseById = computed(() => {
  const map = {}
  courses.value.forEach((c) => (map[c.$id] = c))
  return map
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <h1 class="font-voice text-3xl text-bark mb-1">Quizzes</h1>
    <p class="text-xs text-bark/60 mb-6">Test your knowledge after every course &middot; {{ quizzes.length }} available</p>

    <div v-if="loading" class="space-y-2" aria-live="polite">
      <div v-for="n in 3" :key="n" class="h-16 bg-white rounded-lg animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm">
      {{ error }}
    </div>

    <div v-else-if="quizzes.length === 0" class="bg-white rounded-lg p-12 text-center text-sm text-bark/60">
      No quizzes available yet — check back soon.
    </div>

    <div v-else class="space-y-2">
      <RouterLink
        v-for="quiz in quizzes"
        :key="quiz.$id"
        :to="`/quizzes/${quiz.$id}`"
        class="flex items-center gap-3 bg-white px-4 py-3.5 rounded-lg hover:shadow-sm transition-shadow"
      >
        <img
          v-if="quiz.coverImageId"
          :src="getImagePreviewUrl(quiz.coverImageId)"
          :alt="quiz.title"
          class="w-9 h-9 rounded-lg object-cover flex-shrink-0"
        />
        <div
          v-else
          class="w-9 h-9 rounded-lg bg-olive-light flex items-center justify-center text-olive text-sm font-voice flex-shrink-0"
        >
          ?
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-bark">{{ quiz.title }}</div>
          <div class="text-xs text-bark/50">{{ courseById[quiz.courseId]?.title || 'General' }}</div>
        </div>
        <span class="text-olive text-sm">→</span>
      </RouterLink>
    </div>
  </div>
</template>