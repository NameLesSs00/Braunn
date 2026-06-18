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

export function earlyCheckOut(params: EarlyCheckOutParams, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'POST',
    path: `${basePath}/early-check-out`,
    body: params,
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}
