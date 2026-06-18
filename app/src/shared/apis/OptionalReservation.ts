import { apiRequest, unwrapApiResponse } from './apiClient'
import type { OptionalReservation, CreateOptionalReservationRequest } from '../../models/OptionalReservation'

const basePath = 'pms/optional-reservations'

export function getOptionalReservations(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: basePath,
    signal,
  }).then((r) => unwrapApiResponse<OptionalReservation[]>(r))
}

export function createOptionalReservation(data: CreateOptionalReservationRequest) {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: data,
  }).then((r) => unwrapApiResponse<OptionalReservation>(r))
}

export function confirmOptionalReservation(id: string) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/${id}/confirm`,
  }).then((r) => unwrapApiResponse<boolean>(r))
}
