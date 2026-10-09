// Per-page <title>, description, link-preview (Open Graph) tags, canonical URL and
// robots. The router sets defaults from route meta; pages with loaded data (a course,
// a blog post…) call setPageMeta again once the data is there.
// Plain DOM helper: no Vue, no Appwrite.

export const SITE_URL = 'https://timeline.appwrite.network'
const SITE_NAME = 'Timeline'
export const DEFAULT_DESCRIPTION =
  'Learn history for free with Timeline: courses with illustrated lessons, quizzes to test yourself, a history blog and a daily "on this day" event.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

// Upserts <meta name|property=key content=…> in <head>.
function setMeta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

// Search results cut descriptions around 155 characters; strip HTML from rich text.
export function toDescription(text, max = 155) {
  const plain = String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > max ? `${plain.slice(0, max - 1).trimEnd()}…` : plain
}

export function setPageMeta({ title, description, image, path, noindex = false } = {}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Free History Courses`
  const desc = description || DEFAULT_DESCRIPTION
  const url = `${SITE_URL}${path ?? window.location.pathname}`

  document.title = fullTitle
  setMeta('name', 'description', desc)
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  setMeta('property', 'og:title', fullTitle)
  setMeta('property', 'og:description', desc)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', image || DEFAULT_IMAGE)
  setCanonical(url)
}
