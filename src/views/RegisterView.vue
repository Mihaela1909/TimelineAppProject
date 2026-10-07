<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import AuthScene from '../components/auth/AuthScene.vue'
import AuthField from '../components/auth/AuthField.vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const { register, loading, error } = useAuth()
const router = useRouter()
const route = useRoute()

const passwordsMismatch = computed(
  () => confirmPassword.value.length > 0 && password.value !== confirmPassword.value
)

async function handleSubmit() {
  if (passwordsMismatch.value) return
  try {
    await register({ name: name.value, email: email.value, password: password.value })
    router.push(route.query.redirect || '/')
  } catch {
    // error message is already set reactively by useAuth
  }
}
</script>

<template>
  <AuthScene title="Create Account">
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4" role="alert">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit">
      <AuthField id="reg-name" v-model="name" label="Display name" placeholder="Your name" autocomplete="name" />
      <AuthField id="reg-email" v-model="email" label="Email" type="email" placeholder="Example@email.com" autocomplete="email" />
      <AuthField id="reg-password" v-model="password" label="Password" type="password" placeholder="At least 8 characters" autocomplete="new-password" />
      <AuthField
        id="reg-confirm"
        v-model="confirmPassword"
        label="Confirm password"
        type="password"
        placeholder="At least 8 characters"
        autocomplete="new-password"
        :invalid="passwordsMismatch"
      >
        <p v-if="passwordsMismatch" class="text-sm text-red-600 mt-1">Passwords don't match</p>
      </AuthField>

      <button type="submit" :disabled="loading || passwordsMismatch" class="w-full py-3 rounded-lg bg-olive text-white text-lg shadow-[0_4px_8px_rgba(0,0,0,0.3)] hover:bg-olive/90 transition-colors disabled:opacity-60 mt-2">
        {{ loading ? 'Creating account…' : 'Create Account' }}
      </button>
    </form>

    <p class="text-center text-bark mt-3">
      Already have an account?
      <RouterLink :to="{ name: 'login', query: route.query }" class="text-ochre font-bold hover:underline">Log in</RouterLink>
    </p>
  </AuthScene>
</template>
