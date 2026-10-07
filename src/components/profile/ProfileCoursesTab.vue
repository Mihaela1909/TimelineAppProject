<script setup>
import { getImagePreviewUrl } from '../../services/mediaService'
import { splitTitle, lessonsText } from '../../utils/text'
import HistoryCard from '../ui/HistoryCard.vue'
import ProfileSection from './ProfileSection.vue'

// Profile → "My Courses". Dumb: entries come from useProfileProgress
// ({ course, completedCount, total }).
defineProps({
  inProgress: { type: Array, required: true },
  completed: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})
const emit = defineEmits(['retry'])

const GRID = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8'
</script>

<template>
  <div v-if="loading" class="bg-white rounded-xl p-8" aria-live="polite">
    <div :class="GRID">
      <div v-for="n in 3" :key="n" class="h-64 bg-olive-light rounded-xl animate-pulse"></div>
    </div>
  </div>

  <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center text-sm" role="alert">
    <p class="mb-3">{{ error }}</p>
    <button class="px-4 py-2 rounded-md border border-red-400" @click="emit('retry')">Retry</button>
  </div>

  <ProfileSection v-else-if="!inProgress.length && !completed.length" title="Continue on:">
    <p class="text-center text-bark/70 py-6">
      Nothing started yet.
      <RouterLink to="/courses" class="text-olive font-semibold hover:underline">Browse courses →</RouterLink>
    </p>
  </ProfileSection>

  <div v-else class="space-y-8">
    <ProfileSection v-if="inProgress.length" title="Continue on:">
      <div :class="GRID">
        <HistoryCard
          v-for="entry in inProgress"
          :key="entry.course.$id"
          layout="grid"
          :to="`/courses/${entry.course.$id}`"
          :image="entry.course.coverImageId ? getImagePreviewUrl(entry.course.coverImageId) : null"
          badge="In Progress"
          badge-tone="ochre"
          :progress="entry.total ? entry.completedCount / entry.total : 0"
          :label="splitTitle(entry.course.title).label"
          :title="splitTitle(entry.course.title).title"
          :meta="`${entry.completedCount}/${lessonsText(entry.total)}`"
          label-large
        />
      </div>
    </ProfileSection>

    <ProfileSection v-if="completed.length" title="Completed:">
      <div :class="GRID">
        <HistoryCard
          v-for="entry in completed"
          :key="entry.course.$id"
          layout="grid"
          :to="`/courses/${entry.course.$id}`"
          :image="entry.course.coverImageId ? getImagePreviewUrl(entry.course.coverImageId) : null"
          badge="Completed"
          badge-tone="leaf"
          :label="splitTitle(entry.course.title).label"
          :title="splitTitle(entry.course.title).title"
          :meta="lessonsText(entry.total)"
          label-large
        />
      </div>
    </ProfileSection>
  </div>
</template>
