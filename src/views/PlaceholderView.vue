<script setup>
defineProps({ title: { type: String, default: 'Coming soon' } })
</script>

<template>
  <div class="px-6 py-24 text-center max-w-xl mx-auto">
    <h1 class="font-voice text-2xl text-bark mb-2">{{ title }}</h1>
    <p class="text-sm text-bark/60">This page is being built next.</p>
  </div>
</template>
