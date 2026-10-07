<script setup>
// Labelled text input for the auth forms (cream field, from the mockup).
defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
  invalid: { type: Boolean, default: false },
  required: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-4">
    <label :for="id" class="block text-sm text-bark mb-1">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="invalid || undefined"
      :required="required"
      class="w-full px-4 py-2.5 bg-field border rounded-lg text-bark placeholder:text-bark/40 shadow-[0_2px_4px_rgba(0,0,0,0.12)] focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
      :class="invalid ? 'border-red-400' : 'border-field-border'"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <slot />
  </div>
</template>
