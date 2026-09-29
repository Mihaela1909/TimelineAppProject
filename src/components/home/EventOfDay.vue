<script setup>
import { ref, onMounted } from 'vue'

const event = ref(null)
const loading = ref(true)

onMounted(async () => {
  // TODO: replace with a real call to the Wikimedia "on this day" feed:
  // https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/{mm}/{dd}
  await new Promise((r) => setTimeout(r, 300))
  event.value = {
    year: 1793,
    text: 'The French Revolution\'s "Reign of Terror" begins.',
  }
  loading.value = false
})
</script>

<template>
  <section class="px-6 py-14 max-w-5xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <h2 class="font-voice text-2xl text-bark whitespace-nowrap">Event of the Day</h2>
      <div class="flex-1 h-px bg-olive/50"></div>
    </div>

    <div v-if="loading" class="h-24 bg-white rounded-lg animate-pulse"></div>

    <div v-else class="bg-olive-dark rounded-lg p-6 flex items-center gap-6 text-white">
      <div class="border-4 border-sand rounded px-4 py-2 text-center flex-shrink-0">
        <div class="text-xs text-yellow-600">Today</div>
        <div class="font-voice text-2xl">{{ event.year }}</div>
      </div>
      <p class="text-sm">{{ event.text }}</p>
      <RouterLink to="/event-of-the-day" class="ml-auto text-xs text-sand hover:underline whitespace-nowrap">
        See full calendar &rarr;
      </RouterLink>
    </div>
  </section>
</template>
