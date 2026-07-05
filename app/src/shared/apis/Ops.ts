import { apiRequest, unwrapApiResponse } from './apiClient'

const basePath = 'pms/ops'

export interface AssignRoomParams {
  reservationId: string
  roomNumber: string
}

export interface EarlyCheckOutParams {
  reservationId: string
  applyPenalty: boolean
}

export function assignRoom(params: AssignRoomParams, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'POST',
    path: `${basePath}/assign-room`,
    body: params,
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}

export interface AssignReservationRoomParams {
  reservationRoomId: string
  roomId: string
  notes?: string
}

export function assignReservationRoom(params: AssignReservationRoomParams, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'POST',
    path: `reservations/${params.reservationRoomId}/assign-room`,
    body: { roomId: params.roomId, notes: params.notes ?? '' },
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}

export function earlyCheckOut(params: EarlyCheckOutParams, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'POST',
    path: `${basePath}/early-check-out`,
    body: params,
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}

export interface CheckInRoomParams {
  reservationRoomId: string;
  notes?: string;
}

export function checkInReservationRoom(params: CheckInRoomParams, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'POST',
    path: `reservations/${params.reservationRoomId}/check-in`,
    body: { notes: params.notes || '' },
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}
