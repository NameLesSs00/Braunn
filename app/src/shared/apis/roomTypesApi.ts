import { apiRequest, unwrapApiResponse } from './apiClient'
import type { CreateRoomTypeRequest, RoomType, UpdateRoomTypeRequest } from '../../models/RoomType'

const basePath = '/RoomTypes'

export function getRoomTypes(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) => unwrapApiResponse<RoomType[]>(r))
}

export function getRoomTypeById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<RoomType>(r))
}

export function createRoomType(payload: CreateRoomTypeRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<RoomType>(r))
}

export function updateRoomType(id: string, payload: UpdateRoomTypeRequest, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal })
}

export function deleteRoomType(id: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
}
