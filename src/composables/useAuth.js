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

// Appwrite's own minimum — checked here first so the user gets a clear
// message instead of a raw API error.
const MIN_PASSWORD_LENGTH = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useAuth() {
  const loading = ref(false)
  const error = ref(null)

  // Login/register THROW on failure (the views catch it and stay on the
  // page); the update* actions below RETURN true/false instead.
  function fail(message) {
    error.value = message
    throw new Error(message)
  }

  async function register({ email, password, name }) {
    error.value = null
    name = name?.trim()
    email = email?.trim()
    if (!name) fail('Please enter your name.')
    if (!EMAIL_PATTERN.test(email || '')) fail('Please enter a valid email address.')
    if ((password || '').length < MIN_PASSWORD_LENGTH) fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)

    loading.value = true
    try {
      await authService.registerUser({ email, password, name })
      await refreshCurrentUser()
    } catch (err) {
      console.error(err)
      // 409 = Appwrite "already exists". Never show raw API text to users.
      error.value = err.code === 409 ? 'An account with this email already exists.' : 'Could not create your account. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login({ email, password }) {
    error.value = null
    email = email?.trim()
    if (!email || !password) fail('Please enter your email and password.')

    loading.value = true
    try {
      try {
        await authService.loginUser({ email, password })
      } catch (err) {
        error.value = 'Incorrect email or password.'
        throw err
      }
      await refreshCurrentUser()
      // Correct password but no user afterwards = the account is
      // deactivated (refreshCurrentUser signed them straight back out).
      if (!currentUser.value) {
        error.value = 'This account has been deactivated. Please contact an admin.'
        throw new Error('Account deactivated')
      }
    } finally {
      loading.value = false
    }
  }

  async function updateName(name) {
    if (loading.value) return false
    error.value = null
    name = name?.trim()
    if (!name) {
      error.value = 'Name cannot be empty.'
      return false
    }
    loading.value = true
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
    if (loading.value) return false
    error.value = null
    email = email?.trim()
    if (!EMAIL_PATTERN.test(email || '')) {
      error.value = 'Please enter a valid email address.'
      return false
    }
    loading.value = true
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
    if (loading.value) return false
    error.value = null
    if ((newPassword || '').length < MIN_PASSWORD_LENGTH) {
      error.value = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      return false
    }
    if (newPassword === oldPassword) {
      error.value = 'New password must be different from your current one.'
      return false
    }
    loading.value = true
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
      let profile = null
      try {
        profile = await getProfileByUserId(account.$id)
        role = profile?.role || null
        avatarImageId = profile?.avatarImageId || null
        headerImageId = profile?.headerImageId || null
      } catch (err) {
        console.error('Could not load profiles row:', err)
      }

      // Deactivated by an admin → end the session. Only an explicit
      // `false` counts; rows from before the `active` column are null.
      if (profile?.active === false) {
        await authService.logoutUser().catch(() => {})
        throw new Error('Account deactivated')
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