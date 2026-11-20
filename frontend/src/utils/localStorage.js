export function readStoredArray(key, fallback = []) {
  try {
    const stored = localStorage.getItem(key)
    if (stored === null) return fallback
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : fallback
  } catch (error) {
    console.error(`Unable to read ResearchLens local storage key "${key}".`, error)
    return fallback
  }
}

export function writeStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
