<script setup>
import { ref, computed, watch } from 'vue'

// Pick an existing category OR create a new one by typing it.
// Dumb component: it only knows the list of names it's given (`options`)
// and emits the chosen string via v-model — saving is the parent's job.
// Categories are plain strings on each row, so "creating" one just means
// saving a row with a new name; there's no separate categories table.
const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  id: { type: String, required: true },
  placeholder: { type: String, default: 'Choose or type a new category' },
  required: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const query = ref(props.modelValue || '')
const open = ref(false)
const highlighted = ref(0)
// True once the user types; until then the list shows every category,
// not just the one already selected.
const typing = ref(false)

// Keep the text in sync when the parent loads an existing row.
watch(
  () => props.modelValue,
  (value) => {
    query.value = value || ''
  }
)

const normalize = (name) => name.trim().replace(/\s+/g, ' ')

// Unique, trimmed, alphabetical — options may contain duplicates/blanks
// because they come straight from existing rows.
const allOptions = computed(() =>
  [...new Set(props.options.filter(Boolean).map(normalize))].sort((a, b) => a.localeCompare(b))
)

const typed = computed(() => normalize(query.value))
const exactMatch = computed(() => allOptions.value.find((o) => o.toLowerCase() === typed.value.toLowerCase()))

const filtered = computed(() =>
  typing.value ? allOptions.value.filter((o) => o.toLowerCase().includes(typed.value.toLowerCase())) : allOptions.value
)

// List items: matching categories, plus "Create …" when the typed name is new.
const items = computed(() => [
  ...filtered.value.map((name) => ({ name, isNew: false })),
  ...(typing.value && typed.value && !exactMatch.value ? [{ name: typed.value, isNew: true }] : []),
])

// Typing "ancient" when "Ancient" exists reuses "Ancient" — no near-duplicates.
function choose(name) {
  const clean = normalize(name || '')
  const existing = allOptions.value.find((o) => o.toLowerCase() === clean.toLowerCase())
  const value = existing || clean
  query.value = value
  emit('update:modelValue', value)
  open.value = false
  typing.value = false
}

function onInput() {
  typing.value = true
  open.value = true
  highlighted.value = 0
}

// Leaving the field keeps whatever was typed (a new category is fine).
function onBlur() {
  if (typed.value !== (props.modelValue || '')) choose(typed.value)
  open.value = false
  typing.value = false
}

function onKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    open.value = true
    highlighted.value = Math.min(highlighted.value + 1, items.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlighted.value = Math.max(highlighted.value - 1, 0)
  } else if (e.key === 'Enter' && open.value && items.value.length) {
    e.preventDefault() // pick from the list instead of submitting the form
    choose(items.value[highlighted.value].name)
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

const listId = computed(() => `${props.id}-options`)
const optionId = (i) => `${props.id}-option-${i}`
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      v-model="query"
      type="text"
      autocomplete="off"
      role="combobox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="open && items.length ? optionId(highlighted) : undefined"
      aria-autocomplete="list"
      :required="required"
      :placeholder="placeholder"
      class="w-full px-4 py-2.5 bg-field border border-field-border rounded-md text-base text-bark placeholder:text-bark/40 focus:outline-none focus:border-olive focus:ring-2 focus:ring-olive/20"
      @focus="open = true"
      @input="onInput"
      @blur="onBlur"
      @keydown="onKeydown"
    />

    <ul
      v-if="open && items.length"
      :id="listId"
      role="listbox"
      class="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-field-border rounded-md shadow-lg py-1"
    >
      <!-- mousedown.prevent: keeps focus in the input so blur doesn't fire before the click -->
      <li
        v-for="(item, i) in items"
        :id="optionId(i)"
        :key="item.isNew ? `new-${item.name}` : item.name"
        role="option"
        :aria-selected="i === highlighted"
        class="px-4 py-2 text-base cursor-pointer flex items-center justify-between"
        :class="i === highlighted ? 'bg-olive-light/70' : ''"
        @mousedown.prevent="choose(item.name)"
        @mouseenter="highlighted = i"
      >
        <span v-if="item.isNew" class="text-olive font-semibold">+ Create “{{ item.name }}”</span>
        <span v-else class="text-bark">{{ item.name }}</span>
        <span v-if="!item.isNew && item.name === modelValue" class="text-olive" aria-hidden="true">✓</span>
      </li>
    </ul>
  </div>
</template>
