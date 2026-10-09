<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseDetail } from '../composables/useCourseDetail'
import { useAuth } from '../composables/useAuth'
import { getImagePreviewUrl } from '../services/mediaService'
import { useCourseProgress } from '../composables/useCourseProgress'
import { useToast } from '../composables/useToast'
import CourseBanner from '../components/courses/CourseBanner.vue'
import AppIcon from '../components/ui/AppIcon.vue'
import LessonSelect from '../components/courses/LessonSelect.vue'

const route = useRoute()
const router = useRouter()
const { course, lessons, loading, error, fetchCourseAndLessons } = useCourseDetail()
const { currentUser } = useAuth()
const toast = useToast()

const { completedLessonIds, marking, fetchCompleted, markComplete, unmarkComplete } = useCourseProgress()

onMounted(() => {
  fetchCourseAndLessons(route.params.id)
  fetchCompleted(currentUser.value?.$id, route.params.id)
})

const isCurrentLessonComplete = computed(() => completedLessonIds.value.includes(route.params.lessonId))

// Animations: `justCompleted` = completed during this visit (not on load), so the
// reward only plays when the user actually clicks. `swapped` = the user moved to
// another lesson; the content block is keyed by lesson id so it re-mounts and fades in.
const justCompleted = ref(false)
const swapped = ref(false)
watch(
  () => route.params.lessonId,
  () => {
    justCompleted.value = false // RESET for the new lesson
    swapped.value = true
  }
)

async function handleUnmarkComplete() {
  if (!currentUser.value || !isCurrentLessonComplete.value) return
  justCompleted.value = false
  const ok = await unmarkComplete({ userId: currentUser.value.$id, lessonId: route.params.lessonId })
  if (ok) toast.success('Marked as not complete')
  else toast.error('Could not update your progress. Please try again.')
}

async function handleMarkComplete() {
  if (!currentUser.value || isCurrentLessonComplete.value) return
  const ok = await markComplete({
    userId: currentUser.value.$id,
    courseId: route.params.id,
    lessonId: route.params.lessonId,
  })
  if (ok) {
    justCompleted.value = true // plays the check-pop on the "Completed" state
    toast.success('Marked as complete')
  }
  else toast.error('Could not save your progress. Please try again.')
}

const currentIndex = computed(() => lessons.value.findIndex((l) => l.$id === route.params.lessonId))
const currentLesson = computed(() => lessons.value[currentIndex.value])
const prevLesson = computed(() => lessons.value[currentIndex.value - 1])
const nextLesson = computed(() => lessons.value[currentIndex.value + 1])

const bannerUrl = computed(() => {
  const id = course.value?.headerImageId || course.value?.coverImageId
  return id ? getImagePreviewUrl(id) : null
})

function goTo(lessonId) {
  if (lessonId === route.params.lessonId) return
  router.push(`/courses/${route.params.id}/lessons/${lessonId}`)
}
</script>

<template>
  <div>
    <CourseBanner :image="bannerUrl" />

    <div class="max-w-6xl mx-auto px-5 md:px-8 py-6 md:py-8">
      <RouterLink :to="`/courses/${route.params.id}`" class="inline-flex items-center gap-2 text-sm text-bark hover:text-olive mb-5">
        <AppIcon name="arrow-left" class="w-4 h-4" />
        Back to {{ course?.title || 'course' }}
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.2)] space-y-4" aria-live="polite">
        <div class="h-3 bg-olive-light rounded animate-pulse"></div>
        <div class="h-12 w-2/3 bg-olive-light rounded animate-pulse"></div>
        <div class="h-64 bg-olive-light rounded-lg animate-pulse"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
        <p class="mb-3">{{ error }}</p>
        <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchCourseAndLessons(route.params.id)">Retry</button>
      </div>

      <!-- Lesson not found (wrong link / unpublished) -->
      <div v-else-if="!currentLesson" class="bg-white rounded-xl p-10 text-center text-bark/70 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
        This lesson isn't available.
        <RouterLink :to="`/courses/${route.params.id}`" class="text-olive font-semibold hover:underline">Back to the course</RouterLink>
      </div>

      <article v-else class="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] px-5 py-6 md:px-24 md:py-12">
        <!-- Jump to any lesson + position in the course -->
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-3 mb-6">
          <LessonSelect
            class="w-full sm:w-auto"
            :lessons="lessons"
            :current-id="route.params.lessonId"
            :completed-ids="completedLessonIds"
            @select="goTo"
          />
          <span class="text-taupe-dark md:text-lg whitespace-nowrap">Lesson {{ currentIndex + 1 }} of {{ lessons.length }}</span>
          <div
            class="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden"
            role="progressbar"
            :aria-valuenow="currentIndex + 1"
            aria-valuemin="1"
            :aria-valuemax="lessons.length"
            aria-label="Position in course"
          >
            <div class="bar-fill h-full bg-ochre rounded-full transition-[width] duration-500" :style="{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }"></div>
          </div>
        </div>

        <!-- Everything below the bar is keyed by lesson, so switching lessons re-mounts it with a fade -->
        <div :key="route.params.lessonId" :class="{ 'lesson-swap': swapped }">
        <h1 class="font-voice text-bark text-3xl md:text-5xl leading-tight mb-6">{{ currentLesson.title }}</h1>

        <img
          v-if="currentLesson.imageId"
          :src="getImagePreviewUrl(currentLesson.imageId)"
          :alt="currentLesson.title"
          class="w-full max-h-[26rem] object-cover rounded-xl grayscale shadow-[0_4px_12px_rgba(0,0,0,0.3)] mb-8"
        />

        <div class="reading-content lesson-editor-content text-bark text-base md:text-lg mb-10" v-html="currentLesson.content"></div>

        <!-- Progress -->
        <div v-if="currentUser" class="mb-10">
          <button
            v-if="!isCurrentLessonComplete"
            type="button"
            class="w-full py-3 rounded-md bg-olive text-white text-lg shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            :disabled="marking"
            @click="handleMarkComplete"
          >
            <AppIcon name="check" class="w-5 h-5" />
            {{ marking ? 'Saving…' : 'Mark as Complete' }}
          </button>
          <div
            v-else
            class="relative w-full py-3 rounded-md bg-leaf/20 text-bark text-lg flex items-center justify-center gap-2"
            :class="{ 'done-flash': justCompleted }"
            role="status"
          >
            <AppIcon name="check" class="w-5 h-5 text-leaf" :class="{ 'check-pop': justCompleted }" /> Completed
            <!-- Undo: back to "Mark as Complete" -->
            <button
              type="button"
              class="font-sans absolute right-4 text-sm text-bark/70 underline hover:text-bark disabled:opacity-60"
              :disabled="marking"
              @click="handleUnmarkComplete"
            >
              {{ marking ? 'Saving…' : 'Undo' }}<span class="sr-only"> — mark this lesson as not complete</span>
            </button>
          </div>
        </div>
        <p v-else class="mb-10 text-sm text-bark/60 text-center">
          <RouterLink to="/login" class="text-olive font-semibold hover:underline">Log in</RouterLink> to save your progress.
        </p>

        <!-- Previous / next lesson -->
        <nav class="flex justify-between gap-6 font-sans font-bold text-olive" aria-label="Lessons">
          <button v-if="prevLesson" type="button" class="font-sans flex items-center gap-2 text-left hover:underline" @click="goTo(prevLesson.$id)">
            <AppIcon name="chevron-left" class="w-6 h-6 flex-shrink-0" />
            <span><span class="sr-only">Previous: </span>{{ prevLesson.title }}</span>
          </button>
          <span v-else></span>

          <button v-if="nextLesson" type="button" class="font-sans flex items-center gap-2 text-right hover:underline" @click="goTo(nextLesson.$id)">
            <span><span class="sr-only">Next: </span>{{ nextLesson.title }}</span>
            <AppIcon name="chevron-right" class="w-6 h-6 flex-shrink-0" />
          </button>
          <RouterLink v-else :to="`/courses/${route.params.id}`" class="flex items-center gap-2 hover:underline">
            Finish course <AppIcon name="chevron-right" class="w-6 h-6" />
          </RouterLink>
        </nav>
        </div>
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

/* Moving to another lesson: the content fades in */
.lesson-swap {
  animation: lesson-in 0.3s ease-out;
}
@keyframes lesson-in {
  from { opacity: 0; transform: translateY(8px); }
}

/* Mark as Complete reward: soft green flash + the check pops in */
.done-flash {
  animation: done-flash 0.8s ease-out;
}
@keyframes done-flash {
  0% { background-color: rgb(var(--color-leaf) / 0.55); transform: scale(0.97); }
  40% { transform: scale(1.01); }
  100% { transform: none; }
}
.check-pop {
  animation: check-pop 0.5s cubic-bezier(0.3, 1.8, 0.5, 1);
}
@keyframes check-pop {
  from { transform: scale(0) rotate(-30deg); }
}

@media (prefers-reduced-motion: reduce) {
  .bar-fill,
  .lesson-swap,
  .done-flash,
  .check-pop {
    animation: none;
  }
}
</style>
