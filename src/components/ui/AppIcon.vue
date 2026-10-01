<script setup>
// Tiny inline-SVG icon set (Tabler-style outline icons) so we don't need
// an icon font/library just for the admin sidebar and dashboard.
// Usage: <AppIcon name="home" class="w-5 h-5" />
defineProps({
  name: { type: String, required: true },
})

const PATHS = {
  home: ['M5 12H3l9-9 9 9h-2', 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7', 'M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6'],
  course: ['M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M9 4v8l2-1.5 2 1.5V4'],
  quiz: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 17v.01', 'M12 13.5a1.5 1.5 0 0 1 1-1.5 2.6 2.6 0 1 0-3-4'],
  post: ['M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M7 8h10', 'M7 12h10', 'M7 16h6'],
  user: ['M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2', 'M16 3.13a4 4 0 0 1 0 7.75', 'M21 21v-2a4 4 0 0 0-3-3.85'],
  photo: ['M15 8h.01', 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z', 'M3 16l5-5c.928-.893 2.072-.893 3 0l5 5', 'M14 14l1-1c.928-.893 2.072-.893 3 0l3 3'],
  chevron: ['M6 9l6 6 6-6'],
  logout: ['M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2', 'M9 12h12l-3-3', 'M18 15l3-3'],
  plus: ['M12 5v14', 'M5 12h14'],
}
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in PATHS[name]" :key="d" :d="d" />
  </svg>
</template>
