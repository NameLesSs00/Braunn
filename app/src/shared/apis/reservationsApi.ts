import { apiRequest, unwrapApiResponse } from './apiClient'
import type { CreateReservationRequest, Reservation } from '../../models/Reservation'

const basePath = 'pms/Reservations'

export function getReservations(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) => unwrapApiResponse<Reservation[]>(r))
}

export function getReservationById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<Reservation>(r))
}

export function createReservation(payload: CreateReservationRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<Reservation>(r))
}

export function checkInReservation(id: string, roomId: string, signal?: AbortSignal) {
  const qp = `roomId=${encodeURIComponent(roomId)}`
  return apiRequest<void>({ method: 'POST', path: `${basePath}/${id}/checkin?${qp}`, signal })
}

export function checkOutReservation(id: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'POST', path: `${basePath}/${id}/checkout`, signal })
}

export function cancelReservation(id: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'POST', path: `${basePath}/${id}/cancel`, signal })
}

export function extendReservation(id: string, payload: Record<string, unknown>, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'POST', path: `${basePath}/${id}/extend`, body: payload, signal })
}

export function earlyCheckoutReservation(id: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'POST', path: `${basePath}/${id}/early-checkout`, signal })
}
