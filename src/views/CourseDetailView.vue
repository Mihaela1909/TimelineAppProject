<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCourseDetail } from '../composables/useCourseDetail'
import { useAuth } from '../composables/useAuth'
import { useCourseProgress } from '../composables/useCourseProgress'
import { getImagePreviewUrl } from '../services/mediaService'
import CourseBanner from '../components/courses/CourseBanner.vue'
import AppIcon from '../components/ui/AppIcon.vue'

const route = useRoute()
const { course, lessons, quiz, loading, error, fetchCourseAndLessons } = useCourseDetail()
const { currentUser } = useAuth()
const { completedLessonIds, fetchCompleted } = useCourseProgress()

onMounted(() => {
  fetchCourseAndLessons(route.params.id)
  fetchCompleted(currentUser.value?.$id, route.params.id)
})

const lessonLink = (lesson) => `/courses/${route.params.id}/lessons/${lesson.$id}`
const isDone = (lesson) => completedLessonIds.value.includes(lesson.$id)

const doneCount = computed(() => lessons.value.filter(isDone).length)
const progressPercent = computed(() => (lessons.value.length ? (doneCount.value / lessons.value.length) * 100 : 0))
const allDone = computed(() => lessons.value.length > 0 && doneCount.value === lessons.value.length)

// The lesson to continue with: the first one not done yet (logged-in users only).
const nextLesson = computed(() => (currentUser.value ? lessons.value.find((l) => !isDone(l)) : null))

// Main button: Continue (started) · Start (not started / guest) · Review (all done).
const mainAction = computed(() => {
  if (!lessons.value.length) return null
  if (allDone.value) return { label: 'Review course', to: lessonLink(lessons.value[0]) }
  if (nextLesson.value && doneCount.value > 0) {
    const n = lessons.value.indexOf(nextLesson.value) + 1
    return { label: `Continue · Lesson ${n}`, to: lessonLink(nextLesson.value) }
  }
  return { label: 'Start course', to: lessonLink(lessons.value[0]) }
})

// Row style per lesson: done (muted) · current (ochre) · upcoming (white).
function rowClass(lesson) {
  if (isDone(lesson)) return 'bg-parchment text-bark/50 border-field-border'
  if (lesson === nextLesson.value) return 'bg-ochre text-white font-bold border-ochre'
  return 'bg-white text-bark border-field-border hover:bg-cream'
}

const coverUrl = computed(() => (course.value?.coverImageId ? getImagePreviewUrl(course.value.coverImageId) : null))
const bannerUrl = computed(() => {
  const id = course.value?.headerImageId || course.value?.coverImageId
  return id ? getImagePreviewUrl(id) : null
})
</script>

<template>
  <div>
    <CourseBanner :image="bannerUrl" />

    <div class="max-w-6xl mx-auto px-5 md:px-8 py-6 md:py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-bark mb-5" aria-label="Breadcrumb">
        <AppIcon name="arrow-left" class="w-4 h-4" />
        <RouterLink to="/courses" class="hover:text-olive">Back to All Courses</RouterLink>
        <template v-if="course">
          <span class="text-bark/50">/</span>
          <span class="font-semibold text-olive">{{ course.title }}</span>
        </template>
      </nav>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.2)] space-y-4" aria-live="polite">
        <div class="flex gap-8">
          <div class="w-64 h-48 bg-olive-light rounded-lg animate-pulse"></div>
          <div class="flex-1 space-y-3">
            <div class="h-6 w-24 bg-olive-light rounded animate-pulse"></div>
            <div class="h-12 w-2/3 bg-olive-light rounded animate-pulse"></div>
          </div>
        </div>
        <div v-for="n in 4" :key="n" class="h-12 bg-olive-light rounded animate-pulse"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
        <p class="mb-3">{{ error }}</p>
        <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchCourseAndLessons(route.params.id)">Retry</button>
      </div>

      <article v-else-if="course" class="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] px-5 py-6 md:px-16 md:py-10">
        <!-- Overview: cover + title, progress, main button -->
        <div class="grid md:grid-cols-[minmax(0,20rem)_1fr] gap-6 md:gap-10 items-start mb-8">
          <div class="aspect-[5/4] rounded-xl overflow-hidden border-2 border-ochre shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-parchment">
            <img v-if="coverUrl" :src="coverUrl" :alt="course.title" class="w-full h-full object-cover grayscale" />
          </div>

          <div>
            <span v-if="course.category" class="inline-block bg-olive text-white px-5 py-1 rounded-md shadow-[0_2px_4px_rgba(0,0,0,0.3)] mb-3">
              {{ course.category }}
            </span>
            <h1 class="font-voice text-bark text-4xl md:text-6xl leading-tight mb-3">{{ course.title }}</h1>
            <p class="text-taupe-dark md:text-lg mb-2">
              {{ lessons.length }} lesson{{ lessons.length === 1 ? '' : 's' }} · free
              <template v-if="currentUser"> · {{ doneCount }}/{{ lessons.length }} complete</template>
            </p>
            <div
              v-if="currentUser && lessons.length"
              class="h-1.5 bg-black/10 rounded-full overflow-hidden mb-6 max-w-xl"
              role="progressbar"
              :aria-valuenow="Math.round(progressPercent)"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Course progress"
            >
              <div class="bar-fill h-full bg-ochre rounded-full transition-[width] duration-500" :style="{ width: `${progressPercent}%` }"></div>
            </div>
            <div v-else class="mb-6"></div>

            <RouterLink
              v-if="mainAction"
              :to="mainAction.to"
              class="font-button inline-block px-8 py-3 rounded-md bg-olive text-white text-lg shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 transition-colors"
            >
              {{ mainAction.label }}
            </RouterLink>
            <p v-if="!currentUser" class="text-sm text-bark/60 mt-3">
              <RouterLink to="/login" class="text-olive font-semibold hover:underline">Log in</RouterLink> to save your progress.
            </p>
          </div>
        </div>

        <p v-if="course.description" class="text-bark/80 leading-relaxed mb-10 max-w-3xl">{{ course.description }}</p>

        <!-- Lessons -->
        <h2 class="sr-only">Lessons</h2>
        <div v-if="lessons.length === 0" class="bg-cream rounded-lg p-8 text-center text-sm text-bark/60">
          No lessons published yet — check back soon.
        </div>
        <ol v-else class="space-y-3">
          <li v-for="(lesson, i) in lessons" :key="lesson.$id">
            <RouterLink
              :to="lessonLink(lesson)"
              class="flex items-center gap-3 px-6 py-3.5 rounded-sm border shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-colors"
              :class="rowClass(lesson)"
              :aria-current="lesson === nextLesson ? 'step' : undefined"
            >
              <span class="w-5 text-right text-sm font-semibold">{{ i + 1 }}</span>
              <span class="opacity-60" aria-hidden="true">|</span>
              <span class="flex-1">{{ lesson.title }}</span>
              <AppIcon v-if="isDone(lesson)" name="check" class="w-5 h-5 text-leaf" />
              <span v-if="isDone(lesson)" class="sr-only">(completed)</span>
            </RouterLink>
          </li>
        </ol>

        <!-- Course quiz: unlocks once every lesson is done -->
        <template v-if="quiz">
          <RouterLink
            v-if="allDone"
            :to="`/quizzes/${quiz.$id}`"
            class="mt-6 flex items-center gap-4 px-6 py-4 rounded-sm bg-olive text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] hover:bg-olive/90 transition-colors"
          >
            <AppIcon name="quiz" class="w-7 h-7" />
            <span>
              <span class="block font-semibold">Course Quiz</span>
              <span class="block text-sm text-cream/90">Test what you've learned →</span>
            </span>
          </RouterLink>
          <div v-else class="mt-6 flex items-center gap-4 px-6 py-4 rounded-sm bg-parchment text-bark/60 shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <AppIcon name="lock" class="w-7 h-7" />
            <span>
              <span class="block font-semibold">Course Quiz</span>
              <span class="block text-sm">Complete all lessons to unlock</span>
            </span>
          </div>
        </template>
      </article>
    </div>
  </div>
</template>

<style scoped>
/* Progress bar fills up from empty when it first appears (later changes glide via the width transition) */
.bar-fill {
  animation: bar-fill 0.9s cubic-bezier(0.3, 0.7, 0.3, 1) 0.2s backwards;
}
@keyframes bar-fill {
  from { width: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .bar-fill {
    animation: none;
  }
}
</style>
