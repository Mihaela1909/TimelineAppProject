<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const { login, loading, error } = useAuth()
const router = useRouter()
const route = useRoute()

async function handleSubmit() {
  try {
    await login({ email: email.value, password: password.value })
    router.push(route.query.redirect || '/')
  } catch {
    // error message is already set reactively by useAuth — nothing else to do here
  }
}
</script>

<template>
  <div class="flex justify-center py-16 px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl p-8">
      <h1 class="text-lg font-semibold text-center text-bark mb-5">Welcome back</h1>

      <div
        v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4"
        role="alert"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
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
          class="w-full px-3 py-2 border border-black/10 rounded-md text-sm mb-5"
        />

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-olive text-white rounded-md text-sm font-medium hover:bg-olive/90 transition-colors disabled:opacity-60"
        >
          {{ loading ? 'Logging in…' : 'Log in' }}
        </button>
      </form>

      <p class="text-center text-xs text-bark/60 mt-4">
        Don't have an account?
        <RouterLink to="/register" class="text-olive font-medium">Sign up</RouterLink>
      </p>
    </div>
  </div>
</template>