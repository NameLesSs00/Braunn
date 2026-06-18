import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LostFoundCategoryReadDto,
  LostFoundCategoryCreateDto,
  LostFoundCategoryUpdateDto,
  LostFoundCategoryQueryParams,
  PaginatedLostFoundCategories,
} from '../../../models/HKmodels/HkmLostFoundCategory'

const basePath = 'lost-found-categories'

export function getLostFoundCategories(params?: LostFoundCategoryQueryParams, signal?: AbortSignal) {
  let query = ''
  if (params) {
    const searchParams = new URLSearchParams()
    if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString())
    if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString())
    if (params.Search) searchParams.append('Search', params.Search)
    if (params.SortBy) searchParams.append('SortBy', params.SortBy)
    if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection)
    const qStr = searchParams.toString()
    if (qStr) query = `?${qStr}`
  }
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${query}`, signal }).then((r) =>
    unwrapApiResponse<PaginatedLostFoundCategories>(r)
  )
}

export function createLostFoundCategory(payload: LostFoundCategoryCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LostFoundCategoryReadDto>(r)
  )
}

export function getLostFoundCategoryById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LostFoundCategoryReadDto>(r)
  )
}

export function updateLostFoundCategory(id: number, payload: LostFoundCategoryUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LostFoundCategoryReadDto>(r)
  )
}

export function deleteLostFoundCategory(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
