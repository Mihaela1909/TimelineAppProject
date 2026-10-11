<script setup>
import { getImagePreviewUrl } from '../../services/mediaService'
import { splitTitle, lessonsText } from '../../utils/text'
import HistoryCard from '../ui/HistoryCard.vue'

// Level-check results: overall level, how each course's questions went, and the
// recommended course. Dumb component: `result` comes from scoreLevelQuiz().
defineProps({
  result: { type: Object, required: true }, // { correct, total, percent, level, byCourse, recommended }
})
const emit = defineEmits(['retake'])
</script>

<template>
  <div class="text-center">
    <span class="pop inline-block bg-olive text-white px-8 py-1.5 rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.3)] mb-5">
      {{ result.correct }}/{{ result.total }} · {{ result.percent }}%
    </span>
    <h1 class="font-voice text-bark text-3xl md:text-5xl mb-2">
      Your history level: <span class="text-olive">{{ result.level.name }}</span>
    </h1>
    <p class="text-bark/80 text-lg mb-10">{{ result.level.text }}</p>

    <div class="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start text-left max-w-5xl mx-auto mb-10">
      <!-- Per course: single-series bars, values labelled directly -->
      <section aria-labelledby="by-era">
        <h2 id="by-era" class="font-voice text-2xl text-bark mb-4">How you did by course</h2>
        <ul class="space-y-3">
          <li v-for="entry in result.byCourse" :key="entry.course.$id">
            <div class="flex justify-between gap-3 text-sm text-bark mb-1">
              <span class="truncate">{{ entry.course.title }}</span>
              <span class="font-semibold tabular-nums whitespace-nowrap">{{ entry.correct }}/{{ entry.total }}</span>
            </div>
            <div class="h-2.5 rounded-full bg-olive-light overflow-hidden" aria-hidden="true">
              <div class="h-full rounded-full bg-olive" :style="{ width: `${entry.ratio * 100}%` }"></div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Recommendation -->
      <section aria-labelledby="recommended">
        <h2 id="recommended" class="font-voice text-2xl text-bark mb-4">
          {{ result.percent === 100 ? 'Try this one next:' : 'We recommend:' }}
        </h2>
        <div v-if="result.recommended" class="max-w-sm">
          <HistoryCard
            layout="grid"
            :to="`/courses/${result.recommended.$id}`"
            :image="result.recommended.coverImageId ? getImagePreviewUrl(result.recommended.coverImageId) : null"
            :badge="result.recommended.category"
            :label="splitTitle(result.recommended.title).label"
            :title="splitTitle(result.recommended.title).title"
            :meta="lessonsText(result.recommended.lessonCount)"
            label-large
          />
          <p class="text-sm text-bark/70 mt-3">
            {{ result.percent === 100 ? "You aced every era — here's one you haven't finished yet." : 'This is where you missed the most, so it has the most to teach you.' }}
          </p>
        </div>
        <p v-else class="text-bark/80">You've completed every course. Impressive!</p>
      </section>
    </div>

    <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
      <button
        type="button"
        class="font-button w-full max-w-xs py-3 rounded-md bg-olive text-white text-xl shadow-[0_4px_8px_rgba(0,0,0,0.35)] hover:bg-olive/90 transition-colors"
        @click="emit('retake')"
      >
        Retake with new questions
      </button>
      <RouterLink
        to="/courses"
        class="font-button w-full max-w-xs py-3 rounded-md border-2 border-olive text-olive text-xl hover:bg-olive-light/50 transition-colors"
      >
        Browse all courses
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.pop {
  animation: pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.4); }
}
@media (prefers-reduced-motion: reduce) {
  .pop { animation: none; }
}
</style>
