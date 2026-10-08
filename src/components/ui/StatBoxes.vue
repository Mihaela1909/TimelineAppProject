<script setup>
// Row of stat boxes (white, olive border, big number + label) — quiz intro + profile.
// The layout (flex/grid, gaps) comes from the parent's class on the <dl>;
// itemClass sizes the boxes.
defineProps({
  stats: { type: Array, required: true }, // [{ value, label }]
  itemClass: { type: String, default: '' },
})
</script>

<template>
  <dl class="text-center">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex flex-col-reverse py-3 md:py-4 px-2 rounded-xl bg-white border-2 border-olive shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
      :class="itemClass"
    >
      <dt class="text-sm md:text-lg text-olive">{{ stat.label }}</dt>
      <dd class="text-2xl md:text-4xl font-bold text-olive">{{ stat.value }}</dd>
    </div>
  </dl>
</template>
