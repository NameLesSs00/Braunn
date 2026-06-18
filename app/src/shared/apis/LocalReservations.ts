import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  LocalReservation,
  CreateLocalReservationRequest,
  UpdateLocalReservationRequest,
  UnifiedReservationsQueryParams,
  UnifiedReservationsResponse,
} from '../../models/LocalReservation'

const basePath = '/local/reservations'


export function createLocalReservation(payload: CreateLocalReservationRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<LocalReservation>(r))
}

export function getLocalReservationById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<LocalReservation>(r))
}

export function updateLocalReservation(id: string, payload: UpdateLocalReservationRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) => unwrapApiResponse<LocalReservation>(r))
}

export function deleteLocalReservation(
  id: string,
  params?: { cancellationReason?: string; cancellationFee?: number },
  signal?: AbortSignal
) {
  const query = new URLSearchParams()
  if (params?.cancellationReason) query.set('cancellationReason', params.cancellationReason)
  if (params?.cancellationFee !== undefined) query.set('cancellationFee', String(params.cancellationFee))
  const queryString = query.toString()
  const path = queryString ? `${basePath}/${id}?${queryString}` : `${basePath}/${id}`
  return apiRequest<void>({ method: 'DELETE', path, signal })
}

export function getUnifiedLocalReservations(params?: UnifiedReservationsQueryParams, signal?: AbortSignal) {
  const query = new URLSearchParams()
  if (params) {
    if (params.fromDate) query.set('FromDate', params.fromDate)
    if (params.toDate) query.set('ToDate', params.toDate)
    if (params.searchTerm) query.set('SearchTerm', params.searchTerm)
    if (params.status) query.set('Status', params.status)
    if (params.sourceType) query.set('SourceType', params.sourceType)
    if (params.pageNumber !== undefined) query.set('PageNumber', String(params.pageNumber))
    if (params.pageSize !== undefined) query.set('PageSize', String(params.pageSize))
    if (params.sortBy) query.set('SortBy', params.sortBy)
    if (params.sortDirection) query.set('SortDirection', params.sortDirection)
  }
  const queryString = query.toString()
  const path = queryString ? `${basePath}/unified?${queryString}` : `${basePath}/unified`
  return apiRequest<unknown>({ method: 'GET', path, signal }).then((r) =>
    unwrapApiResponse<UnifiedReservationsResponse>(r)
  )
}

