import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type {
  RestaurantWarehouse,
  UpdateRestaurantWarehouseRequest,
  WarehouseDetails,
  WarehouseTransaction,
} from '../../models/RestaurantAdmin'

const basePath = 'restaurant/Warehouses'

export type WarehouseTransactionsQuery = {
  pageNumber?: number
  pageSize?: number
  restaurantId?: number
  warehouseId?: number
  materialId?: number
  transactionType?: string
  dateFrom?: string
  dateTo?: string
  referenceType?: string
  referenceId?: number
}

function toTransactionsQuery(params?: WarehouseTransactionsQuery) {
  const query = new URLSearchParams()
  if (params?.pageNumber !== undefined) query.append('PageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('PageSize', String(params.pageSize))
  if (params?.restaurantId !== undefined) query.append('RestaurantId', String(params.restaurantId))
  if (params?.warehouseId !== undefined) query.append('WarehouseId', String(params.warehouseId))
  if (params?.materialId !== undefined) query.append('MaterialId', String(params.materialId))
  if (params?.transactionType) query.append('TransactionType', params.transactionType)
  if (params?.dateFrom) query.append('DateFrom', params.dateFrom)
  if (params?.dateTo) query.append('DateTo', params.dateTo)
  if (params?.referenceType) query.append('ReferenceType', params.referenceType)
  if (params?.referenceId !== undefined) query.append('ReferenceId', String(params.referenceId))
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const restaurantWarehousesApi = {
  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantWarehouse>(r),
    ),

  update: (id: number, data: UpdateRestaurantWarehouseRequest, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then((r) =>
      unwrapApiResponse<RestaurantWarehouse>(r),
    ),

  getDetails: (signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/details`, signal }).then((r) =>
      unwrapApiResponse<WarehouseDetails[]>(r),
    ),

  getDetailsById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/details/${id}`, signal }).then((r) =>
      unwrapApiResponse<WarehouseDetails>(r),
    ),

  getByRestaurant: (restaurantId: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/by-restaurant/${restaurantId}`, signal }).then((r) =>
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

  getTransactions: (id: number, params?: WarehouseTransactionsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}/transactions${toTransactionsQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<WarehouseTransaction>>(r),
    ),
}
