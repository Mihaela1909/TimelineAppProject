// Single source of truth for role names. Import this everywhere instead of
// typing 'admin' / 'editor' / 'user' as raw strings — avoids typos and
// makes it trivial to see everywhere roles are checked.
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
})

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.EDITOR]
