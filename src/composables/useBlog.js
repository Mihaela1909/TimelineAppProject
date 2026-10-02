import { ref, computed } from 'vue'
import * as blogPostService from '../services/blogPostService'

// APPLICATION LOGIC for the public blog (list + single post). Read-only and
// published posts only — the admin side uses useAdminBlogPosts instead.
export function useBlog() {
  const posts = ref([])
  const post = ref(null)
  // Starts true: these pages fetch on mount, and starting false would
  // flash the "nothing here" empty state for a frame first.
  const loading = ref(true)
  const error = ref(null)

  async function fetchPublished() {
    loading.value = true
    error.value = null
    try {
      posts.value = await blogPostService.getPublishedBlogPosts()
    } catch (err) {
      error.value = 'Could not load the blog.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // One post plus the published list, which the "related posts" box needs.
  async function fetchPost(id) {
    loading.value = true
    error.value = null
    post.value = null
    try {
      const [postData, published] = await Promise.all([
        blogPostService.getBlogPostById(id),
        blogPostService.getPublishedBlogPosts(),
      ])
      post.value = postData
      posts.value = published
    } catch (err) {
      error.value = 'Could not load this post.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const relatedPosts = computed(() =>
    posts.value.filter((p) => p.$id !== post.value?.$id && p.category === post.value?.category).slice(0, 2)
  )

  return { posts, post, relatedPosts, loading, error, fetchPublished, fetchPost }
}
