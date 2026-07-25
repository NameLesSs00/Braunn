import { apiRequest, unwrapApiResponse } from './apiClient'

export interface MaintenanceUnit {
  id: string
  name: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CreateUnitRequest {
  name: string
}

export interface UpdateUnitRequest {
  name: string
}

export const maintenanceUnitsApi = {
  getAll: (
    params?: {
      search?: string
      pageNumber?: number
      pageSize?: number
      sortBy?: string
      isDescending?: boolean
    },
    signal?: AbortSignal
  ) => {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search)
    if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString())
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) query.append('sortBy', params.sortBy)
    if (params?.isDescending !== undefined) query.append('isDescending', params.isDescending.toString())

    const queryString = query.toString() ? `?${query.toString()}` : ''

    return apiRequest<unknown>({
      method: 'GET',
      path: `maintenance/Units${queryString}`,
      signal,
    }).then((r) => unwrapApiResponse<PaginatedResult<MaintenanceUnit>>(r))
  },
  
  getById: (id: string, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'GET',
      path: `maintenance/Units/${id}`,
      signal,
    }).then((r) => unwrapApiResponse<MaintenanceUnit>(r))
  },

  create: (data: CreateUnitRequest, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'POST',
      path: `maintenance/Units`,
      body: data,
      signal,
    }).then((r) => unwrapApiResponse<MaintenanceUnit>(r))
  },

  update: (id: string, data: UpdateUnitRequest, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'PUT',
      path: `maintenance/Units/${id}`,
      body: data,
      signal,
    }).then((r) => unwrapApiResponse<MaintenanceUnit>(r))
  },

  delete: (id: string, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'DELETE',
      path: `maintenance/Units/${id}`,
      signal,
    }).then((r) => unwrapApiResponse<void>(r))
  },
}
