import { apiRequest, unwrapApiResponse } from './apiClient'
import type { MaintenancePurchase, CreateMaintenancePurchaseRequest, UpdateMaintenancePurchaseRequest, PurchaseStatus } from '../../models/MaintenancePurchase'

const basePath = 'maintenance-purchases'

export type PaginatedMaintenancePurchases = {
  items: MaintenancePurchase[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface GetMaintenancePurchasesParams {
  pageNumber?: number
  pageSize?: number
  status?: PurchaseStatus
  fromDate?: string
  toDate?: string
}

export function getMaintenancePurchases(params?: GetMaintenancePurchasesParams, signal?: AbortSignal) {
  const query = new URLSearchParams()
  if (params?.pageNumber !== undefined) query.append('pageNumber', params.pageNumber.toString())
  if (params?.pageSize !== undefined) query.append('pageSize', params.pageSize.toString())
  if (params?.status) query.append('status', params.status)
  if (params?.fromDate) query.append('fromDate', params.fromDate)
  if (params?.toDate) query.append('toDate', params.toDate)
  
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${queryString}`, signal })
    .then((r) => unwrapApiResponse<PaginatedMaintenancePurchases>(r))
}

export function getMaintenancePurchaseById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<MaintenancePurchase>(r))
}

export function createMaintenancePurchase(payload: CreateMaintenancePurchaseRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<MaintenancePurchase>(r))
}

export function updateMaintenancePurchase(id: number, payload: UpdateMaintenancePurchaseRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) => unwrapApiResponse<MaintenancePurchase>(r))
}

export function deleteMaintenancePurchase(id: number, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
}

export function updateMaintenancePurchaseStatus(id: number, statusAction: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'PUT', path: `${basePath}/${id}/status?action=${encodeURIComponent(statusAction)}`, signal })
}
