import { ref } from 'vue'
import * as authService from '../services/authService'
import { getProfileByUserId } from '../services/profileService'

// This state is intentionally declared OUTSIDE the function, at module
// scope. That makes it a singleton — every component that calls useAuth()
// shares the exact same `currentUser` ref, instead of each getting its
// own separate copy. This is what lets the header, the router guard, and
// the profile page all agree on who's logged in without a Pinia store.
const currentUser = ref(null)
const authChecked = ref(false)

export function useAuth() {
  const loading = ref(false)
  const error = ref(null)

  async function register({ email, password, name }) {
    loading.value = true
    error.value = null
    try {
      await authService.registerUser({ email, password, name })
      await refreshCurrentUser()
    } catch (err) {
      error.value = err.message || 'Could not create account.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login({ email, password }) {
    loading.value = true
    error.value = null
    try {
      await authService.loginUser({ email, password })
      await refreshCurrentUser()
    } catch (err) {
      error.value = 'Incorrect email or password.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authService.logoutUser()
    currentUser.value = null
  }

  async function refreshCurrentUser() {
    try {
      const account = await authService.getCurrentUser()
      // Appwrite's Account object has no `role` field — that lives in
      // our own `profiles` table, so we fetch it separately and merge
      // it in. Everything downstream (router guard, header, admin UI)
      // just reads `currentUser.value.role` without knowing this happened.
      const profile = await getProfileByUserId(account.$id)
      currentUser.value = { ...account, role: profile?.role || null }
    } catch {
      currentUser.value = null
    } finally {
      authChecked.value = true
    }
  }

  return { currentUser, authChecked, loading, error, register, login, logout, refreshCurrentUser }
}