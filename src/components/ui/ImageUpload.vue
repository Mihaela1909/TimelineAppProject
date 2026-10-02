<script setup>
import { ref, computed } from 'vue'
import { getImagePreviewUrl } from '../../services/mediaService'
import { useImageUpload } from '../../composables/useImageUpload'
import AppIcon from './AppIcon.vue'

// v-model here is the Appwrite file ID (a string), not the file itself.
// The parent form just does v-model="form.imageId" like any other field.
const props = defineProps({
  modelValue: { type: String, default: null },
  label: { type: String, default: 'Image' },
  rounded: { type: Boolean, default: false }, // true = circular preview, for avatars
  required: { type: Boolean, default: false }, // shows the * marker
  invalid: { type: Boolean, default: false }, // parent sets this after a save attempt with no image
})
const emit = defineEmits(['update:modelValue'])

const { uploading, error, upload } = useImageUpload()
const fileInput = ref(null)
const isDragging = ref(false)

const previewUrl = computed(() => getImagePreviewUrl(props.modelValue))

async function handleFile(file) {
  const fileId = await upload(file)
  if (fileId) emit('update:modelValue', fileId)
}

function onDrop(e) {
  isDragging.value = false
  handleFile(e.dataTransfer.files[0])
}

function onFileInputChange(e) {
  handleFile(e.target.files[0])
  e.target.value = ''
}

function clearImage() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <label class="text-base text-bark block mb-2">
      {{ label }} <sup v-if="required" class="text-bark/60">*</sup>
    </label>

    <div v-if="!modelValue">
      <div
        class="border bg-white cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5 text-center"
        :class="[
          rounded ? 'w-28 h-28 rounded-full' : 'w-48 h-28 rounded-md',
          isDragging ? 'border-olive bg-olive-light/40' : invalid ? 'border-red-400 bg-red-50/50' : 'border-black/25 hover:border-olive',
        ]"
        role="button"
        tabindex="0"
        :aria-label="`Upload ${label}${required ? ' (required)' : ''}: drag a file here or browse`"
        :aria-invalid="invalid || undefined"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInput.click()"
        @keydown.enter.prevent="fileInput.click()"
        @keydown.space.prevent="fileInput.click()"
      >
        <span v-if="uploading" class="text-sm text-sand-dark">Uploading…</span>
        <template v-else>
          <AppIcon name="photo" class="w-8 h-8 text-sand" />
          <span class="text-base text-sand-dark">
            Drag or <span class="text-olive font-semibold">browse</span>
          </span>
        </template>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInputChange" />
      </div>
    </div>

    <div v-else class="relative inline-block">
      <img
        :src="previewUrl"
        alt=""
        class="object-cover border border-black/10"
        :class="rounded ? 'w-28 h-28 rounded-full' : 'h-28 rounded-md'"
      />
      <button
        type="button"
        class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600"
        aria-label="Remove image"
        @click="clearImage"
      >
        ×
      </button>
      <button
        type="button"
        class="block text-sm text-olive font-semibold mt-2 hover:underline"
        @click="fileInput.click()"
      >
        {{ uploading ? 'Uploading…' : 'Change' }}
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInputChange" />
    </div>

    <p v-if="error" class="text-sm text-red-600 mt-1.5">{{ error }}</p>
    <p v-else-if="invalid && !modelValue" class="text-sm text-red-600 mt-1.5">Please add an image.</p>
  </div>
</template>