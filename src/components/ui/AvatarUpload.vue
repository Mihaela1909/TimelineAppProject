<script setup>
import { ref, computed } from 'vue'
import { getImagePreviewUrl } from '../../services/mediaService'
import { useImageUpload } from '../../composables/useImageUpload'
import { REMOVE_IMAGE } from '../../constants/images'

// Personal photos (avatar, profile header) don't go live immediately —
// an upload becomes a PENDING submission that an admin must approve.
// This component only uploads the file and reports its ID; the parent
// decides where it's stored. Deliberately no "choose existing" option.
const props = defineProps({
  liveImageId: { type: String, default: null },
  pendingImageId: { type: String, default: null },
  shape: { type: String, default: 'circle' }, // 'circle' | 'rectangle'
})
// submit(fileId) = new photo, remove = ask to remove the live one, withdraw = cancel the request
const emit = defineEmits(['submit', 'remove', 'withdraw'])

const removalPending = computed(() => props.pendingImageId === REMOVE_IMAGE)

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

    <!-- Pending request: the new photo, or an empty "No photo" box for a removal -->
    <div v-if="pendingImageId" class="flex items-center gap-2">
      <span class="text-bark/40 text-sm" aria-hidden="true">→</span>
      <div
        class="overflow-hidden flex-shrink-0 flex items-center justify-center"
        :class="[
          shape === 'circle' ? 'w-20 h-20 rounded-full' : 'w-32 h-16 rounded-lg',
          removalPending ? 'bg-olive-light border-2 border-dashed border-ochre' : 'opacity-70 ring-2 ring-ochre',
        ]"
      >
        <span v-if="removalPending" class="text-xs text-bark/70">No photo</span>
        <img v-else :src="getImagePreviewUrl(pendingImageId)" alt="" class="w-full h-full object-cover" />
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
      <!-- Only when there's a live photo and no request open -->
      <button
        v-else-if="liveImageId"
        type="button"
        class="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-left hover:bg-red-50"
        @click="emit('remove')"
      >
        Remove photo
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileInputChange" />
    </div>
  </div>

  <p v-if="removalPending" class="text-xs text-yellow-700 mt-2">⏳ Removal awaiting admin approval.</p>
  <p v-else-if="pendingImageId" class="text-xs text-yellow-700 mt-2">⏳ New photo awaiting admin approval.</p>
  <p v-if="error" class="text-xs text-red-500 mt-2">{{ error }}</p>
</template>
