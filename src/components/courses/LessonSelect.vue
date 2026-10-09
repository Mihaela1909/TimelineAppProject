<script setup>
import AppIcon from '../ui/AppIcon.vue'

// Lesson page: jump straight to any lesson of the course. A native <select>,
// so it works with keyboard, screen readers and phone pickers out of the box.
defineProps({
  lessons: { type: Array, required: true },
  currentId: { type: String, required: true },
  completedIds: { type: Array, default: () => [] },
})
const emit = defineEmits(['select'])
</script>

<template>
  <div class="relative">
    <label for="lesson-select" class="sr-only">Jump to lesson</label>
    <select
      id="lesson-select"
      :value="currentId"
      class="appearance-none w-full sm:w-auto sm:max-w-xs truncate pl-4 pr-10 py-2 rounded-md bg-field border border-field-border text-bark shadow-[0_2px_4px_rgba(0,0,0,0.12)] cursor-pointer focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
      @change="emit('select', $event.target.value)"
    >
      <option v-for="(lesson, index) in lessons" :key="lesson.$id" :value="lesson.$id">
        {{ index + 1 }}. {{ lesson.title }}{{ completedIds.includes(lesson.$id) ? ' ✓' : '' }}
      </option>
    </select>
    <AppIcon name="chevron" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark pointer-events-none" />
  </div>
</template>
