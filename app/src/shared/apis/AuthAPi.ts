import { apiRequest, unwrapApiResponse } from './apiClient'

export interface AuthRequest {
  'API-Key': string
  partner_id: string
}

export interface AuthResponse {
  token?: string
  [key: string]: any
}

export interface AdminLoginRequest {
  email: string
  password: string
}

export function authenticate(payload: AuthRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: '/authenticate',
    body: payload,
    signal
  }).then((r) => unwrapApiResponse<AuthResponse>(r))
}

export function adminLogin(payload: AdminLoginRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: '/auth/admin-login',
    body: payload,
    signal
  }).then((r) => unwrapApiResponse<AuthResponse>(r))
}

export function rtAuth(payload: AuthRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: '/rt/auth',
    body: payload,
    signal
  }).then((r) => unwrapApiResponse<AuthResponse>(r))
}
