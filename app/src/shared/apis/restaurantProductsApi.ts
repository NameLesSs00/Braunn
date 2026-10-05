import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type {
  CreateRestaurantProductRequest,
  RestaurantProduct,
  UpdateRestaurantProductRequest,
} from '../../models/RestaurantProduct'

const basePath = 'restaurant/Products'

export type RestaurantProductsQuery = {
  search?: string
  unitId?: number
  isActive?: boolean
  pageNumber?: number
  pageSize?: number
}

function toQuery(params?: RestaurantProductsQuery) {
  const query = new URLSearchParams()
  if (params?.search) query.append('Search', params.search)
  if (params?.unitId !== undefined) query.append('UnitId', String(params.unitId))
  if (params?.isActive !== undefined) query.append('IsActive', String(params.isActive))
  if (params?.pageNumber !== undefined) query.append('PageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('PageSize', String(params.pageSize))
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const restaurantProductsApi = {
  getAll: (params?: RestaurantProductsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}${toQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<RestaurantProduct>>(r),
    ),

  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantProduct>(r),
    ),

  create: (data: CreateRestaurantProductRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: basePath, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantProduct>(r),
    ),

  update: (id: number, data: UpdateRestaurantProductRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantProduct>(r),
    ),

  activate: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PATCH', path: `${basePath}/${id}/activate`, signal }).then((r) =>
      unwrapApiResponse<boolean>(r),
    ),

  deactivate: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PATCH', path: `${basePath}/${id}/deactivate`, signal }).then((r) =>
      unwrapApiResponse<boolean>(r),
    ),
}
