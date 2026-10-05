<script setup>
import { onMounted } from 'vue'
import { useCourses } from '../../composables/useCourses'
import { getImagePreviewUrl } from '../../services/mediaService'
import SectionHeading from '../ui/SectionHeading.vue'
import CardCarousel from '../ui/CardCarousel.vue'
import HistoryCard from '../ui/HistoryCard.vue'
import AppIcon from '../ui/AppIcon.vue'

const SHOWN = 8
const { courses, loading, error, fetchPopularCourses } = useCourses()

onMounted(() => fetchPopularCourses(SHOWN))

// Mockup style: "Ancient" in the white band, "Egypt" in the olive band.
// One-word titles go entirely in the olive band.
function splitTitle(title = '') {
  const [first, ...rest] = title.trim().split(/\s+/)
  return rest.length ? { label: first, title: rest.join(' ') } : { label: '', title: first }
}

const lessonsText = (n) => (n ? `${n} lesson${n === 1 ? '' : 's'}` : '')
</script>

<template>
  <section class="px-5 md:px-8 py-14 md:py-20 max-w-7xl mx-auto">
    <SectionHeading title="Most Popular Courses" />

    <div v-if="loading" class="flex gap-5 overflow-hidden md:px-14" aria-live="polite">
      <div v-for="n in 3" :key="n" class="flex-shrink-0 w-[78%] sm:w-[45%] lg:w-[calc((100%-2.5rem)/3)] h-64 rounded-lg bg-white animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center text-sm" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400 hover:bg-red-100" @click="fetchPopularCourses(SHOWN)">Retry</button>
    </div>

    <div v-else-if="courses.length === 0" class="bg-white rounded-lg p-10 text-center text-sm text-bark/60">
      No courses published yet. Check back soon.
    </div>

    <CardCarousel v-else label="Popular courses">
      <HistoryCard
        v-for="course in courses"
        :key="course.$id"
        :to="`/courses/${course.$id}`"
        :image="course.coverImageId ? getImagePreviewUrl(course.coverImageId) : null"
        :badge="course.category"
        :label="splitTitle(course.title).label"
        :title="splitTitle(course.title).title"
        :meta="lessonsText(course.lessonCount)"
        label-large
      />
    </CardCarousel>

    <div class="flex justify-end mt-6">
      <RouterLink to="/courses" class="inline-flex items-center gap-2 text-sm font-semibold text-bark hover:text-olive">
        Browse all <AppIcon name="arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>
  </section>
</template>
