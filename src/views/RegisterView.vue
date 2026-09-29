<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const { register, loading, error } = useAuth()
const router = useRouter()

const passwordsMismatch = computed(
  () => confirmPassword.value.length > 0 && password.value !== confirmPassword.value
)

async function handleSubmit() {
  if (passwordsMismatch.value) return
  try {
    await register({ name: name.value, email: email.value, password: password.value })
    router.push('/')
  } catch {
    // error message is already set reactively by useAuth
  }
}
</script>

<template>
  <div class="flex justify-center py-16 px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl p-8">
      <h1 class="text-lg font-semibold text-center text-bark mb-1">Create your account</h1>
      <p class="text-xs text-center text-bark/60 mb-5">Free forever — save your progress as you go</p>

      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4"
        role="alert"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <label class="text-xs text-bark/70 block mb-1">Display name</label>
        <input
          v-model="name"
          type="text"
          required
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3"
        />

        <label class="text-xs text-bark/70 block mb-1">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3"
        />

        <label class="text-xs text-bark/70 block mb-1">Password</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="8"
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-3"
        />

        <label class="text-xs text-bark/70 block mb-1">Confirm password</label>
        <input
          v-model="confirmPassword"
          type="password"
          required
          class="w-full px-3 py-2 border rounded-md text-sm mb-1"
          :class="passwordsMismatch ? 'border-red-400' : 'border-black/10'"
        />
        <p v-if="passwordsMismatch" class="text-xs text-red-500 mb-3">Passwords don't match</p>
        <div v-else class="mb-4"></div>

        <button
          type="submit"
          :disabled="loading || passwordsMismatch"
          class="w-full py-2.5 bg-olive text-white rounded-md text-sm font-medium hover:bg-olive/90 transition-colors disabled:opacity-60"
        >
          {{ loading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <p class="text-center text-xs text-bark/60 mt-4">
        Already have an account?
        <RouterLink to="/login" class="text-olive font-medium">Log in</RouterLink>
      </p>
    </div>
  </div>
</template>