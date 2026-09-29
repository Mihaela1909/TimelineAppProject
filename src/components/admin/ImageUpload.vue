<script setup>
import { ref, computed } from 'vue'
import { uploadImage, getImagePreviewUrl } from '../../services/mediaService'

// v-model here is the Appwrite file ID (a string), not the file itself.
// The parent form just does v-model="form.imageId" like any other field.
const props = defineProps({
  modelValue: { type: String, default: null },
  label: { type: String, default: 'Image' },
})
const emit = defineEmits(['update:modelValue'])

const uploading = ref(false)
const error = ref(null)
const fileInput = ref(null)
const isDragging = ref(false)

const previewUrl = computed(() => getImagePreviewUrl(props.modelValue))

async function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    error.value = 'Please choose an image file.'
    return
  }
  uploading.value = true
  error.value = null
  try {
    const fileId = await uploadImage(file)
    emit('update:modelValue', fileId)
  } catch (err) {
    error.value = 'Upload failed. Please try again.'
    console.error(err)
  } finally {
    uploading.value = false
  }
}

function onDrop(e) {
  isDragging.value = false
  handleFile(e.dataTransfer.files[0])
}

function onFileInputChange(e) {
  handleFile(e.target.files[0])
}

function clearImage() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <label class="text-xs text-bark/70 block mb-1">{{ label }}</label>

    <div
      v-if="!modelValue"
      class="border-2 border-dashed rounded-lg p-6 text-center text-xs text-bark/50 cursor-pointer transition-colors"
      :class="isDragging ? 'border-olive bg-olive-light/40' : 'border-black/15 hover:border-olive/50'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInput.click()"
    >
      <div v-if="uploading">Uploading…</div>
      <div v-else>
        Drag an image here, or
        <span class="text-olive font-medium">browse</span>
      </div>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInputChange" />
    </div>

    <div v-else class="relative inline-block">
      <img :src="previewUrl" alt="" class="h-24 rounded-lg object-cover" />
      <button
        type="button"
        class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
        @click="clearImage"
      >
        ×
      </button>
    </div>

    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
  </div>
</template>