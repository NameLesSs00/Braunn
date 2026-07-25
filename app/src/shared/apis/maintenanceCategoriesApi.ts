import { apiRequest, unwrapApiResponse } from './apiClient'
import type { MaintenanceCategory, PaginatedResult, CreateCategoryRequest, UpdateCategoryRequest } from '../../models/MaintenanceCategory'

export const maintenanceCategoriesApi = {
  getAll: (
    params?: {
      search?: string
      type?: string
      pageNumber?: number
      pageSize?: number
      sortBy?: string
      isDescending?: boolean
    },
    signal?: AbortSignal
  ) => {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search)
    if (params?.type) query.append('type', params.type)
    if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString())
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) query.append('sortBy', params.sortBy)
    if (params?.isDescending !== undefined) query.append('isDescending', params.isDescending.toString())

    const queryString = query.toString() ? `?${query.toString()}` : ''

    return apiRequest<unknown>({
      method: 'GET',
      path: `maintenance/Categories${queryString}`,
      signal,
    }).then((r) => unwrapApiResponse<PaginatedResult<MaintenanceCategory>>(r))
  },
  
  getById: (id: string, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'GET',
      path: `maintenance/Categories/${id}`,
      signal,
    }).then((r) => unwrapApiResponse<MaintenanceCategory>(r))
  },

  create: (data: CreateCategoryRequest, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'POST',
      path: `maintenance/Categories`,
      body: data,
      signal,
    }).then((r) => unwrapApiResponse<MaintenanceCategory>(r))
  },

  update: (id: string, data: UpdateCategoryRequest, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'PUT',
      path: `maintenance/Categories/${id}`,
      body: data,
      signal,
    }).then((r) => unwrapApiResponse<MaintenanceCategory>(r))
  },

  delete: (id: string, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'DELETE',
      path: `maintenance/Categories/${id}`,
      signal,
    }).then((r) => unwrapApiResponse<void>(r))
  },
}