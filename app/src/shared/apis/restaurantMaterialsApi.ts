import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type {
  CreateMaterialConversionRequest,
  CreateRestaurantMaterialRequest,
  RestaurantMaterial,
  RestaurantMaterialConversion,
  UpdateMaterialConversionRequest,
  UpdateRestaurantMaterialRequest,
} from '../../models/RestaurantMaterial'

const basePath = 'restaurant/Materials'

export type RestaurantMaterialsQuery = {
  search?: string
  unitId?: number
  isActive?: boolean
  pageNumber?: number
  pageSize?: number
}

function toQuery(params?: RestaurantMaterialsQuery) {
  const query = new URLSearchParams()
  if (params?.search) query.append('Search', params.search)
  if (params?.unitId !== undefined) query.append('UnitId', String(params.unitId))
  if (params?.isActive !== undefined) query.append('IsActive', String(params.isActive))
  if (params?.pageNumber !== undefined) query.append('PageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('PageSize', String(params.pageSize))
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const restaurantMaterialsApi = {
  getAll: (params?: RestaurantMaterialsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}${toQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<RestaurantMaterial>>(r),
    ),

  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterial>(r),
    ),

  create: (data: CreateRestaurantMaterialRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: basePath, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterial>(r),
    ),

  update: (id: number, data: UpdateRestaurantMaterialRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterial>(r),
    ),

  activate: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PATCH', path: `${basePath}/${id}/activate`, signal }).then((r) =>
      unwrapApiResponse<boolean>(r),
    ),

  deactivate: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PATCH', path: `${basePath}/${id}/deactivate`, signal }).then((r) =>
      unwrapApiResponse<boolean>(r),
    ),

  createConversion: (materialId: number, data: CreateMaterialConversionRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: `${basePath}/${materialId}/conversions`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterialConversion>(r),
    ),

  getConversions: (materialId: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${materialId}/conversions`, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterialConversion[]>(r),
    ),

  createGlobalConversion: (data: CreateMaterialConversionRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: `${basePath}/conversions`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterialConversion>(r),
    ),

  getConversionById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/conversions/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterialConversion>(r),
    ),

  updateConversion: (id: number, data: UpdateMaterialConversionRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/conversions/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantMaterialConversion>(r),
    ),

  deleteConversion: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/conversions/${id}`, signal }).then((r) =>
      unwrapApiResponse<void>(r),
    ),
}
