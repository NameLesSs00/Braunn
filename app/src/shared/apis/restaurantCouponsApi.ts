import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type {
  CreateRestaurantCouponRequest,
  RestaurantCoupon,
  UpdateRestaurantCouponRequest,
} from '../../models/RestaurantCoupon'

const basePath = 'restaurant/coupons'

export type RestaurantCouponsQuery = {
  pageNumber?: number
  pageSize?: number
  mealId?: number
  isActive?: boolean
}

function toQuery(params?: RestaurantCouponsQuery) {
  const query = new URLSearchParams()
  if (params?.pageNumber !== undefined) query.append('pageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('pageSize', String(params.pageSize))
  if (params?.mealId !== undefined) query.append('mealId', String(params.mealId))
  if (params?.isActive !== undefined) query.append('isActive', String(params.isActive))
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const restaurantCouponsApi = {
  getAll: (params?: RestaurantCouponsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}${toQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<RestaurantCoupon>>(r),
    ),

  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantCoupon>(r),
    ),

  getByMeal: (mealId: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/by-meal/${mealId}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantCoupon[]>(r),
    ),

  create: (data: CreateRestaurantCouponRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: basePath, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantCoupon>(r),
    ),

  update: (id: number, data: UpdateRestaurantCouponRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantCoupon>(r),
    ),

  delete: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<void>(r),
    ),
}
