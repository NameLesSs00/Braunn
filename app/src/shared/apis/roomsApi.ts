import { apiRequest, unwrapApiResponse, PaginatedResponse } from './apiClient'
import type { Room, RoomAvailability } from '../../models/Room'

const basePath = '/Rooms'

export function getRooms(params?: { pageNumber?: number; pageSize?: number }, signal?: AbortSignal) {
  const p = params || { pageNumber: 1, pageSize: 1000 }
  const qp = new URLSearchParams({ pageNumber: String(p.pageNumber || 1), pageSize: String(p.pageSize || 1000) }).toString()
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}?${qp}`, signal }).then((r) => unwrapApiResponse<PaginatedResponse<Room>>(r))
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
