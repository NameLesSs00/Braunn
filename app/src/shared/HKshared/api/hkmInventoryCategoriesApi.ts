import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  HkmInventoryCategoryReadDto,
  HkmInventoryCategoryCreateDto,
  HkmInventoryCategoryUpdateDto,
} from '../../../models/HKmodels/HkmInventoryCategory'

const basePath = 'hkm/inventory/categories'

export function getHkmInventoryCategories(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryCategoryReadDto[]>(r)
  )
}

export function createHkmInventoryCategory(payload: HkmInventoryCategoryCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryCategoryReadDto>(r)
  )
}

export function getHkmInventoryCategoryById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryCategoryReadDto>(r)
  )
}

export function updateHkmInventoryCategory(id: number, payload: HkmInventoryCategoryUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryCategoryReadDto>(r)
  )
}

export function deleteHkmInventoryCategory(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
