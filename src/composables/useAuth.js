import { ref } from 'vue'
import * as authService from '../services/authService'
import { getProfileByUserId } from '../services/profileService'
import { getSettingsByUserId } from '../services/profileSettingsService'

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

  async function updateName(name) {
    loading.value = true
    error.value = null
    try {
      await authService.updateDisplayName(name)
      await refreshCurrentUser()
      return true
    } catch (err) {
      error.value = 'Could not update your name.'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateEmail(email, password) {
    loading.value = true
    error.value = null
    try {
      await authService.updateUserEmail(email, password)
      await refreshCurrentUser()
      return true
    } catch (err) {
      error.value = 'Could not update email — check your password is correct.'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(newPassword, oldPassword) {
    loading.value = true
    error.value = null
    try {
      await authService.updateUserPassword(newPassword, oldPassword)
      return true
    } catch (err) {
      error.value = 'Could not update password — check your current password is correct.'
      console.error(err)
      return false
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
      // account.get() is the one call that MUST succeed for someone to be
      // considered logged in. If this throws, they're genuinely not
      // authenticated — currentUser correctly becomes null.
      const account = await authService.getCurrentUser()

      // Role and avatar are secondary enrichment, each fetched from our
      // own tables. A problem with either one (missing table, bad env var,
      // etc.) should NOT undo a successful login — so each gets its own
      // try/catch and degrades to null instead of failing the whole thing.
      // Live (admin-approved) images live on `profiles`; pending
      // submissions awaiting approval live on `profile_settings`.
      let role = null
      let avatarImageId = null
      let headerImageId = null
      try {
        const profile = await getProfileByUserId(account.$id)
        role = profile?.role || null
        avatarImageId = profile?.avatarImageId || null
        headerImageId = profile?.headerImageId || null
      } catch (err) {
        console.error('Could not load profiles row:', err)
      }

      let pendingAvatarImageId = null
      let pendingHeaderImageId = null
      try {
        const settings = await getSettingsByUserId(account.$id)
        pendingAvatarImageId = settings?.pendingAvatarImageId || null
        pendingHeaderImageId = settings?.pendingHeaderImageId || null
      } catch (err) {
        console.error('Could not load profile_settings row:', err)
      }

      currentUser.value = {
        ...account,
        role,
        avatarImageId,
        headerImageId,
        pendingAvatarImageId,
        pendingHeaderImageId,
      }
    } catch {
      currentUser.value = null
    } finally {
      authChecked.value = true
    }
  }

  return {
    currentUser,
    authChecked,
    loading,
    error,
    register,
    login,
    logout,
    refreshCurrentUser,
    updateName,
    updateEmail,
    updatePassword,
  }
}