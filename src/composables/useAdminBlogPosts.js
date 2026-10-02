import { ref } from 'vue'
import * as blogPostService from '../services/blogPostService'

export function useAdminBlogPosts() {
  const posts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const saving = ref(false)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      posts.value = await blogPostService.getAllBlogPosts()
    } catch (err) {
      error.value = 'Could not load blog posts.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    try {
      return await blogPostService.getBlogPostById(id)
    } catch (err) {
      console.error(err)
      return null
    }
  }

  async function save(id, data) {
    if (saving.value) return null // already saving — ignore double-clicks
    saving.value = true
    error.value = null
    try {
      return id
        ? await blogPostService.updateBlogPost(id, data)
        : await blogPostService.createBlogPost(data)
    } catch (err) {
      error.value = 'Could not save this post.'
      console.error(err)
      return null
    } finally {
      saving.value = false
    }
  }

  // Returns true/false; the caller shows the toast. Deliberately doesn't set
  // `error`, which is the page's load error and would replace the whole list.
  async function remove(id) {
    try {
      await blogPostService.deleteBlogPost(id)
      posts.value = posts.value.filter((p) => p.$id !== id)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return { posts, loading, error, saving, fetchAll, fetchOne, save, remove }
}