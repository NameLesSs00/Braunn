import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type {
  CreateMaterialRequestRequest,
  MaterialRequest,
  UpdateMaterialRequestRequest,
} from '../../models/RestaurantMaterialRequest'

const basePath = 'restaurant/material-requests'

export type MaterialRequestsQuery = {
  pageNumber?: number
  pageSize?: number
  restaurantId?: number
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

function toQuery(params?: MaterialRequestsQuery) {
  const query = new URLSearchParams()
  if (params?.pageNumber !== undefined) query.append('PageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('PageSize', String(params.pageSize))
  if (params?.restaurantId !== undefined) query.append('RestaurantId', String(params.restaurantId))
  if (params?.status) query.append('Status', params.status)
  if (params?.dateFrom) query.append('DateFrom', params.dateFrom)
  if (params?.dateTo) query.append('DateTo', params.dateTo)
  if (params?.search) query.append('Search', params.search)
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const restaurantMaterialRequestsApi = {
  create: (data: CreateMaterialRequestRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: basePath, body: data, signal }).then((r) =>
      unwrapApiResponse<MaterialRequest>(r),
    ),

  getAll: (params?: MaterialRequestsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}${toQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<MaterialRequest>>(r),
    ),

  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<MaterialRequest>(r),
    ),

  update: (id: number, data: UpdateMaterialRequestRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<MaterialRequest>(r),
    ),

  cancel: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'POST', path: `${basePath}/${id}/cancel`, signal }).then((r) =>
      unwrapApiResponse<MaterialRequest>(r),
    ),
}
