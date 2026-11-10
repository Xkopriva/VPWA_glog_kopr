// api base url pointing to adonis backend
const API_BASE_URL = 'http://localhost:3333/api/v1'

// storage key for access token in browser
const TOKEN_KEY = 'flack_auth_token'

// retrieves stored access token from local storage
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// saves or clears access token in local storage
export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// sends http request to backend api with auth token if available
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const customHeaders = options.headers as Record<string, string> | undefined
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (customHeaders) {
    Object.assign(headers, customHeaders)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // parses json response or throws formatted error
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const errorMsg = data?.message || data?.errors?.[0]?.message || 'request failed'
    throw new Error(errorMsg)
  }

  // unwraps api serializer data wrapper if present
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data as T
  }

  return data as T
}

// sends get request
export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

// sends post request with payload
export function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  const options: RequestInit = { method: 'POST' }
  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }
  return apiRequest<T>(endpoint, options)
}

// sends patch request with payload
export function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
  const options: RequestInit = { method: 'PATCH' }
  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }
  return apiRequest<T>(endpoint, options)
}

// sends delete request
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}
