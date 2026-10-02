<script setup>
import { ref } from 'vue'
import { getImagePreviewUrl } from '../../services/mediaService'
import { useImageUpload } from '../../composables/useImageUpload'

// Personal photos (avatar, profile header) don't go live immediately —
// an upload becomes a PENDING submission that an admin must approve.
// This component only uploads the file and reports its ID; the parent
// decides where it's stored. Deliberately no "choose existing" option.
const props = defineProps({
  liveImageId: { type: String, default: null },
  pendingImageId: { type: String, default: null },
  shape: { type: String, default: 'circle' }, // 'circle' | 'rectangle'
})
const emit = defineEmits(['submit', 'withdraw'])

const { uploading, error, upload } = useImageUpload()
const fileInput = ref(null)

async function handleFile(file) {
  const fileId = await upload(file)
  if (fileId) emit('submit', fileId)
}

function onFileInputChange(e) {
  handleFile(e.target.files[0])
  e.target.value = ''
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div
      class="overflow-hidden bg-olive-light flex items-center justify-center flex-shrink-0"
      :class="shape === 'circle' ? 'w-20 h-20 rounded-full' : 'w-32 h-16 rounded-lg'"
    >
      <img v-if="liveImageId" :src="getImagePreviewUrl(liveImageId)" alt="" class="w-full h-full object-cover" />
      <span v-else class="text-olive text-xl font-voice">?</span>
    </div>

    <div v-if="pendingImageId" class="flex items-center gap-2">
      <span class="text-bark/40 text-sm">→</span>
      <div
        class="overflow-hidden flex-shrink-0 opacity-70 ring-2 ring-yellow-400"
        :class="shape === 'circle' ? 'w-20 h-20 rounded-full' : 'w-32 h-16 rounded-lg'"
      >
        <img :src="getImagePreviewUrl(pendingImageId)" alt="" class="w-full h-full object-cover" />
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <button
        type="button"
        class="text-xs px-3 py-1.5 rounded-md bg-olive text-white disabled:opacity-60 text-left"
        :disabled="uploading"
        @click="fileInput.click()"
      >
        {{ uploading ? 'Uploading…' : (liveImageId || pendingImageId ? 'Change photo' : 'Upload photo') }}
      </button>
      <button
        v-if="pendingImageId"
        type="button"
        class="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-left"
        @click="emit('withdraw')"
      >
        Cancel request
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInputChange" />
    </div>
  </div>

  <p v-if="pendingImageId" class="text-xs text-yellow-700 mt-2">⏳ New photo awaiting admin approval.</p>
  <p v-if="error" class="text-xs text-red-500 mt-2">{{ error }}</p>
</template>
