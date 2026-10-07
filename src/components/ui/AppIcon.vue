<script setup>
import { computed } from 'vue'

// Tiny inline-SVG icon set (Tabler-style outline icons) so we don't need
// an icon font/library just for the admin sidebar and dashboard.
// Usage: <AppIcon name="home" class="w-5 h-5" />
// PATHS are outline (stroke) icons; FILLED are solid shapes.
const props = defineProps({
  name: { type: String, required: true },
})

// Solid icons (fill instead of stroke) — used where the mockups show filled shapes.
const FILLED = {
  edit: ['M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z', 'M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'],
  trash: ['M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z', 'M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'],
  'bookmark-filled': ['M18 7v14l-6-4-6 4V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4z'],
  grip: ['M7.5 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0', 'M12.5 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0', 'M7.5 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0', 'M12.5 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0', 'M7.5 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0', 'M12.5 19a2 2 0 1 0 4 0a2 2 0 1 0-4 0'],
}

const PATHS = {
  home: ['M5 12H3l9-9 9 9h-2', 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7', 'M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6'],
  course: ['M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M9 4v8l2-1.5 2 1.5V4'],
  quiz: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0', 'M12 17v.01', 'M12 13.5a1.5 1.5 0 0 1 1-1.5 2.6 2.6 0 1 0-3-4'],
  post: ['M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M7 8h10', 'M7 12h10', 'M7 16h6'],
  user: ['M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2', 'M16 3.13a4 4 0 0 1 0 7.75', 'M21 21v-2a4 4 0 0 0-3-3.85'],
  photo: ['M15 8h.01', 'M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z', 'M3 16l5-5c.928-.893 2.072-.893 3 0l5 5', 'M14 14l1-1c.928-.893 2.072-.893 3 0l3 3'],
  'user-off': ['M8.18 8.189a4.01 4.01 0 0 0 2.616 2.627m3.507-.545a4 4 0 1 0-5.59-5.552', 'M6 21v-2a4 4 0 0 1 4-4h4c.412 0 .81.062 1.183.178m2.633 2.618c.12.38.184.785.184 1.204v2', 'M3 3l18 18'],
  chevron: ['M6 9l6 6 6-6'],
  logout: ['M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2', 'M9 12h12l-3-3', 'M18 15l3-3'],
  plus: ['M12 5v14', 'M5 12h14'],
  bookmark: ['M18 7v14l-6-4-6 4V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4z'],
  calendar: ['M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', 'M16 3v4', 'M8 3v4', 'M4 11h16', 'M11 15h1v3'],
  share: ['M8 9H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1', 'M12 14V3', 'M9 6l3-3 3 3'],
  shuffle: ['M18 4l3 3-3 3', 'M18 20l3-3-3-3', 'M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5', 'M21 7h-5a4.98 4.98 0 0 0-3 1m-4 8a4.98 4.98 0 0 1-3 1H3'],
  lock: ['M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z', 'M11 16a1 1 0 1 0 2 0a1 1 0 1 0-2 0', 'M8 11V7a4 4 0 1 1 8 0v4'],
  check: ['M5 12l5 5L20 7'],
  search: ['M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0', 'M21 21l-6-6'],
  // Public site
  person: ['M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  close: ['M18 6L6 18', 'M6 6l12 12'],
  'chevron-left': ['M15 6l-6 6 6 6'],
  'chevron-right': ['M9 6l6 6-6 6'],
  'arrow-right': ['M5 12h14', 'M13 18l6-6', 'M13 6l6 6'],
  'coin-off': ['M14.8 9a2 2 0 0 0-1.8-1h-2c-.5 0-.97.18-1.33.5m-.42 3.04c.32.56.92.96 1.62.96h1.13', 'M12 6v2m0 8v2', 'M8.6 16c.36.6 1.02 1 1.75 1h2c.73 0 1.36-.4 1.71-.98', 'M20.04 16.04a9 9 0 0 0-12.08-12.08m-2.32 1.7a9 9 0 0 0 12.71 12.72', 'M3 3l18 18'],
  'book-open': ['M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6v13', 'M12 6v13', 'M21 6v13'],
  'arrow-left': ['M5 12h14', 'M5 12l6 6', 'M5 12l6-6'],
  // Rich text editor toolbar
  bold: ['M7 5h6a3.5 3.5 0 0 1 0 7h-6z', 'M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7'],
  italic: ['M11 5h6', 'M7 19h6', 'M14 5l-4 14'],
  h2: ['M17 12a2 2 0 1 1 4 0c0 .591-.417 1.318-.816 1.858l-3.184 4.142h4', 'M4 6v12', 'M12 6v12', 'M11 18h2', 'M3 18h2', 'M4 12h8', 'M3 6h2', 'M11 6h2'],
  h3: ['M19 14a2 2 0 1 0-2-2', 'M17 16a2 2 0 1 0 2-2', 'M4 6v12', 'M12 6v12', 'M11 18h2', 'M3 18h2', 'M4 12h8', 'M3 6h2', 'M11 6h2'],
  list: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'M5 6v.01', 'M5 12v.01', 'M5 18v.01'],
  'list-numbers': ['M11 6h9', 'M11 12h9', 'M12 18h8', 'M4 16a2 2 0 1 1 4 0c0 .591-.5 1-1 1.5l-3 2.5h4', 'M6 10v-6l-2 2'],
  link: ['M9 15l6-6', 'M11 6l.463-.536a5 5 0 0 1 7.071 7.072l-.534.464', 'M13 18l-.397.534a5.068 5.068 0 0 1-7.127 0a4.972 4.972 0 0 1 0-7.071l.524-.463'],
  quote: ['M10 11h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2.667-1.333 4.333-4 5', 'M19 11h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6c0 2.667-1.333 4.333-4 5'],
}

const filled = computed(() => props.name in FILLED)
const paths = computed(() => FILLED[props.name] || PATHS[props.name] || [])
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    :stroke="filled ? 'none' : 'currentColor'"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in paths" :key="d" :d="d" />
  </svg>
</template>
