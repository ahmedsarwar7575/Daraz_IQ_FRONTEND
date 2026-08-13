const API_URL = import.meta.env.VITE_API_URL || 'https://api.daraziq.store/api'
const TOKEN_KEY = 'daraz_console_session'
const USER_KEY = 'daraz_console_user'
export const SESSION_EXPIRED_EVENT = 'sellerdesk:session-expired'
export const apiBaseUrl = API_URL

export const getSessionToken = () => localStorage.getItem(TOKEN_KEY)
export const getSessionUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}
export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

const request = async (path, { method = 'GET', body, authenticated = false } = {}) => {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (authenticated && getSessionToken()) {
    headers.Authorization = `Bearer ${getSessionToken()}`
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('The server is unavailable. Please try again shortly.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error?.message || 'The request could not be completed.')
    error.code = data.error?.code
    error.status = response.status
    if (authenticated && response.status === 401 && ['SESSION_EXPIRED', 'UNAUTHORIZED'].includes(error.code)) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw error
  }
  return data
}

export const authApi = {
  register: (values) => request('/auth/register', { method: 'POST', body: values }),
  verifyEmail: (values) => request('/auth/verify-email', { method: 'POST', body: values }),
  login: (values) => request('/auth/login', { method: 'POST', body: values }),
  requestOtp: (email) => request('/auth/request-otp', { method: 'POST', body: { email } }),
  verifyOtp: (values) => request('/auth/verify-otp', { method: 'POST', body: values }),
  google: (credential) => request('/auth/google', { method: 'POST', body: { credential } }),
  me: () => request('/auth/me', { authenticated: true }),
}

export const darazApi = {
  connect: () => request('/daraz/connect', { authenticated: true }),
  status: () => request('/daraz/status', { authenticated: true }),
  disconnect: () => request('/daraz/connection', { method: 'DELETE', authenticated: true }),
}

export const copilotApi = {
  manifest: () => request('/copilot/manifest', { authenticated: true }),
  products: () => request('/copilot/products', { authenticated: true }),
  analyzeStore: (values) => request('/copilot/store/analyze', { method: 'POST', body: values, authenticated: true }),
  searchCompetitors: (values) => request('/copilot/competitors/search', { method: 'POST', body: values, authenticated: true }),
  analyzeProduct: (values) => request('/copilot/products/analyze', { method: 'POST', body: values, authenticated: true }),
  getGuardrails: () => request('/copilot/pricing/guardrails', { authenticated: true }),
  updateGuardrails: (values) => request('/copilot/pricing/guardrails', { method: 'PUT', body: values, authenticated: true }),
  analyzePrice: (values) => request('/copilot/pricing/analyze', { method: 'POST', body: values, authenticated: true }),
  applyReprice: (values) => request('/copilot/pricing/reprice', { method: 'POST', body: values, authenticated: true }),
  repriceHistory: (sku) => request(`/copilot/pricing/history/${encodeURIComponent(sku)}`, { authenticated: true }),
  aiBrief: (values) => request('/copilot/ai/brief', { method: 'POST', body: values, authenticated: true }),
}

export const settingsApi = {
  ai: () => request('/settings/ai', { authenticated: true }),
  updateAi: (values) => request('/settings/ai', { method: 'PUT', body: values, authenticated: true }),
}
