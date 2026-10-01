import { ID } from 'appwrite'
import { storage, BUCKETS } from './appwrite'

// DATA ACCESS LAYER for file uploads — ONE bucket (BUCKETS.MEDIA) with
// File Security DISABLED. Every file follows the bucket's own rule
// (Read → any, Create → users), so there are no per-file permissions to
// get wrong. Privacy/moderation for personal photos is handled at the
// application level instead: an uploaded avatar/header only goes "live"
// once an admin approves it (see profileSettingsService).

export async function uploadImage(file) {
  const uploaded = await storage.createFile(BUCKETS.MEDIA, ID.unique(), file)
  return uploaded.$id
}

export function getImagePreviewUrl(fileId) {
  if (!fileId) return null
  // getFilePreview() requires Appwrite's paid Image Transformations
  // feature — getFileView() serves the raw file and works on every plan.
  return String(storage.getFileView(BUCKETS.MEDIA, fileId))
}

export async function deleteImage(fileId) {
  if (!fileId) return
  return storage.deleteFile(BUCKETS.MEDIA, fileId)
}
