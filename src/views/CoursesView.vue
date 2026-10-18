<script setup>
import { onMounted } from 'vue'
import { useCourses } from '../composables/useCourses'
import { useCourseStatuses } from '../composables/useCourseStatuses'
import { useAuth } from '../composables/useAuth'
import { getImagePreviewUrl } from '../services/mediaService'
import CoursesHero from '../components/courses/CoursesHero.vue'
import HistoryCard from '../components/ui/HistoryCard.vue'
import PaginationNav from '../components/ui/PaginationNav.vue'
import ListControls from '../components/ui/ListControls.vue'
import { useListControls, byNewest, byTitle } from '../composables/useListControls'
import { splitTitle, lessonsText } from '../utils/text'

// COURSES LIST PAGE (/courses): hero, search / category / sort controls, and
// the course cards (with "In progress" / "Completed" badges when logged in).

const PAGE_SIZE = 6

const { courses, loading, error, fetchPublished } = useCourses()
const { statusById, fetchFor: fetchStatuses } = useCourseStatuses()
const { currentUser } = useAuth()

const SORTS = [
  { value: 'newest', label: 'Newest', compare: byNewest },
  { value: 'az', label: 'A–Z', compare: byTitle },
  { value: 'lessons', label: 'Most lessons', compare: (a, b) => (b.lessonCount || 0) - (a.lessonCount || 0) },
]

onMounted(() => {
  fetchPublished()
  fetchStatuses(currentUser.value?.$id)
})

const { searchTerm, activeCategory, sortBy, page, categories, filtered: filteredCourses, paged: pagedCourses, pageCount, gridKey, firstLoad } =
  useListControls(courses, { sorts: SORTS, pageSize: PAGE_SIZE })

function statusBadge(courseId) {
  const status = statusById.value[courseId]
  if (!status) return {}
  return status.state === 'completed'
    ? { badge: 'Completed', badgeTone: 'leaf' }
    : { badge: 'In Progress', badgeTone: 'ochre', progress: status.ratio }
}
</script>

<template>
  <div>
    <CoursesHero />

    <div class="max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10">
      <ListControls
        v-model:search="searchTerm"
        v-model:sort="sortBy"
        v-model:category="activeCategory"
        noun="courses"
        :sorts="SORTS"
        :categories="categories"
      />

      <!-- Loading -->
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" aria-live="polite">
        <div v-for="n in 6" :key="n" class="h-56 rounded-xl bg-white animate-pulse"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-8 text-center text-sm" role="alert">
        <p class="mb-3">{{ error }}</p>
        <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchPublished()">Retry</button>
      </div>

      <!-- Empty (search / filter has no matches) -->
      <div v-else-if="filteredCourses.length === 0" class="bg-white rounded-lg p-12 text-center text-sm text-bark/60">
        No courses match<span v-if="searchTerm.trim()"> "{{ searchTerm.trim() }}"</span><span v-if="activeCategory !== 'All'"> in {{ activeCategory }}</span>.
      </div>

      <!-- Results -->
      <template v-else>
        <div :key="gridKey" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12" :class="firstLoad ? 'cards-stagger' : 'cards-swap'">
          <HistoryCard
            v-for="course in pagedCourses"
            :key="course.$id"
            layout="grid"
            :to="`/courses/${course.$id}`"
            :image="course.coverImageId ? getImagePreviewUrl(course.coverImageId) : null"
            :label="splitTitle(course.title).label"
            :title="splitTitle(course.title).title"
            :meta="lessonsText(course.lessonCount)"
            label-large
            v-bind="statusBadge(course.$id)"
          />
        </div>
        <PaginationNav v-model="page" :page-count="pageCount" />
      </template>
    </div>
  </div>
</template>
