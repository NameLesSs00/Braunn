import { apiRequest, unwrapApiResponse } from './apiClient'
import type { CreateGuestRequest, Guest, UpdateGuestRequest } from '../../models/Guest'

const basePath = 'pms/guests'

export function getGuests(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) => unwrapApiResponse<Guest[]>(r))
}

export function getGuestById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<Guest>(r))
}

export function getGuestByNationalId(idNumber: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/by-national-id/${encodeURIComponent(idNumber)}`, signal }).then((r) =>
    unwrapApiResponse<Guest>(r),
  )
}

export function searchGuests(query: string, limit: number = 10, signal?: AbortSignal) {
  return apiRequest<unknown>({ 
    method: 'GET', 
    path: `${basePath}/search?query=${encodeURIComponent(query)}&limit=${limit}`, 
    signal 
  }).then((r) => unwrapApiResponse<Guest[]>(r))
}

export function getGuestByPhoneNumber(phnNumber: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/by-phone-number-id/${encodeURIComponent(phnNumber)}`, signal }).then((r) =>
    unwrapApiResponse<Guest[]>(r),
  )
}

export function createGuest(payload: CreateGuestRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<Guest>(r))
}

export function updateGuest(id: string, payload: UpdateGuestRequest, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal })
}

export function deleteGuest(id: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
}
