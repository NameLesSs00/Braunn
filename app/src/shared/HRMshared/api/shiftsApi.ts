import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  ShiftReadDto,
  ShiftCreateDto,
  ShiftUpdateDto,
  ShiftsQueryParams,
  PaginatedShifts,
} from '../../../models/HRMmodels/Shift'

const basePath = 'hr/HRShifts'

export function getShifts(params?: ShiftsQueryParams, signal?: AbortSignal) {
  let query = ''
  if (params) {
    const searchParams = new URLSearchParams()
    if (params.Name) searchParams.append('Name', params.Name)
    if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString())
    if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString())
    if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm)
    if (params.SortBy) searchParams.append('SortBy', params.SortBy)
    if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection)
    const qStr = searchParams.toString()
    if (qStr) {
      query = `?${qStr}`
    }
  }

  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${query}`, signal }).then((r) =>
    unwrapApiResponse<PaginatedShifts>(r)
  )
}

export function createShift(payload: ShiftCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<ShiftReadDto>(r)
  )
}

export function getShiftById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<ShiftReadDto>(r)
  )
}

export function updateShift(id: string, payload: ShiftUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<ShiftReadDto>(r)
  )
}

export function deleteShift(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
