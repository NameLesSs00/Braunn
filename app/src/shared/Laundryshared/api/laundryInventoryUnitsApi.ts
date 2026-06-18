import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LaundryInventoryUnitReadDto,
  LaundryInventoryUnitCreateDto,
  LaundryInventoryUnitUpdateDto,
} from '../../../models/Laundrymodels/LaundryInventoryUnit'

const basePath = 'laundry/inventory/units'

export function getLaundryInventoryUnits(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryUnitReadDto[]>(r)
  )
}

export function createLaundryInventoryUnit(payload: LaundryInventoryUnitCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryUnitReadDto>(r)
  )
}

export function getLaundryInventoryUnitById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryUnitReadDto>(r)
  )
}

export function updateLaundryInventoryUnit(id: number, payload: LaundryInventoryUnitUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryInventoryUnitReadDto>(r)
  )
}

export function deleteLaundryInventoryUnit(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
