import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LaundryPurchaseReadDto,
  LaundryPurchaseCreateDto,
  LaundryPurchaseUpdateDto,
  LaundryPurchasesParams,
  LaundryPurchasesListDto,
} from '../../../models/Laundrymodels/LaundryPurchase'

const basePath = 'laundry/purchases'

function buildQuery(params?: LaundryPurchasesParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.PageNumber !== undefined) q.set('PageNumber', String(params.PageNumber))
  if (params.PageSize !== undefined) q.set('PageSize', String(params.PageSize))
  if (params.SupplierName) q.set('SupplierName', params.SupplierName)
  if (params.Date) q.set('Date', params.Date)
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getLaundryPurchases(params?: LaundryPurchasesParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${buildQuery(params)}`, signal }).then((r) =>
    unwrapApiResponse<LaundryPurchasesListDto>(r)
  )
}

export function getLaundryPurchaseById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LaundryPurchaseReadDto>(r)
  )
}

export function createLaundryPurchase(payload: LaundryPurchaseCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryPurchaseReadDto>(r)
  )
}

export function updateLaundryPurchase(id: number, payload: LaundryPurchaseUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryPurchaseReadDto>(r)
  )
}

export function deleteLaundryPurchase(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
