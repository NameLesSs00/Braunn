import { apiRequest, unwrapApiResponse, type PaginatedResponse } from './apiClient'
import type { RestaurantInventoryItem, RestaurantInventoryTransaction } from '../../models/RestaurantInventory'

const basePath = 'restaurant/inventory'

export type RestaurantInventoryQuery = {
  pageNumber?: number
  pageSize?: number
  restaurantId?: number
  warehouseId?: number
  materialId?: number
  search?: string
}

export type RestaurantInventoryTransactionsQuery = {
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

function toInventoryQuery(params?: RestaurantInventoryQuery) {
  const query = new URLSearchParams()
  if (params?.pageNumber !== undefined) query.append('PageNumber', String(params.pageNumber))
  if (params?.pageSize !== undefined) query.append('PageSize', String(params.pageSize))
  if (params?.restaurantId !== undefined) query.append('RestaurantId', String(params.restaurantId))
  if (params?.warehouseId !== undefined) query.append('WarehouseId', String(params.warehouseId))
  if (params?.materialId !== undefined) query.append('MaterialId', String(params.materialId))
  if (params?.search) query.append('Search', params.search)
  const value = query.toString()
  return value ? `?${value}` : ''
}

function toTransactionsQuery(params?: RestaurantInventoryTransactionsQuery) {
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

export const restaurantInventoryApi = {
  getAll: (params?: RestaurantInventoryQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}${toInventoryQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<RestaurantInventoryItem>>(r),
    ),

  getById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantInventoryItem>(r),
    ),

  getTransactions: (params?: RestaurantInventoryTransactionsQuery, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/transactions${toTransactionsQuery(params)}`, signal }).then((r) =>
      unwrapApiResponse<PaginatedResponse<RestaurantInventoryTransaction>>(r),
    ),

  getTransactionById: (id: number, signal?: AbortSignal) =>
    apiRequest<unknown>({ method: 'GET', path: `${basePath}/transactions/${id}`, signal }).then((r) =>
      unwrapApiResponse<RestaurantInventoryTransaction>(r),
    ),
}
