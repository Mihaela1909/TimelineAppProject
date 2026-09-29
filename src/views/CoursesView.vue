<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCourses } from '../composables/useCourses'
import { getImagePreviewUrl } from '../services/mediaService'

const { courses, loading, error, fetchAllPublished } = useCourses()
const searchTerm = ref('')
const activeCategory = ref('All')

onMounted(fetchAllPublished)

const categories = computed(() => {
  const unique = [...new Set(courses.value.map((c) => c.category))]
  return ['All', ...unique]
})

const filteredCourses = computed(() => {
  return courses.value.filter((course) => {
    const matchesCategory = activeCategory.value === 'All' || course.category === activeCategory.value
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <h1 class="font-voice text-3xl text-bark mb-1">All Courses</h1>
    <p class="text-xs text-bark/60 mb-6">{{ courses.length }} courses &middot; always free</p>

    <div class="flex gap-3 mb-4">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search courses..."
        class="flex-1 px-4 py-2.5 bg-white rounded-lg text-sm border border-black/5"
      />
    </div>

    <div class="flex gap-2 mb-8 flex-wrap">
      <button
        v-for="cat in categories"
        :key="cat"
        class="text-sm px-4 py-1.5 rounded-full transition-colors"
        :class="activeCategory === cat ? 'bg-bark text-white' : 'bg-white text-olive'"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 gap-4" aria-live="polite">
      <div v-for="n in 6" :key="n" class="bg-white rounded-lg overflow-hidden animate-pulse">
        <div class="h-28 bg-olive-light"></div>
        <div class="p-3 space-y-2">
          <div class="h-3 w-2/3 bg-olive-light rounded"></div>
          <div class="h-2 w-1/3 bg-olive-light rounded"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAllPublished">Retry</button>
    </div>

    <!-- No results (empty state for filter/search) -->
    <div v-else-if="filteredCourses.length === 0" class="bg-white rounded-lg p-12 text-center text-sm text-bark/60">
      No courses match "{{ searchTerm }}"<span v-if="activeCategory !== 'All'"> in {{ activeCategory }}</span>.
    </div>

    <!-- Results -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <RouterLink
        v-for="course in filteredCourses"
        :key="course.$id"
        :to="`/courses/${course.$id}`"
        class="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <img
          v-if="course.coverImageId"
          :src="getImagePreviewUrl(course.coverImageId)"
          :alt="course.title"
          class="h-28 w-full object-cover"
        />
        <div v-else class="h-28 bg-olive-light flex items-center justify-center text-olive text-2xl font-voice">
          {{ course.title.charAt(0) }}
        </div>
        <div class="p-3">
          <div class="text-sm font-medium text-bark">{{ course.title }}</div>
          <div class="text-xs text-bark/50">{{ course.lessonCount }} lessons</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>