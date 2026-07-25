type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method: HttpMethod
  path: string
  body?: unknown
  signal?: AbortSignal
}

export type ApiResponse<T> = {
  isSuccess: boolean
  message: string
  data: T
  errors: unknown
}

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.DEV ? '/api' : '/api')

function joinUrl(base: string, path: string) {
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`




}

export function unwrapApiResponse<T>(value: unknown): T {
  if (value && typeof value === 'object') {
    const v = value as any
    if ('isSuccess' in v || 'IsSuccess' in v) {
      const isSuccess = v.isSuccess ?? v.IsSuccess
      if (!isSuccess) {
        const msg = v.message || v.Message || 'Operation failed'
        const errors = v.errors || v.Errors
        const errorMsg = Array.isArray(errors) && errors.length > 0 
          ? `${msg}\n${errors.join('\n')}` 
          : msg
        throw new Error(errorMsg)
      }
    }
    if ('data' in v) {
      return v.data
    }
    if ('Data' in v) {
      return v.Data
    }
  }
  return value as T
}

export async function apiRequest<T>({ method, path, body, signal }: RequestOptions): Promise<T> {
  const url = joinUrl(API_BASE_URL, path)
  const token = localStorage.getItem('access_token')

  console.log(`[API] ${method} ${url}`, body ?? '')

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    signal,
  })

  console.log(`[API] response ${res.status} from ${url}`)

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? ''
    const errorPayload = contentType.includes('application/json')
      ? await res.json().catch(() => undefined)
      : await res.text().catch(() => undefined)

    let errorMessage = ''
    if (errorPayload && typeof errorPayload === 'object') {
      const ep = errorPayload as any
      if (typeof ep.title === 'string') {
        errorMessage = ep.title
      } else if (typeof ep.error === 'string') {
        errorMessage = ep.error
      } else if (typeof ep.message === 'string') {
        errorMessage = ep.message
      } else if (typeof ep.Message === 'string') {
        errorMessage = ep.Message
      }
      
      const rawErrors = ep.errors || ep.Errors
      if (Array.isArray(rawErrors) && rawErrors.length > 0) {
        errorMessage = errorMessage ? `${errorMessage}\n${rawErrors.join('\n')}` : rawErrors.join('\n')
      } else if (rawErrors && typeof rawErrors === 'object') {
        const fieldErrors = Object.entries(rawErrors).flatMap(([field, msgs]) => {
          if (Array.isArray(msgs)) return msgs.map((m) => `${field}: ${m}`)
          if (typeof msgs === 'string') return [`${field}: ${msgs}`]
          return []
        })
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('\n')
        }
      }
    }

    const message =
      typeof errorPayload === 'string' && errorPayload.length > 0
        ? errorPayload
        : errorMessage
          ? errorMessage
          : `Request failed (${res.status})`
    throw new Error(message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
