<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAdminUsers } from '../../composables/useAdminUsers'
import { useAuth } from '../../composables/useAuth'
import { useToast } from '../../composables/useToast'
import { getImagePreviewUrl } from '../../services/mediaService'
import { ROLES } from '../../constants/roles'
import AppIcon from '../../components/ui/AppIcon.vue'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'

// Same page serves /admin/users (everyone) and /admin/users/inactive.
const props = defineProps({
  inactiveOnly: { type: Boolean, default: false },
})

const { users, loading, error, fetchAll, setRole, setActive } = useAdminUsers()
const { currentUser } = useAuth()
const toast = useToast()

const openMenuId = ref(null)
const pendingDeactivate = ref(null)

onMounted(fetchAll)

// Rows created before the `active` column existed have null → treat as active.
const isActive = (user) => user.active !== false

const visibleUsers = computed(() =>
  props.inactiveOnly ? users.value.filter((u) => !isActive(u)) : users.value
)

const roleOptions = [
  { value: ROLES.USER, label: 'User' },
  { value: ROLES.EDITOR, label: 'Editor' },
  { value: ROLES.ADMIN, label: 'Admin' },
]

const roleStyles = {
  [ROLES.ADMIN]: 'bg-ochre text-bark',
  [ROLES.EDITOR]: 'bg-blue-400 text-blue-950',
  [ROLES.USER]: 'bg-butter text-bark',
}

// An admin demoting or deactivating THEMSELVES would lock them out of the
// panel mid-click, so those actions are disabled on your own row.
const isSelf = (user) => user.userId === currentUser.value?.$id

function formatJoined(date) {
  const d = new Date(date)
  return `${d.toLocaleDateString('en-US', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`
}

function toggleMenu(user) {
  openMenuId.value = openMenuId.value === user.$id ? null : user.$id
}

async function changeRole(user, role) {
  openMenuId.value = null
  if (user.role === role) return
  if (await setRole(user, role)) {
    toast.success(`${user.name || 'User'} is now ${role === ROLES.USER ? 'a' : 'an'} ${role}`)
  } else {
    toast.error('Could not change role — check admin permissions on profiles.')
  }
}

function askDeactivate(user) {
  openMenuId.value = null
  pendingDeactivate.value = user
}

async function confirmDeactivate() {
  const user = pendingDeactivate.value
  pendingDeactivate.value = null
  if (await setActive(user, false)) toast.success(`${user.name || 'User'} deactivated`)
  else toast.error('Could not deactivate user.')
}

async function reactivate(user) {
  openMenuId.value = null
  if (await setActive(user, true)) toast.success(`${user.name || 'User'} reactivated`)
  else toast.error('Could not reactivate user.')
}
</script>

<template>
  <div>
    <h1 class="font-voice text-4xl text-bark mb-8">{{ inactiveOnly ? 'Inactive Users' : 'Users' }}</h1>

    <div v-if="loading" class="bg-white rounded-xl p-6 space-y-3" aria-live="polite">
      <div v-for="n in 4" :key="n" class="h-10 bg-olive-light rounded animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center text-sm">
      <p class="mb-3">{{ error }}</p>
      <button class="px-4 py-2 rounded-md border border-red-400" @click="fetchAll">Retry</button>
    </div>

    <div v-else-if="visibleUsers.length === 0" class="bg-white rounded-xl p-12 text-center text-sm text-bark/60">
      {{ inactiveOnly ? 'No inactive users.' : 'No users yet.' }}
    </div>

    <div v-else class="bg-white rounded-xl px-6 py-4">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-bark border-b border-bark/30">
            <th class="py-3 px-2 font-normal">Name</th>
            <th class="py-3 px-2 font-normal">Email</th>
            <th class="py-3 px-2 font-normal">Role</th>
            <th class="py-3 px-2 font-normal">Joined</th>
            <th class="py-3 px-2 font-normal">Status</th>
            <th class="py-3 px-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in visibleUsers" :key="user.$id" class="border-b border-bark/20 last:border-0">
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full overflow-hidden bg-sand flex items-center justify-center flex-shrink-0">
                  <img v-if="user.avatarImageId" :src="getImagePreviewUrl(user.avatarImageId)" alt="" class="w-full h-full object-cover" />
                  <span v-else class="text-bark text-xs font-semibold">{{ (user.name || '?').charAt(0).toUpperCase() }}</span>
                </div>
                <span class="text-bark">{{ user.name || 'Unnamed user' }}</span>
                <span v-if="isSelf(user)" class="text-xs text-bark/50">(you)</span>
              </div>
            </td>
            <td class="py-3 px-2 text-bark">{{ user.email || '—' }}</td>
            <td class="py-3 px-2">
              <span class="text-xs px-2.5 py-1 rounded-lg capitalize" :class="roleStyles[user.role] || roleStyles[ROLES.USER]">
                {{ user.role || ROLES.USER }}
              </span>
            </td>
            <td class="py-3 px-2 text-bark">{{ formatJoined(user.$createdAt) }}</td>
            <td class="py-3 px-2">
              <span
                class="text-xs px-2.5 py-1 rounded-lg"
                :class="isActive(user) ? 'bg-leaf/30 text-bark' : 'bg-red-500 text-white'"
              >
                {{ isActive(user) ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="py-3 px-2 text-right relative">
              <button
                type="button"
                class="px-2 py-1 rounded-md text-bark font-bold tracking-widest hover:bg-olive-light disabled:opacity-30"
                :disabled="isSelf(user)"
                :title="isSelf(user) ? 'You can’t change your own role or status' : 'Actions'"
                :aria-expanded="openMenuId === user.$id"
                @click="toggleMenu(user)"
              >
                •••
              </button>

              <div
                v-if="openMenuId === user.$id"
                class="absolute right-2 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-black/5 z-20 text-left overflow-hidden"
              >
                <div class="px-4 pt-3 pb-2 text-xs tracking-wider uppercase text-sand font-medium border-b border-black/5">Change role</div>
                <button
                  v-for="option in roleOptions"
                  :key="option.value"
                  type="button"
                  class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-olive-light/60"
                  :class="user.role === option.value ? 'bg-olive-light/60 text-olive font-semibold' : 'text-bark'"
                  @click="changeRole(user, option.value)"
                >
                  {{ option.label }}
                  <span v-if="user.role === option.value">✓</span>
                </button>
                <div class="border-t border-black/5">
                  <button
                    v-if="isActive(user)"
                    type="button"
                    class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    @click="askDeactivate(user)"
                  >
                    <AppIcon name="user-off" class="w-4 h-4" />
                    Deactivate user
                  </button>
                  <button
                    v-else
                    type="button"
                    class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-olive hover:bg-olive-light/60"
                    @click="reactivate(user)"
                  >
                    <AppIcon name="user" class="w-4 h-4" />
                    Reactivate user
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Click-outside catcher for the ••• menu -->
    <div v-if="openMenuId" class="fixed inset-0 z-10" @click="openMenuId = null"></div>

    <ConfirmModal
      :open="!!pendingDeactivate"
      title="Deactivate this user?"
      confirm-label="Deactivate"
      :message="`${pendingDeactivate?.name || 'This user'} won't be able to log in until reactivated, and will be signed out the next time they load the site.`"
      @confirm="confirmDeactivate"
      @cancel="pendingDeactivate = null"
    />
  </div>
</template>
