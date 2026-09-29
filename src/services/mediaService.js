import { ID } from 'appwrite'
import { storage, BUCKETS } from './appwrite'

// DATA ACCESS LAYER for file uploads. Anything that needs an image
// (course covers, lesson images, blog post covers) goes through here.

export async function uploadImage(file) {
  const uploaded = await storage.createFile(BUCKETS.MEDIA, ID.unique(), file)
  return uploaded.$id
}

export function getImagePreviewUrl(fileId) {
  if (!fileId) return null
  // getFilePreview returns a URL object/string depending on SDK version —
  // String() keeps this safe either way for use directly in an <img src>.
return String(storage.getFileView(BUCKETS.MEDIA, fileId))}

export async function deleteImage(fileId) {
  if (!fileId) return
  return storage.deleteFile(BUCKETS.MEDIA, fileId)
}