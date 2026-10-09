// XSS protection for rich text shown with v-html (lesson + blog content).
// The editor only produces safe HTML, but the content comes from the database and
// staff can write rows straight through the API — so never trust it as-is.
// Allow-list approach: parse into an INERT document (DOMParser never runs scripts or
// loads anything), then copy over only the tags/attributes the editor can produce.
// Plain browser helper: no Vue, no Appwrite.

// What TipTap's StarterKit + Link extension output.
const ALLOWED_TAGS = new Set([
  'P', 'BR', 'HR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'CODE', 'PRE', 'BLOCKQUOTE',
  'UL', 'OL', 'LI', 'A',
])
const ALLOWED_ATTRS = { A: ['href'], OL: ['start'] }
// Removed WITH their content (everything else unknown is unwrapped: text kept, tag dropped).
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEMPLATE', 'NOSCRIPT', 'TEXTAREA', 'SELECT'])

// Only real web/mail links: blocks javascript:, data:, vbscript: etc.
function isSafeUrl(href) {
  const value = href.trim()
  if (value.startsWith('/') || value.startsWith('#')) return true
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function cleanChildren(source, target, doc) {
  for (const node of source.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(doc.createTextNode(node.textContent))
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toUpperCase()
      if (DROP_WITH_CONTENT.has(tag)) continue
      if (!ALLOWED_TAGS.has(tag)) {
        cleanChildren(node, target, doc) // unwrap: keep the text, drop the tag
        continue
      }
      const el = doc.createElement(tag)
      for (const name of ALLOWED_ATTRS[tag] || []) {
        const value = node.getAttribute(name)
        if (value === null) continue
        if (name === 'href' && !isSafeUrl(value)) continue
        el.setAttribute(name, value)
      }
      if (tag === 'A' && el.hasAttribute('href') && !el.getAttribute('href').startsWith('/') && !el.getAttribute('href').startsWith('#')) {
        el.setAttribute('target', '_blank')
        el.setAttribute('rel', 'noopener noreferrer')
      }
      cleanChildren(node, el, doc)
      target.appendChild(el)
    }
    // comments and anything else are dropped
  }
}

export function sanitizeHtml(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(String(html), 'text/html')
  const out = doc.createElement('div')
  cleanChildren(doc.body, out, doc)
  return out.innerHTML
}
