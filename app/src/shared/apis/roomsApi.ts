import { apiRequest, unwrapApiResponse, PaginatedResponse } from './apiClient'
import type { Room, RoomAvailability } from '../../models/Room'

const basePath = '/rooms'

export function getRooms(params?: { pageNumber?: number; pageSize?: number }, signal?: AbortSignal) {
  const p = params || { pageNumber: 1, pageSize: 1000 }
  const qp = new URLSearchParams({ pageNumber: String(p.pageNumber || 1), pageSize: String(p.pageSize || 1000) }).toString()
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}?${qp}`, signal }).then((r) => unwrapApiResponse<PaginatedResponse<Room>>(r))
}

export interface GetRoomsAvailabilityParams {
  StartDate?: string
  EndDate?: string
  RoomTypeId?: string
  IncludeDirty?: boolean
  startDate?: string
  endDate?: string
  roomTypeId?: string
  includeDirty?: boolean
}

export function getRoomsAvailability(params: GetRoomsAvailabilityParams, signal?: AbortSignal) {
  const qp = new URLSearchParams()
  const startDate = params.StartDate || params.startDate
  const endDate = params.EndDate || params.endDate
  const roomTypeId = params.RoomTypeId || params.roomTypeId
  const includeDirty = params.IncludeDirty ?? params.includeDirty

  if (startDate) qp.append('StartDate', startDate)
  if (endDate) qp.append('EndDate', endDate)
  if (roomTypeId && roomTypeId.trim() !== '') qp.append('RoomTypeId', roomTypeId.trim())
  if (includeDirty !== undefined) qp.append('IncludeDirty', String(includeDirty))

  const queryString = qp.toString()
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/availability${queryString ? `?${queryString}` : ''}`,
    signal,
  }).then((r) => unwrapApiResponse<RoomAvailability[]>(r))
}
