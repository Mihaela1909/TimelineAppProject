<script setup>
import { onMounted } from 'vue'
import { useCourses } from '../../composables/useCourses'
import { getImagePreviewUrl } from '../../services/mediaService'

const { courses, loading, error, fetchPopularCourses } = useCourses()

onMounted(() => {
  fetchPopularCourses(3)
})
</script>

<template>
  <section class="px-6 py-14 max-w-5xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <h2 class="font-voice text-2xl text-bark whitespace-nowrap">Most Popular Courses</h2>
      <div class="flex-1 h-px bg-olive/50"></div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-live="polite">
      <div v-for="n in 3" :key="n" class="bg-white rounded-lg overflow-hidden animate-pulse">
        <div class="h-24 bg-olive-light"></div>
        <div class="p-3 space-y-2">
          <div class="h-3 w-2/3 bg-olive-light rounded"></div>
          <div class="h-2 w-1/3 bg-olive-light rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center text-sm"
      role="alert"
    >
      <p class="mb-3">{{ error }}</p>
      <button
        class="px-4 py-2 rounded-md border border-red-400 text-red-700 hover:bg-red-100 transition-colors"
        @click="fetchPopularCourses(3)"
      >
        Retry
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="courses.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
      No courses published yet. Check back soon.
    </div>

    <!-- Loaded state -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RouterLink
        v-for="course in courses"
        :key="course.$id"
        :to="`/courses/${course.$id}`"
        class="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <img
          v-if="course.coverImageId"
          :src="getImagePreviewUrl(course.coverImageId)"
          :alt="course.title"
          class="h-24 w-full object-cover"
        />
        <div v-else class="h-24 bg-olive-light flex items-center justify-center text-olive text-2xl font-voice">
          {{ course.title.charAt(0) }}
        </div>
        <div class="p-3">
          <div class="text-sm font-medium text-bark">{{ course.title }}</div>
          <div class="text-xs text-bark/50">{{ course.lessonCount }} lessons</div>
        </div>
      </RouterLink>
    </div>

    <div class="text-right mt-4">
      <RouterLink to="/courses" class="text-sm text-olive font-medium hover:underline">
        Browse all &rarr;
      </RouterLink>
    </div>
  </section>
</template>