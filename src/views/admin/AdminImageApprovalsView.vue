<script setup>
import { onMounted } from 'vue'
import { useImageApprovals } from '../../composables/useImageApprovals'
import { getImagePreviewUrl } from '../../services/mediaService'
import { useToast } from '../../composables/useToast'

const { requests, loading, error, busyKey, fetchAll, decide } = useImageApprovals()
const toast = useToast()

onMounted(fetchAll)

async function handleDecision(request, approve) {
  if (await decide(request, approve)) toast.success(approve ? 'Image approved' : 'Image rejected')
  else toast.error('Action failed — check admin permissions on profiles / profile_settings.')
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
            <th class="py-3 px-5 font-medium">User</th>
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
            <td class="py-3 px-5">
              <span v-if="request.userName" class="text-bark">{{ request.userName }}</span>
              <span v-else class="text-bark/60 font-mono text-xs">{{ request.row.userId }}</span>
            </td>
            <td class="py-3 px-5 text-right whitespace-nowrap">
              <button
                class="text-xs px-3 py-1.5 rounded-md bg-olive text-white disabled:opacity-60 mr-2"
                :disabled="!!busyKey"
                @click="handleDecision(request, true)"
              >
                Approve
              </button>
              <button
                class="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-600 disabled:opacity-60"
                :disabled="!!busyKey"
                @click="handleDecision(request, false)"
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
