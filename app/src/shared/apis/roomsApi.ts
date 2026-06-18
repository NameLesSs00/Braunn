import { apiRequest, unwrapApiResponse } from './apiClient'
import type { Room, RoomAvailability } from '../../models/Room'

const basePath = 'pms/Rooms'

export function getRooms(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) => unwrapApiResponse<Room[]>(r))
}

export interface GetRoomsAvailabilityParams {
  StartDate: string
  EndDate: string
  RoomTypeId: string
}

export function getRoomsAvailability(params: GetRoomsAvailabilityParams, signal?: AbortSignal) {
  const qp = new URLSearchParams(params as any).toString()
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/availability?${qp}`,
    signal,
  }).then((r) => unwrapApiResponse<RoomAvailability[]>(r))
}
