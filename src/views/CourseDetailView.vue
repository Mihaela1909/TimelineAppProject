<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCourseDetail } from '../composables/useCourseDetail'
import { getImagePreviewUrl } from '../services/mediaService'

const route = useRoute()
const { course, lessons, loading, error, fetchCourseAndLessons } = useCourseDetail()

onMounted(() => fetchCourseAndLessons(route.params.id))
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <!-- Loading -->
    <div v-if="loading" class="space-y-3" aria-live="polite">
      <div class="h-32 bg-white rounded-xl animate-pulse"></div>
      <div class="h-10 bg-white rounded-lg animate-pulse"></div>
      <div class="h-10 bg-white rounded-lg animate-pulse"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchCourseAndLessons(route.params.id)">
        Retry
      </button>
    </div>

    <template v-else-if="course">
      <RouterLink to="/courses" class="text-xs text-bark/60 hover:text-bark mb-3 inline-block">
        ← All Courses
      </RouterLink>

      <div class="flex gap-5 items-center mb-6">
        <img
          v-if="course.headerImageId || course.coverImageId"
          :src="getImagePreviewUrl(course.headerImageId || course.coverImageId)"
          :alt="course.title"
          class="w-24 h-24 rounded-xl object-cover flex-shrink-0"
        />
        <div v-else class="w-24 h-24 rounded-xl bg-olive-light flex items-center justify-center text-olive text-3xl font-voice flex-shrink-0">
          {{ course.title.charAt(0) }}
        </div>
        <div>
          <span class="text-xs bg-olive-light text-olive px-3 py-1 rounded-full">{{ course.category }}</span>
          <h1 class="font-voice text-2xl text-bark mt-2">{{ course.title }}</h1>
          <p class="text-xs text-bark/60 mt-1">{{ lessons.length }} lessons &middot; free</p>
        </div>
      </div>

      <p class="text-sm text-bark/70 leading-relaxed mb-8">{{ course.description }}</p>

      <div class="flex items-center gap-2 mb-3">
        <h2 class="text-sm font-semibold text-bark">Lessons</h2>
      </div>

      <div v-if="lessons.length === 0" class="bg-white rounded-lg p-8 text-center text-sm text-bark/60">
        No lessons published yet — check back soon.
      </div>

      <div v-else class="space-y-2">
        <RouterLink
          v-for="(lesson, index) in lessons"
          :key="lesson.$id"
          :to="`/courses/${course.$id}/lessons/${lesson.$id}`"
          class="flex items-center gap-3 bg-white px-4 py-3 rounded-lg text-sm hover:shadow-sm transition-shadow"
        >
          <span class="text-xs text-bark/40 w-5">{{ index + 1 }}</span>
          <span class="flex-1 text-bark">{{ lesson.title }}</span>
          <span class="text-olive text-xs">→</span>
        </RouterLink>
      </div>
    </template>
  </div>
</template>