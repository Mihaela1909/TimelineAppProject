<script setup>
import { ref } from 'vue'
import AppIcon from '../ui/AppIcon.vue'

// Quiz editor → Questions tab: the ordered question list.
// Drag to reorder (mouse) + Arrow Up/Down on the grip handle (keyboard).
// Dumb: the drag state is local UI state; saving the order and deleting are
// emitted to the page (move(from, to), delete(question)).
defineProps({
  questions: { type: Array, required: true },
  quizId: { type: String, required: true },
  deleting: { type: Boolean, default: false },
})
const emit = defineEmits(['move', 'delete'])

const dragIndex = ref(null)
const overIndex = ref(null)

function onDragStart(index, event) {
  dragIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  dragIndex.value = null
  overIndex.value = null
}

function onDrop(index) {
  const from = dragIndex.value
  onDragEnd()
  if (from !== null && from !== index) emit('move', from, index)
}
</script>

<template>
  <ol class="space-y-3">
    <li
      v-for="(question, index) in questions"
      :key="question.$id"
      draggable="true"
      class="flex items-start gap-3 px-4 py-3.5 bg-white border rounded-md transition-colors"
      :class="[
        dragIndex === index ? 'opacity-40' : '',
        overIndex === index && dragIndex !== index ? 'border-olive ring-2 ring-olive/20' : 'border-field-border',
      ]"
      @dragstart="onDragStart(index, $event)"
      @dragover.prevent="overIndex = index"
      @drop.prevent="onDrop(index)"
      @dragend="onDragEnd"
    >
      <button
        type="button"
        class="mt-1 text-black/20 hover:text-bark/50 cursor-grab active:cursor-grabbing rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/40"
        :aria-label="`Question ${index + 1}: press Arrow Up or Down to move it`"
        @keydown.up.prevent="emit('move', index, index - 1)"
        @keydown.down.prevent="emit('move', index, index + 1)"
      >
        <AppIcon name="grip" class="w-5 h-5" />
      </button>

      <span class="text-lg text-bark/50 w-8 flex-shrink-0">Q{{ index + 1 }}</span>

      <div class="flex-1 min-w-0">
        <p class="text-lg text-bark">{{ question.questionText }}</p>
        <!-- Every answer: the correct one in green with a check, the others in yellow. -->
        <ul v-if="question.options?.length" class="flex flex-wrap gap-1.5 mt-2" aria-label="Answers">
          <li
            v-for="(option, i) in question.options"
            :key="i"
            class="text-sm px-3 py-1 rounded-full"
            :class="i === question.correctOptionIndex ? 'bg-leaf/30 text-bark' : 'bg-butter text-bark'"
          >
            <template v-if="i === question.correctOptionIndex">
              <span aria-hidden="true">✓ </span><span class="sr-only">Correct answer: </span>
            </template>{{ option }}
          </li>
        </ul>
      </div>

      <div class="flex items-center gap-3 self-center">
        <RouterLink
          :to="`/admin/quizzes/${quizId}/questions/${question.$id}/edit`"
          class="text-bark hover:text-olive"
          :aria-label="`Edit question ${index + 1}`"
        >
          <AppIcon name="edit" class="w-6 h-6" />
        </RouterLink>
        <button
          type="button"
          class="text-red-600 hover:text-red-700 disabled:opacity-40"
          :aria-label="`Delete question ${index + 1}`"
          :disabled="deleting"
          @click="emit('delete', question)"
        >
          <AppIcon name="trash" class="w-6 h-6" />
        </button>
      </div>
    </li>
  </ol>
</template>
