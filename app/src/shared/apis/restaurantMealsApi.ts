import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type {
  CreateRestaurantMealRequest,
  RestaurantMeal,
  RestaurantMealType,
  UpdateRestaurantMealRequest,
} from '../../models/RestaurantMeal'

const basePath = 'restaurant/meals'

export type RestaurantMealsQuery = {
  search?: string
  isActive?: boolean
  mealType?: RestaurantMealType
  pageNumber?: number
  pageSize?: number
}

function toQuery(params?: RestaurantMealsQuery) {
  const query = new URLSearchParams()
  if (params?.pageNumber !== undefined) query.append('pageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('pageSize', String(params.pageSize))
  if (params?.isActive !== undefined) query.append('isActive', String(params.isActive))
  if (params?.search) query.append('search', params.search)
  if (params?.mealType) query.append('mealType', params.mealType)
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const restaurantMealsApi = {
  getAll: (params?: RestaurantMealsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}${toQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<RestaurantMeal>>(r),
    ),

  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantMeal>(r),
    ),

  create: (data: CreateRestaurantMealRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: basePath, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantMeal>(r),
    ),

  update: (id: number, data: UpdateRestaurantMealRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantMeal>(r),
    ),

  delete: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<void>(r),
    ),
}
