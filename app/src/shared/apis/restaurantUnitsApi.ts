import { apiRequest, unwrapApiResponse } from './apiClient'
import { RestaurantUnit, CreateRestaurantUnitRequest, UpdateRestaurantUnitRequest } from '../../models/RestaurantUnit'

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export const restaurantUnitsApi = {
  getAll: (
    params?: {
      search?: string
      isActive?: boolean
      pageNumber?: number
      pageSize?: number
    },
    signal?: AbortSignal
  ) => {
    const query = new URLSearchParams()
    if (params?.search) query.append('Search', params.search)
    if (params?.isActive !== undefined) query.append('IsActive', params.isActive.toString())
    if (params?.pageNumber !== undefined) query.append('PageNumber', params.pageNumber.toString())
    if (params?.pageSize !== undefined) query.append('PageSize', params.pageSize.toString())

    const queryString = query.toString() ? `?${query.toString()}` : ''

    return apiRequest<unknown>({
      method: 'GET',
      path: `restaurant/Units${queryString}`,
      signal,
    }).then((r) => unwrapApiResponse<PaginatedResult<RestaurantUnit>>(r))
  },

  getById: (id: number, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'GET',
      path: `restaurant/Units/${id}`,
      signal,
    }).then((r) => unwrapApiResponse<RestaurantUnit>(r))
  },

  create: (data: CreateRestaurantUnitRequest, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'POST',
      path: `restaurant/Units`,
      body: data,
      signal,
    }).then((r) => unwrapApiResponse<RestaurantUnit>(r))
  },

  update: (id: number, data: UpdateRestaurantUnitRequest, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'PUT',
      path: `restaurant/Units/${id}`,
      body: data,
      signal,
    }).then((r) => unwrapApiResponse<RestaurantUnit>(r))
  },

  activate: (id: number, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'PATCH',
      path: `restaurant/Units/${id}/activate`,
      signal,
    }).then((r) => unwrapApiResponse<boolean>(r))
  },

  deactivate: (id: number, signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'PATCH',
      path: `restaurant/Units/${id}/deactivate`,
      signal,
    }).then((r) => unwrapApiResponse<boolean>(r))
  },
}
