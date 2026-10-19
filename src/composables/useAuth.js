import { ref, computed } from 'vue'
import * as authService from '../services/authService'
import { getProfileByUserId } from '../services/profileService'
import { getSettingsByUserId } from '../services/profileSettingsService'
import { ROLES, STAFF_ROLES } from '../constants/roles'

// This state is intentionally declared OUTSIDE the function, at module
// scope. That makes it a singleton — every component that calls useAuth()
// shares the exact same `currentUser` ref, instead of each getting its
// own separate copy. This is what lets the header, the router guard, and
// the profile page all agree on who's logged in without a Pinia store.
const currentUser = ref(null)
const authChecked = ref(false)
let pendingCheck = null // the 'who is logged in?' request while it's running
// true for admins and editors — used to let staff preview drafts and open the admin panel
const isStaff = computed(() => STAFF_ROLES.includes(currentUser.value?.role))

// Friendly login messages per Appwrite error type — so a correct password
// that's refused for another reason doesn't show "Incorrect password".
const LOGIN_ERRORS = {
  user_invalid_credentials: 'Incorrect email or password.',
  user_blocked: 'This account has been blocked. Please contact an admin.',
  general_rate_limit_exceeded: 'Too many login attempts. Please wait a few minutes and try again.',
  user_session_already_exists: 'You are already logged in. Please refresh the page.',
}

// Turns an Appwrite login error into the message shown to the user.
function loginErrorMessage(err) {
  if (LOGIN_ERRORS[err.type]) return LOGIN_ERRORS[err.type]
  if (err.code === 429) return LOGIN_ERRORS.general_rate_limit_exceeded
  if (err.code === 401) return LOGIN_ERRORS.user_invalid_credentials
  return 'Could not log in. Please try again.'
}

// The role the app uses = the Appwrite label on the account. That is the same thing
// the database permissions check, so the app and the database always agree.
// (profiles.role is only a record shown on the admin Users page.)
function roleFromLabels(labels = []) {
  if (labels.includes(ROLES.ADMIN)) return ROLES.ADMIN
  if (labels.includes(ROLES.EDITOR)) return ROLES.EDITOR
  return ROLES.USER
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

  // Create an account (after checking the inputs), log in, and load the user.
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

  // Log in, then load the user. Shows a friendly message if it fails.
  async function login({ email, password }) {
    error.value = null
    email = email?.trim()
    if (!email || !password) fail('Please enter your email and password.')

    loading.value = true
    try {
      await authService.loginUser({ email, password }).catch((err) => {
        console.error(err)
        error.value = loginErrorMessage(err)
        throw err
      })
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

  // Change the display name. Returns true/false.
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

  // Change the email (Appwrite asks for the password). Returns true/false.
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

  // Change the password (needs the current one). Returns true/false.
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

  // End the session and forget the user.
  async function logout() {
    await authService.logoutUser()
    currentUser.value = null
  }

  // If a check is already running (e.g. started in the background by the router),
  // wait for that one instead of sending a second request.
  function refreshCurrentUser() {
    if (!pendingCheck) pendingCheck = loadCurrentUser().finally(() => (pendingCheck = null))
    return pendingCheck
  }

  // Asks Appwrite who is logged in, then adds their role and photos from our tables.
  async function loadCurrentUser() {
    try {
      // account.get() is the one call that MUST succeed for someone to be
      // considered logged in. If this throws, they're genuinely not
      // authenticated — currentUser correctly becomes null.
      const account = await authService.getCurrentUser()

      // Photos come from our own tables (live photos on `profiles`, pending ones
      // on `profile_settings`), loaded in parallel. The role comes from the
      // account's Appwrite labels (roleFromLabels above). A problem with
      // either should NOT undo a successful login, so each falls back to null.
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

      currentUser.value = {
        ...account,
        role: roleFromLabels(account.labels),
        avatarImageId: profile?.avatarImageId || null,
        headerImageId: profile?.headerImageId || null,
        pendingAvatarImageId: settings?.pendingAvatarImageId || null,
        pendingHeaderImageId: settings?.pendingHeaderImageId || null,
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
    isStaff,
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