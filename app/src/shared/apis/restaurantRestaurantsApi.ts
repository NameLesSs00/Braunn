import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type {
  RestaurantAdmin,
  RestaurantWarehouse,
  UpdateRestaurantRequest,
  UpdateRestaurantWarehouseRequest,
} from '../../models/RestaurantAdmin'

const basePath = 'restaurant/Restaurants'

export type RestaurantsQuery = {
  pageNumber?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

function toQuery(params?: RestaurantsQuery) {
  const query = new URLSearchParams()
  if (params?.pageNumber !== undefined) query.append('PageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('PageSize', String(params.pageSize))
  if (params?.search) query.append('Search', params.search)
  if (params?.isActive !== undefined) query.append('IsActive', String(params.isActive))
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const restaurantRestaurantsApi = {
  getAll: (params?: RestaurantsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}${toQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<RestaurantAdmin>>(r),
    ),

  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantAdmin>(r),
    ),

  update: (id: number, data: UpdateRestaurantRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantAdmin>(r),
    ),

  updateWarehouse: (id: number, data: UpdateRestaurantWarehouseRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}/warehouse`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantWarehouse>(r),
    ),

  activate: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PATCH', path: `${basePath}/${id}/activate`, signal }).then((r) =>
      unwrapApiResponse<void>(r),
    ),

  deactivate: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PATCH', path: `${basePath}/${id}/deactivate`, signal }).then((r) =>
      unwrapApiResponse<void>(r),
    ),
}
