import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  HkmInventoryItemReadDto,
  HkmInventoryItemCreateDto,
  HkmInventoryItemUpdateDto,
  HkmInventoryItemsListDto,
  HkmInventoryItemsParams,
} from '../../../models/HKmodels/HkmInventoryItem'

const basePath = 'hkm/inventory/items'

function buildQuery(params?: HkmInventoryItemsParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.PageNumber !== undefined) q.set('PageNumber', String(params.PageNumber))
  if (params.PageSize !== undefined) q.set('PageSize', String(params.PageSize))
  if (params.Status) q.set('Status', params.Status)
  if (params.CategoryId) q.set('CategoryId', String(params.CategoryId))
  if (params.UnitId) q.set('UnitId', String(params.UnitId))
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getHkmInventoryItems(params?: HkmInventoryItemsParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${buildQuery(params)}`, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryItemsListDto>(r)
  )
}

export function createHkmInventoryItem(payload: HkmInventoryItemCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryItemReadDto>(r)
  )
}

export function getHkmInventoryItemById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryItemReadDto>(r)
  )
}

export function updateHkmInventoryItem(id: number, payload: HkmInventoryItemUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryItemReadDto>(r)
  )
}

export function deleteHkmInventoryItem(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
