<script setup>
// Page section title followed by a line ending in a diamond (from the mockups).
defineProps({
  title: { type: String, required: true },
})
</script>

<template>
  <div class="flex items-center gap-4 mb-8">
    <h2 class="font-voice text-2xl md:text-4xl text-bark whitespace-nowrap">{{ title }}</h2>
    <div class="flex-1 flex items-center" aria-hidden="true">
      <span class="flex-1 h-0.5 bg-bark/70"></span>
      <span class="w-2.5 h-2.5 bg-bark rotate-45 -ml-1"></span>
    </div>
  </div>
</template>
