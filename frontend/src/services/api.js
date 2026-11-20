/**
 * ResearchLens API Client
 * Centralized API configuration and request abstraction.
 * Integrates with Python FastAPI backend (default: http://127.0.0.1:8000).
 */

export const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

export function getApiBaseUrl() {
  try {
    const custom = localStorage.getItem('researchlens_api_url')
    if (custom && custom.trim()) return custom.trim().replace(/\/$/, '')
  } catch (e) {
    // LocalStorage unavailable
  }
  return DEFAULT_API_BASE_URL
}

export function setApiBaseUrl(url) {
  try {
    if (!url) {
      localStorage.removeItem('researchlens_api_url')
    } else {
      localStorage.setItem('researchlens_api_url', url.trim().replace(/\/$/, ''))
    }
  } catch (e) {
    console.error('Failed to set API base URL:', e)
  }
}

export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 3500)

  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (res.ok) {
      const data = await res.json()
      return { online: true, url: baseUrl, details: data }
    }
    return { online: false, url: baseUrl, status: res.status }
  } catch (err) {
    clearTimeout(timeoutId)
    return { online: false, url: baseUrl, error: err.message || 'Connection refused' }
  }
}

export async function requestJson(endpoint, options = {}, timeoutMs = 60000, timeoutMessage = 'Request timed out') {
  const baseUrl = getApiBaseUrl()
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(text || `Server returned invalid JSON response (${response.status})`)
    }

    if (!response.ok) {
      const detail = typeof data?.detail === 'string' ? data.detail : null
      if (response.status === 502 || response.status === 503) {
        throw new Error(`The backend service is temporarily unavailable (HTTP ${response.status}). ${detail || 'Please try again later.'}`)
      }
      throw new Error(detail || (typeof data === 'string' ? data : JSON.stringify(data)))
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error?.name === 'AbortError') throw new Error(timeoutMessage)
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach the ResearchLens backend at ${baseUrl}. Ensure FastAPI is running on port 8000.`)
    }
    throw error
  }
}
