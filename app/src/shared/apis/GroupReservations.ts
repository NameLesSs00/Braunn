import type { CreateGroupReservationRequest, CreateGroupReservationResponse } from '../../models/GroupReservation'
import { apiRequest, unwrapApiResponse } from './apiClient'

export function createGroupReservation(payload: CreateGroupReservationRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: 'group-reservations',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<CreateGroupReservationResponse>(r))
}
