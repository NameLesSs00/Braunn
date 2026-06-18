import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LaundryInventoryItemReadDto,
  LaundryInventoryItemCreateDto,
  LaundryInventoryItemUpdateDto,
  LaundryInventoryItemsListDto,
  LaundryInventoryItemsParams,
} from '../../../models/Laundrymodels/LaundryInventoryItem'

const basePath = 'laundry/inventory/items'

function buildQuery(params?: LaundryInventoryItemsParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.PageNumber !== undefined) q.set('PageNumber', String(params.PageNumber))
  if (params.PageSize !== undefined) q.set('PageSize', String(params.PageSize))
  if (params.Name) q.set('Name', params.Name)
  if (params.Status) q.set('Status', params.Status)
  if (params.MaintenanceStatus) q.set('MaintenanceStatus', params.MaintenanceStatus)
  if (params.CategoryId) q.set('CategoryId', String(params.CategoryId))
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getLaundryInventoryItems(params?: LaundryInventoryItemsParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${buildQuery(params)}`, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryItemsListDto>(r)
  )
}

export function createLaundryInventoryItem(payload: LaundryInventoryItemCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryItemReadDto>(r)
  )
}

export function getLaundryInventoryItemById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryItemReadDto>(r)
  )
}

export function updateLaundryInventoryItem(id: number, payload: LaundryInventoryItemUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryItemReadDto>(r)
  )
}

export function deleteLaundryInventoryItem(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
