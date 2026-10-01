<script setup>
import { ref, computed } from 'vue'
import { uploadImage, getImagePreviewUrl } from '../../services/mediaService'

// v-model here is the Appwrite file ID (a string), not the file itself.
// The parent form just does v-model="form.imageId" like any other field.
const props = defineProps({
  modelValue: { type: String, default: null },
  label: { type: String, default: 'Image' },
  rounded: { type: Boolean, default: false }, // true = circular preview, for avatars
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
  e.target.value = ''
}

function clearImage() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <label class="text-xs text-bark/70 block mb-1">{{ label }}</label>

    <div v-if="!modelValue">
      <div
        class="border-2 border-dashed p-6 text-center text-xs text-bark/50 cursor-pointer transition-colors"
        :class="[rounded ? 'rounded-full aspect-square flex items-center justify-center p-4' : 'rounded-lg', isDragging ? 'border-olive bg-olive-light/40' : 'border-black/15 hover:border-olive/50']"
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
    </div>

    <div v-else class="relative inline-block">
      <img
        :src="previewUrl"
        alt=""
        class="object-cover"
        :class="rounded ? 'w-24 h-24 rounded-full' : 'h-24 rounded-lg'"
      />
      <button
        type="button"
        class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
        @click="clearImage"
      >
        ×
      </button>
      <button
        type="button"
        class="block text-xs text-olive font-medium mt-1.5"
        @click="fileInput.click()"
      >
        {{ uploading ? 'Uploading…' : 'Change' }}
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInputChange" />
    </div>

    <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>
  </div>
</template>