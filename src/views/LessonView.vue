<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseDetail } from '../composables/useCourseDetail'
import { getImagePreviewUrl } from '../services/mediaService'

const route = useRoute()
const router = useRouter()
const { course, lessons, loading, error, fetchCourseAndLessons } = useCourseDetail()

onMounted(() => fetchCourseAndLessons(route.params.id))

const currentIndex = computed(() => lessons.value.findIndex((l) => l.$id === route.params.lessonId))
const currentLesson = computed(() => lessons.value[currentIndex.value])
const prevLesson = computed(() => lessons.value[currentIndex.value - 1])
const nextLesson = computed(() => lessons.value[currentIndex.value + 1])

function goTo(lessonId) {
  router.push(`/courses/${route.params.id}/lessons/${lessonId}`)
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-10">
    <div v-if="loading" class="space-y-3" aria-live="polite">
      <div class="h-8 bg-white rounded-lg animate-pulse"></div>
      <div class="h-40 bg-white rounded-lg animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm">
      {{ error }}
    </div>

    <template v-else-if="currentLesson">
      <RouterLink :to="`/courses/${route.params.id}`" class="text-xs text-bark/60 hover:text-bark mb-2 inline-block">
        ← {{ course?.title }}
      </RouterLink>

      <div class="flex items-center gap-3 mb-2">
        <span class="text-xs text-bark/50 whitespace-nowrap">Lesson {{ currentIndex + 1 }} of {{ lessons.length }}</span>
        <div class="flex-1 h-1 bg-black/5 rounded-full">
          <div
            class="h-full bg-olive rounded-full transition-all"
            :style="{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <h1 class="font-voice text-2xl text-bark mt-3 mb-4">{{ currentLesson.title }}</h1>

      <img
        v-if="currentLesson.imageId"
        :src="getImagePreviewUrl(currentLesson.imageId)"
        :alt="currentLesson.title"
        class="w-full rounded-lg mb-5"
      />

      <div class="lesson-editor-content bg-white rounded-lg p-5 mb-6" v-html="currentLesson.content"></div>

      <div class="flex justify-between text-sm">
        <button
          v-if="prevLesson"
          class="text-olive font-medium"
          @click="goTo(prevLesson.$id)"
        >
          ← {{ prevLesson.title }}
        </button>
        <span v-else></span>

        <button
          v-if="nextLesson"
          class="text-olive font-medium"
          @click="goTo(nextLesson.$id)"
        >
          {{ nextLesson.title }} →
        </button>
        <RouterLink v-else :to="`/courses/${route.params.id}`" class="text-olive font-medium">
          Finish course →
        </RouterLink>
      </div>
    </template>
  </div>
</template>