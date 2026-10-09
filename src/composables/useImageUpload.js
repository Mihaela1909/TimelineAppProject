import { ref } from 'vue'
import { uploadImage } from '../services/mediaService'
import { compressImage } from '../utils/compressImage'

// APPLICATION LOGIC shared by ImageUpload (admin content) and AvatarUpload
// (personal photos): checks the file, shrinks it, uploads it, tracks uploading/error.
// The size limit applies AFTER compression, so big phone photos are fine.
const MAX_SIZE_MB = 5

export function useImageUpload() {
  const uploading = ref(false)
  const error = ref(null)

  // Returns the new file ID, or null if the file was rejected / upload failed.
  async function upload(file) {
    if (uploading.value) return null
    error.value = null
    if (!file || !file.type.startsWith('image/')) {
      error.value = 'Please choose an image file.'
      return null
    }

    uploading.value = true
    try {
      const compressed = await compressImage(file)
      if (compressed.size > MAX_SIZE_MB * 1024 * 1024) {
        error.value = `Image is too large — maximum ${MAX_SIZE_MB} MB.`
        return null
      }
      return await uploadImage(compressed)
    } catch (err) {
      console.error(err)
      error.value = 'Upload failed. Please try again.'
      return null
    } finally {
      uploading.value = false
    }
  }

  return { uploading, error, upload }
}
