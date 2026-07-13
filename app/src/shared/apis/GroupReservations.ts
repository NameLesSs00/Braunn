import type {
  CreateGroupReservationRequest,
  CreateGroupReservationResponse,
  GroupReservationListItem,
} from '../../models/GroupReservation'
import { apiRequest, unwrapApiResponse } from './apiClient'

export function createGroupReservation(payload: CreateGroupReservationRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: 'group-reservations',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<CreateGroupReservationResponse>(r))
}

export function getGroupReservations(signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: 'group-reservations',
    signal,
  }).then((r) => unwrapApiResponse<GroupReservationListItem[]>(r))
}

export function getGroupReservationById(groupReservationId: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `group-reservations/${groupReservationId}`,
    signal,
  }).then((r) => unwrapApiResponse<GroupReservationListItem>(r))
}
