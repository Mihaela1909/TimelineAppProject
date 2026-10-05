<script setup>
import { computed, onMounted } from 'vue'
import { useQuizzes } from '../../composables/useQuizzes'

// "Start Quiz" opens a random published quiz (falls back to the quiz list
// while loading or if there are none).
const { quizzes, fetchPublished } = useQuizzes()
onMounted(fetchPublished)

const startLink = computed(() => {
  if (!quizzes.value.length) return '/quizzes'
  const pick = quizzes.value[Math.floor(Math.random() * quizzes.value.length)]
  return `/quizzes/${pick.$id}`
})
</script>

<template>
  <!-- md+: artwork as the section background, text on its white left side.
       Phones: no room side by side, so text on white with the artwork below. -->
  <section
    class="bg-white md:bg-[url('/images/home/test-knowledge-bg.webp')] md:bg-cover md:bg-right shadow-[0_-4px_10px_-6px_rgba(0,0,0,0.25),0_6px_10px_-6px_rgba(0,0,0,0.25)]"
  >
    <div class="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-24 md:min-h-[30rem] flex items-center">
      <div class="md:max-w-md">
        <h2 class="font-voice text-3xl md:text-5xl text-olive mb-4 leading-tight">Wanna test your knowledge?</h2>
        <p class="text-base md:text-xl text-bark/90 mb-8 leading-snug">
          Take this short quiz to find out your general history knowledge level and get recommended a course from our selection.
        </p>
        <div class="flex flex-wrap gap-3">
          <RouterLink
            :to="startLink"
            class="font-button px-6 py-2.5 rounded-md bg-olive text-white shadow-md hover:bg-olive/90 transition-colors"
          >
            Start Quiz
          </RouterLink>
          <RouterLink
            to="/quizzes"
            class="font-button px-6 py-2.5 rounded-md bg-olive text-white shadow-md hover:bg-olive/90 transition-colors"
          >
            Browse Quizzes
          </RouterLink>
        </div>
      </div>
    </div>
    <div
      class="md:hidden h-48 bg-[url('/images/home/test-knowledge-bg.webp')] bg-cover bg-right"
      aria-hidden="true"
    ></div>
  </section>
</template>
