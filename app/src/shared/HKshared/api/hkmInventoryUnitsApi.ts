import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  HkmInventoryUnitReadDto,
  HkmInventoryUnitCreateDto,
  HkmInventoryUnitUpdateDto,
} from '../../../models/HKmodels/HkmInventoryUnit'

const basePath = 'hkm/inventory/units'

export function getHkmInventoryUnits(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryUnitReadDto[]>(r)
  )
}

export function createHkmInventoryUnit(payload: HkmInventoryUnitCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryUnitReadDto>(r)
  )
}

export function getHkmInventoryUnitById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryUnitReadDto>(r)
  )
}

export function updateHkmInventoryUnit(id: number, payload: HkmInventoryUnitUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmInventoryUnitReadDto>(r)
  )
}

export function deleteHkmInventoryUnit(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
