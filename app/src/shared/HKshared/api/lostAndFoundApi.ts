import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LostAndFoundReadDto,
  LostAndFoundCreateDto,
  LostAndFoundUpdateDto,
  LostAndFoundQueryParams,
  PaginatedLostAndFound,
} from '../../../models/HKmodels/LostAndFound'

const basePath = 'lost-found'

export function getLostAndFound(params?: LostAndFoundQueryParams, signal?: AbortSignal) {
  let query = ''
  if (params) {
    const searchParams = new URLSearchParams()
    if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString())
    if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString())
    if (params.Type) searchParams.append('Type', params.Type)
    if (params.CategoryId !== undefined) searchParams.append('CategoryId', params.CategoryId.toString())
    if (params.GuestId) searchParams.append('GuestId', params.GuestId)
    if (params.EmployeeId) searchParams.append('EmployeeId', params.EmployeeId)
    if (params.IsClaimed !== undefined) searchParams.append('IsClaimed', params.IsClaimed.toString())
    if (params.ItemName) searchParams.append('ItemName', params.ItemName)
    if (params.RoomNo) searchParams.append('RoomNo', params.RoomNo)
    if (params.Location) searchParams.append('Location', params.Location)
    if (params.CreatedDateFrom) searchParams.append('CreatedDateFrom', params.CreatedDateFrom)
    if (params.CreatedDateTo) searchParams.append('CreatedDateTo', params.CreatedDateTo)
    if (params.Search) searchParams.append('Search', params.Search)
    if (params.SortBy) searchParams.append('SortBy', params.SortBy)
    if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection)
    const qStr = searchParams.toString()
    if (qStr) query = `?${qStr}`
  }
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${query}`, signal }).then((r) =>
    unwrapApiResponse<PaginatedLostAndFound>(r)
  )
}

export function createLostAndFound(payload: LostAndFoundCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LostAndFoundReadDto>(r)
  )
}

export function getLostAndFoundById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LostAndFoundReadDto>(r)
  )
}

export function updateLostAndFound(id: number, payload: LostAndFoundUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LostAndFoundReadDto>(r)
  )
}

export function deleteLostAndFound(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}

export function claimLostItem(id: number, employeeId: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/lost/${id}/claim`,
    body: { employeeId },
    signal,
  }).then((r) => unwrapApiResponse<LostAndFoundReadDto>(r))
}

export function claimFoundItem(id: number, guestId: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/found/${id}/claim`,
    body: { guestId },
    signal,
  }).then((r) => unwrapApiResponse<LostAndFoundReadDto>(r))
}
