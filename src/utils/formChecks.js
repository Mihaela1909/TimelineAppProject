// Small pure helpers for form validation, shared by the admin composables.

// requiredFields: { fieldName: 'human label' }. Returns the labels of
// fields that are empty in `data`, e.g. ['cover image', 'header image'].
export function missingFields(data, requiredFields) {
  return Object.entries(requiredFields)
    .filter(([field]) => !data?.[field])
    .map(([, label]) => label)
}

// ['a', 'b', 'c'] → 'a, b and c'
export function joinWithAnd(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

// Friendly message for missing required fields, or null if none are missing.
export function missingFieldsMessage(data, requiredFields) {
  const missing = missingFields(data, requiredFields)
  return missing.length ? `Please add a ${joinWithAnd(missing)} before saving.` : null
}
