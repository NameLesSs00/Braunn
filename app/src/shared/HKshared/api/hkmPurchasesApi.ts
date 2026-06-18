import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  HkmPurchaseReadDto,
  HkmPurchaseCreateDto,
  HkmPurchaseUpdateDto,
  HkmPurchasesListDto,
  HkmPurchasesParams,
} from '../../../models/HKmodels/HkmPurchase'

const basePath = 'hkm/purchases'

function buildQuery(params?: HkmPurchasesParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.PageNumber !== undefined) q.set('PageNumber', String(params.PageNumber))
  if (params.PageSize !== undefined) q.set('PageSize', String(params.PageSize))
  if (params.SupplierName) q.set('SupplierName', params.SupplierName)
  
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getHkmPurchases(params?: HkmPurchasesParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${buildQuery(params)}`, signal }).then((r) =>
    unwrapApiResponse<HkmPurchasesListDto>(r)
  )
}

export function createHkmPurchase(payload: HkmPurchaseCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmPurchaseReadDto>(r)
  )
}

export function getHkmPurchaseById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<HkmPurchaseReadDto>(r)
  )
}

export function updateHkmPurchase(id: number, payload: HkmPurchaseUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmPurchaseReadDto>(r)
  )
}

export function deleteHkmPurchase(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<string>(r)
  )
}

export function markPurchaseAsReceived(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}/mark-as-received`, signal }).then((r) =>
    unwrapApiResponse<HkmPurchaseReadDto>(r)
  )
}
