// Shrinks an image in the browser before upload: at most MAX_EDGE px on the long
// side, re-encoded as WebP. Appwrite's free plan serves files as-is (no resizing),
// so a 4000px phone photo would otherwise be downloaded in full on every card.
// Plain browser helper: no Vue, no Appwrite.

const MAX_EDGE = 1600
const QUALITY = 0.82
const SKIP_TYPES = ['image/gif', 'image/svg+xml'] // animations / vectors: keep as-is

export async function compressImage(file) {
  if (SKIP_TYPES.includes(file.type)) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY))
    // Keep the original if the browser can't encode WebP or it didn't get smaller.
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp' })
  } catch (err) {
    console.error('Image compression failed, uploading the original:', err)
    return file
  }
}
