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
let refreshing = null // the in-flight refreshCurrentUser() request, if any
let latestLoad = 0

// Friendly login messages per Appwrite error type — so a correct password
// that's refused for another reason doesn't show "Incorrect password".
const LOGIN_ERRORS = {
  user_invalid_credentials: 'Incorrect email or password.',
  user_blocked: 'This account has been blocked. Please contact an admin.',
  general_rate_limit_exceeded: 'Too many login attempts. Please wait a few minutes and try again.',
  user_session_already_exists: 'You are already logged in. Please refresh the page.',
}

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
      await refreshCurrentUser({ force: true })
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
        console.error(err)
        error.value =
          LOGIN_ERRORS[err.type] ||
          (err.code === 429 ? LOGIN_ERRORS.general_rate_limit_exceeded : null) ||
          (err.code === 401 ? LOGIN_ERRORS.user_invalid_credentials : 'Could not log in. Please try again.')
        throw err
      }
      await refreshCurrentUser({ force: true })
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
      await refreshCurrentUser({ force: true })
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
      await refreshCurrentUser({ force: true })
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

  // Several callers may ask at once (router guard, header): they share one request.
  // force = after login/register/profile changes, always load fresh; `latestLoad`
  // makes sure an older, slower check can't overwrite the newer result.
  function refreshCurrentUser({ force = false } = {}) {
    if (refreshing && !force) return refreshing
    const load = loadCurrentUser(++latestLoad).finally(() => {
      if (refreshing === load) refreshing = null
    })
    refreshing = load
    return load
  }

  async function loadCurrentUser(loadId) {
    const isLatest = () => loadId === latestLoad
    try {
      // account.get() is the one call that MUST succeed for someone to be
      // considered logged in. If this throws, they're genuinely not
      // authenticated — currentUser correctly becomes null.
      const account = await authService.getCurrentUser()

      // Role and avatar are secondary enrichment, each fetched from our
      // own tables. A problem with either one (missing table, bad env var,
      // etc.) should NOT undo a successful login — so each gets its own
      // .catch and degrades to null instead of failing the whole thing.
      // Live (admin-approved) images live on `profiles`; pending
      // submissions awaiting approval live on `profile_settings`.
      // Both rows are fetched in parallel (one round trip instead of two).
      const [profile, settings] = await Promise.all([
        getProfileByUserId(account.$id).catch((err) => {
          console.error('Could not load profiles row:', err)
          return null
        }),
        getSettingsByUserId(account.$id).catch((err) => {
          console.error('Could not load profile_settings row:', err)
          return null
        }),
      ])

      // Deactivated by an admin → end the session. Only an explicit
      // `false` counts; rows from before the `active` column are null.
      if (profile?.active === false) {
        await authService.logoutUser().catch(() => {})
        throw new Error('Account deactivated')
      }

      const role = profile?.role || null
      const avatarImageId = profile?.avatarImageId || null
      const headerImageId = profile?.headerImageId || null
      const pendingAvatarImageId = settings?.pendingAvatarImageId || null
      const pendingHeaderImageId = settings?.pendingHeaderImageId || null

      if (!isLatest()) return
      currentUser.value = {
        ...account,
        role,
        avatarImageId,
        headerImageId,
        pendingAvatarImageId,
        pendingHeaderImageId,
      }
    } catch {
      if (isLatest()) currentUser.value = null
    } finally {
      if (isLatest()) authChecked.value = true
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