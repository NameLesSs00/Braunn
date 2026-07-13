import type {
  CreateGroupReservationRequest,
  CreateGroupReservationResponse,
  GroupReservationListItem,
} from '../../models/GroupReservation'
import { apiRequest, unwrapApiResponse } from './apiClient'

export type GetGroupReservationsParams = {
  pageNumber?: number
  pageSize?: number
  status?: string
  fromDate?: string
  toDate?: string
  groupName?: string
  companyId?: string
  contractId?: string
}

export type GroupReservationsListResult = {
  items: GroupReservationListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

function addQueryParam(query: URLSearchParams, key: string, value?: string | number | null) {
  if (value === undefined || value === null || String(value).trim() === '') return
  query.set(key, String(value))
}

function normalizeGroupReservationsResponse(
  response: unknown,
  params: GetGroupReservationsParams,
): GroupReservationsListResult {
  const data = unwrapApiResponse<unknown>(response)
  const fallbackPageSize = Math.max(1, params.pageSize ?? 15)
  const fallbackPageNumber = Math.max(1, params.pageNumber ?? 1)

  if (Array.isArray(data)) {
    return {
      items: data as GroupReservationListItem[],
      totalCount: data.length,
      pageNumber: fallbackPageNumber,
      pageSize: fallbackPageSize,
      totalPages: Math.max(1, Math.ceil(data.length / fallbackPageSize)),
    }
  }

  const record = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const itemsValue =
    record.items ??
    record.Items ??
    record.data ??
    record.Data ??
    record.results ??
    record.Results ??
    record.groupReservations ??
    record.GroupReservations
  const items = Array.isArray(itemsValue) ? (itemsValue as GroupReservationListItem[]) : []
  const totalCount = Number(
    record.totalCount ?? record.TotalCount ?? record.totalItems ?? record.TotalItems ?? record.count ?? record.Count ?? items.length,
  )
  const pageSize = Number(record.pageSize ?? record.PageSize ?? fallbackPageSize) || fallbackPageSize
  const pageNumber = Number(record.pageNumber ?? record.PageNumber ?? fallbackPageNumber) || fallbackPageNumber
  const totalPages =
    Number(record.totalPages ?? record.TotalPages) || Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)))

  return {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
  }
}

export function createGroupReservation(payload: CreateGroupReservationRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: 'group-reservations',
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<CreateGroupReservationResponse>(r))
}

export function getGroupReservations(params: GetGroupReservationsParams = {}, signal?: AbortSignal) {
  const query = new URLSearchParams()
  addQueryParam(query, 'PageNumber', params.pageNumber)
  addQueryParam(query, 'PageSize', params.pageSize)
  addQueryParam(query, 'Status', params.status)
  addQueryParam(query, 'FromDate', params.fromDate)
  addQueryParam(query, 'ToDate', params.toDate)
  addQueryParam(query, 'GroupName', params.groupName)
  addQueryParam(query, 'CompanyId', params.companyId)
  addQueryParam(query, 'ContractId', params.contractId)
  const queryString = query.toString()

  return apiRequest<unknown>({
    method: 'GET',
    path: `group-reservations${queryString ? `?${queryString}` : ''}`,
    signal,
  }).then((r) => normalizeGroupReservationsResponse(r, params))
}

export function getGroupReservationById(groupReservationId: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `group-reservations/${groupReservationId}`,
    signal,
  }).then((r) => unwrapApiResponse<GroupReservationListItem>(r))
}
