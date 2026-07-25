import { apiRequest, unwrapApiResponse } from './apiClient'
import type { MaintenanceItem, CreateMaintenanceItemRequest, UpdateMaintenanceItemRequest } from '../../models/MaintenanceItem'

const basePath = 'maintenance/Items'

export type PaginatedMaintenanceItems = {
  items: MaintenanceItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export function getMaintenanceItems(
  params?: {
    search?: string
    type?: string
    status?: string
    pageNumber?: number
    pageSize?: number
    sortBy?: string
    isDescending?: boolean
  },
  signal?: AbortSignal
) {
  const query = new URLSearchParams()
  if (params?.search) query.append('search', params.search)
  if (params?.type) query.append('type', params.type)
  if (params?.status) query.append('status', params.status)
  if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString())
  if (params?.pageSize) query.append('pageSize', params.pageSize.toString())
  if (params?.sortBy) query.append('sortBy', params.sortBy)
  if (params?.isDescending !== undefined) query.append('isDescending', params.isDescending.toString())

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${queryString}`, signal }).then((r) => unwrapApiResponse<PaginatedMaintenanceItems>(r))
}

export function getMaintenanceItemById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<MaintenanceItem>(r))
}

export function createMaintenanceItem(payload: CreateMaintenanceItemRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<MaintenanceItem>(r))
}

export function updateMaintenanceItem(id: number, payload: UpdateMaintenanceItemRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) => unwrapApiResponse<MaintenanceItem>(r))
}

export function deleteMaintenanceItem(id: number, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
}
