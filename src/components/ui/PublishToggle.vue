<script setup>
// Published/Draft switch used by every admin form. Dumb component: a real
// checkbox underneath (keyboard + screen readers work), styled as a pill.
// Usage: <PublishToggle v-model="form.published" />
defineProps({
  modelValue: { type: Boolean, default: false },
  onLabel: { type: String, default: 'Published' },
  offLabel: { type: String, default: 'Draft' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="inline-flex items-center gap-3 cursor-pointer select-none">
    <input
      type="checkbox"
      :checked="modelValue"
      class="peer sr-only"
      @change="emit('update:modelValue', $event.target.checked)"
    />
    <span
      class="relative w-14 h-8 rounded-full bg-black/15 transition-colors peer-checked:bg-olive peer-focus-visible:ring-2 peer-focus-visible:ring-olive/40 after:absolute after:top-1 after:left-1 after:w-6 after:h-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-6"
      aria-hidden="true"
    ></span>
    <span class="text-lg font-semibold" :class="modelValue ? 'text-olive' : 'text-bark/60'">
      {{ modelValue ? onLabel : offLabel }}
    </span>
  </label>
</template>
