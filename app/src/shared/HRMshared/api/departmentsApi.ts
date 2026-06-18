import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  DepartmentReadDto,
  DepartmentCreateDto,
  DepartmentUpdateDto,
  DepartmentsQueryParams,
  PaginatedDepartments,
} from '../../../models/HRMmodels/Department'

const basePath = 'hr/HRDepartments'
export function getDepartments(params?: DepartmentsQueryParams, signal?: AbortSignal) {
  let query = ''
  if (params) {
    const searchParams = new URLSearchParams()
    if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString())
    if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString())
    if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm)
    if (params.SortBy) searchParams.append('SortBy', params.SortBy)
    if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection)
    if (params.IsActive !== undefined) searchParams.append('IsActive', params.IsActive.toString())
    const qStr = searchParams.toString()
    if (qStr) {
      query = `?${qStr}`
    }
  }

  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${query}`, signal }).then((r) =>
    unwrapApiResponse<PaginatedDepartments>(r)
  )
}

export function createDepartment(payload: DepartmentCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<DepartmentReadDto>(r)
  )
}

export function getDepartmentById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<DepartmentReadDto>(r)
  )
}

export function updateDepartment(id: string, payload: DepartmentUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<DepartmentReadDto>(r)
  )
}

export function deleteDepartment(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
