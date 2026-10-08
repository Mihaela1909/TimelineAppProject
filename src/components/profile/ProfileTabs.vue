<script setup>
// Profile tab bar: text tabs with an olive underline on the active one.
defineProps({
  tabs: { type: Array, required: true }, // [{ id, label }]
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex gap-6 md:gap-10 mb-8 overflow-x-auto whitespace-nowrap [scrollbar-width:none]" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.id"
      class="font-sans pb-1.5 border-b-2 text-lg md:text-xl transition-colors"
      :class="modelValue === tab.id ? 'border-olive text-olive font-semibold' : 'border-transparent text-bark/70 hover:text-bark'"
      @click="emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
