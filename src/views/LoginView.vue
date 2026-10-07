<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthScene from '../components/auth/AuthScene.vue'
import AuthField from '../components/auth/AuthField.vue'

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
  <AuthScene title="Welcome Back">
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4" role="alert">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit">
      <AuthField id="login-email" v-model="email" label="Email" type="email" placeholder="Example@email.com" autocomplete="email" />
      <AuthField id="login-password" v-model="password" label="Password" type="password" placeholder="At least 8 characters" autocomplete="current-password" />

      <button type="submit" :disabled="loading" class="w-full py-3 rounded-lg bg-olive text-white text-lg shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 transition-colors disabled:opacity-60 mt-2">
        {{ loading ? 'Logging in…' : 'Log In' }}
      </button>
    </form>

    <p class="text-center text-bark mt-3">
      Don't have an account?
      <RouterLink :to="{ name: 'register', query: route.query }" class="text-ochre font-bold hover:underline">Sign up</RouterLink>
    </p>
  </AuthScene>
</template>
