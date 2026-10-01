<script setup>
import { onMounted, ref } from 'vue'
import {
  listPendingSubmissions,
  approvePendingImage,
  rejectPendingImage,
} from '../../services/profileSettingsService'
import { getImagePreviewUrl } from '../../services/mediaService'
import { useToast } from '../../composables/useToast'

const toast = useToast()
const requests = ref([])
const loading = ref(true)
const error = ref(null)
const busyKey = ref(null)

// One profile_settings row can hold BOTH a pending avatar and a pending
// header, so flatten it into one request per image the admin can act on.
async function fetchAll() {
  loading.value = true
  error.value = null
  try {
    const rows = await listPendingSubmissions()
    requests.value = rows.flatMap((row) => [
      ...(row.pendingAvatarImageId ? [{ key: `${row.$id}-avatar`, row, kind: 'avatar', fileId: row.pendingAvatarImageId }] : []),
      ...(row.pendingHeaderImageId ? [{ key: `${row.$id}-header`, row, kind: 'header', fileId: row.pendingHeaderImageId }] : []),
    ])
  } catch (err) {
    console.error(err)
    error.value = 'Could not load pending images.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)

async function decide(request, approve) {
  busyKey.value = request.key
  try {
    await (approve ? approvePendingImage : rejectPendingImage)(request.row, request.kind)
    toast.success(approve ? 'Image approved' : 'Image rejected')
    await fetchAll()
  } catch (err) {
    console.error(err)
    toast.error('Action failed — check admin permissions on profiles / profile_settings.')
  } finally {
    busyKey.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="font-voice text-3xl text-bark">Image Approvals</h1>
      <button class="text-sm px-4 py-2 rounded-md border border-olive text-olive" @click="fetchAll">Refresh</button>
    </div>

    <div v-if="loading" class="bg-white rounded-xl p-6 space-y-3" aria-live="polite">
      <div v-for="n in 3" :key="n" class="h-8 bg-olive-light rounded animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center text-sm">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAll">Retry</button>
    </div>

    <div v-else-if="requests.length === 0" class="bg-white rounded-xl p-12 text-center text-sm text-bark/60">
      No images waiting for approval.
    </div>

    <div v-else class="bg-white rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-bark/50 border-b border-black/5">
            <th class="py-3 px-5 font-medium">Image</th>
            <th class="py-3 px-5 font-medium">Type</th>
            <th class="py-3 px-5 font-medium">User ID</th>
            <th class="py-3 px-5"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.key" class="border-b border-black/5 last:border-0">
            <td class="py-3 px-5">
              <a :href="getImagePreviewUrl(request.fileId)" target="_blank" rel="noopener">
                <img
                  :src="getImagePreviewUrl(request.fileId)"
                  alt=""
                  class="object-cover"
                  :class="request.kind === 'avatar' ? 'w-14 h-14 rounded-full' : 'w-32 h-14 rounded-lg'"
                />
              </a>
            </td>
            <td class="py-3 px-5 text-bark">{{ request.kind === 'avatar' ? 'Profile picture' : 'Profile header' }}</td>
            <td class="py-3 px-5 text-bark/60 font-mono text-xs">{{ request.row.userId }}</td>
            <td class="py-3 px-5 text-right whitespace-nowrap">
              <button
                class="text-xs px-3 py-1.5 rounded-md bg-olive text-white disabled:opacity-60 mr-2"
                :disabled="busyKey === request.key"
                @click="decide(request, true)"
              >
                Approve
              </button>
              <button
                class="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 disabled:opacity-60"
                :disabled="busyKey === request.key"
                @click="decide(request, false)"
              >
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
