import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LeaveReadDto,
  LeaveCreateDto,
  LeaveUpdateStatusDto,
  LeavesQueryParams,
  PaginatedLeaves,
} from '../../../models/HRMmodels/Leave'

const basePath = 'hr/HRManagement/leaves'

export function getLeaves(params?: LeavesQueryParams, signal?: AbortSignal) {
  let query = ''
  if (params) {
    const searchParams = new URLSearchParams()
    if (params.EmployeeId) searchParams.append('EmployeeId', params.EmployeeId)
    if (params.Status) searchParams.append('Status', params.Status)
    if (params.LeaveType) searchParams.append('LeaveType', params.LeaveType)
    if (params.DateFrom) searchParams.append('DateFrom', params.DateFrom)
    if (params.DateTo) searchParams.append('DateTo', params.DateTo)
    if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString())
    if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString())
    if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm)
    if (params.SortBy) searchParams.append('SortBy', params.SortBy)
    if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection)
    const qStr = searchParams.toString()
    if (qStr) query = `?${qStr}`
  }

  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${query}`, signal }).then((r) =>
    unwrapApiResponse<PaginatedLeaves>(r)
  )
}

export function createLeave(payload: LeaveCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LeaveReadDto>(r)
  )
}

export function updateLeaveStatus(id: string, payload: LeaveUpdateStatusDto, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}/status`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<void>(r))
}

export function deleteLeave(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
