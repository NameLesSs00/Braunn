import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LaundryInventoryCategoryReadDto,
  LaundryInventoryCategoryCreateDto,
  LaundryInventoryCategoryUpdateDto,
} from '../../../models/Laundrymodels/LaundryInventoryCategory'

const basePath = 'laundry/inventory/categories'

export function getLaundryInventoryCategories(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryCategoryReadDto[]>(r)
  )
}

export function createLaundryInventoryCategory(payload: LaundryInventoryCategoryCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryCategoryReadDto>(r)
  )
}

export function getLaundryInventoryCategoryById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryCategoryReadDto>(r)
  )
}

export function updateLaundryInventoryCategory(id: number, payload: LaundryInventoryCategoryUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryCategoryReadDto>(r)
  )
}

export function deleteLaundryInventoryCategory(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
