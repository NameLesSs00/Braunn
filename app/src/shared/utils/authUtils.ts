/**
 * Utility functions for token validation and auth state management
 */

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false
  const trimmed = token.trim()
  if (!trimmed) return false

  try {
    const parts = trimmed.split('.')
    if (parts.length === 3) {
      const base64Url = parts[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const decoded = JSON.parse(jsonPayload)
      if (decoded && typeof decoded.exp === 'number') {
        // exp is unix timestamp in seconds
        const isExpired = decoded.exp * 1000 <= Date.now()
        if (isExpired) {
          return false
        }
      }
    }
    return true
  } catch {
    // If not a standard decodable JWT, assume valid if non-empty string
    return true
  }
}

export function clearAuth(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('token')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('user')
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token')
  if (!token || !isTokenValid(token)) {
    if (token || localStorage.getItem('isAuthenticated') || localStorage.getItem('user')) {
      clearAuth()
    }
    return null
  }
  return token
}
