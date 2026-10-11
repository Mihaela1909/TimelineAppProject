<script setup>
import AppIcon from './AppIcon.vue'

// Search box + sort menu + category pills above the courses / quizzes / blog grids.
// Dumb component: the page owns the values (v-model) via useListControls.
defineProps({
  noun: { type: String, required: true }, // "courses", "quizzes", "posts"
  sorts: { type: Array, required: true }, // [{ value, label }]
  categories: { type: Array, required: true },
})
const search = defineModel('search', { type: String, required: true })
const sort = defineModel('sort', { type: String, required: true })
const category = defineModel('category', { type: String, required: true })
</script>

<template>
  <!-- Search + sort -->
  <div class="flex gap-3 md:gap-5 mb-4">
    <label class="relative flex-1">
      <span class="sr-only">Search {{ noun }}</span>
      <AppIcon name="search" class="w-5 h-5 text-bark/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        v-model="search"
        type="search"
        :placeholder="`Search ${noun}...`"
        class="w-full pl-12 pr-4 py-2.5 md:py-3 bg-white border border-field-border rounded-md text-base text-bark placeholder:text-bark/50 shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
      />
    </label>
    <label class="relative">
      <span class="sr-only">Sort {{ noun }}</span>
      <select
        v-model="sort"
        class="appearance-none h-full pl-3 md:pl-4 pr-8 md:pr-10 py-2.5 md:py-3 bg-white border border-field-border rounded-md text-xs md:text-base font-semibold text-ochre shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20 cursor-pointer"
      >
        <option v-for="s in sorts" :key="s.value" :value="s.value">Sort: {{ s.label }}</option>
      </select>
      <AppIcon name="chevron" class="w-4 h-4 md:w-5 md:h-5 text-ochre absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </label>
  </div>

  <!-- Category pills (scroll sideways on phones) -->
  <div class="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:flex-wrap mb-8 md:mb-12 [scrollbar-width:none]" role="group" aria-label="Filter by category">
    <button
      v-for="cat in categories"
      :key="cat"
      type="button"
      class="flex-shrink-0 px-5 py-1 rounded-full text-base border shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-colors"
      :class="category === cat ? 'bg-olive text-white border-olive font-semibold' : 'bg-white text-olive border-bark/30 hover:bg-parchment'"
      :aria-pressed="category === cat"
      @click="category = cat"
    >
      {{ cat }}
    </button>
  </div>
</template>
