import { apiRequest, unwrapApiResponse } from './apiClient'
import type { ChangeHousekeepingStatusRequest, GetHousekeepingRoomsParams, HousekeepingRoom } from '../../models/Housekeeping'

const basePath = 'pms/Housekeeping'

function toQuery(params?: GetHousekeepingRoomsParams) {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.status !== undefined && params.status !== '') q.set('status', String(params.status))
  if (params.floor !== undefined && String(params.floor) !== '') q.set('floor', String(params.floor))
  if (params.roomTypeId) q.set('roomTypeId', params.roomTypeId)
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getHousekeepingRooms(params?: GetHousekeepingRoomsParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/rooms${toQuery(params)}`, signal }).then((r) => unwrapApiResponse<HousekeepingRoom[]>(r))
}

export function changeHousekeepingStatus(payload: ChangeHousekeepingStatusRequest, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'POST', path: `${basePath}/change-status`, body: payload, signal })
}
