import { apiRequest, unwrapApiResponse, PaginatedResponse } from './apiClient'
import type { CreateGuestRequest, Guest, UpdateGuestRequest } from '../../models/Guest'

const basePath = 'pms/guests'

export function getGuests(params?: { pageNumber?: number; pageSize?: number; search?: string; status?: string; guestType?: string; roomType?: string; checkInFrom?: string; checkInTo?: string }, signal?: AbortSignal) {
  const p = params || { pageNumber: 1, pageSize: 50 }
  const urlParams = new URLSearchParams()
  urlParams.append('pageNumber', String(p.pageNumber || 1))
  urlParams.append('pageSize', String(p.pageSize || 50))
  if (p.search) urlParams.append('search', p.search)
  if (p.status && p.status !== 'all') urlParams.append('status', p.status)
  if (p.guestType && p.guestType !== 'all') urlParams.append('guestType', p.guestType)
  if (p.roomType && p.roomType !== 'all') urlParams.append('roomType', p.roomType)
  if (p.checkInFrom) urlParams.append('checkInFrom', p.checkInFrom)
  if (p.checkInTo) urlParams.append('checkInTo', p.checkInTo)

  return apiRequest<unknown>({ method: 'GET', path: `${basePath}?${urlParams.toString()}`, signal }).then((r) => unwrapApiResponse<PaginatedResponse<Guest>>(r))
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
