import { ID } from 'appwrite'
import { account } from './appwrite'
import { createProfile } from './profileService'

// DATA ACCESS LAYER for authentication. Composables call these;
// components never touch Appwrite's Account API directly.

export async function registerUser({ email, password, name }) {
  const newUser = await account.create(ID.unique(), email, password, name)
  // Appwrite doesn't log the user in automatically after create —
  // start a session right after registering so they don't have to
  // log in twice.
  const session = await account.createEmailPasswordSession(email, password)
  // Every user needs a profile row so the app has somewhere to store
  // their role. New accounts always start as a plain 'user'.
  await createProfile(newUser.$id, name, email)
  return session
}

export async function loginUser({ email, password }) {
  return account.createEmailPasswordSession(email, password)
}

export async function logoutUser() {
  return account.deleteSession('current')
}

export async function getCurrentUser() {
  // Throws if nobody is logged in — callers should catch this and
  // treat it as "no user", not as a real error.
  return account.get()
}

export async function updateDisplayName(name) {
  return account.updateName(name)
}

export async function updateUserEmail(email, password) {
  // Appwrite requires the current password here too, same reasoning as
  // password changes — confirms it's really the account owner.
  return account.updateEmail(email, password)
}

export async function updateUserPassword(newPassword, oldPassword) {
  // Appwrite requires the current password to confirm the change —
  // a security measure so a stolen session alone can't hijack the account.
  return account.updatePassword(newPassword, oldPassword)
}