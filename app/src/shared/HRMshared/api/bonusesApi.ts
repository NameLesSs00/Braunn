import { apiRequest, unwrapApiResponse } from '../../apis/apiClient'
import type {
  BonusDeductionReadDto,
  BonusDeductionCreateDto,
  BonusDeductionUpdateDto,
  BonusDeductionQueryParams,
  PaginatedBonusDeduction,
} from '../../../models/HRMmodels/BonusesAndDeductions'

const basePath = 'hr/HRManagement/bonuses'

export function getBonuses(params?: BonusDeductionQueryParams, signal?: AbortSignal) {
  let query = ''
  if (params) {
    const searchParams = new URLSearchParams()
    if (params.EmployeeId) searchParams.append('EmployeeId', params.EmployeeId)
    if (params.DateFrom) searchParams.append('DateFrom', params.DateFrom)
    if (params.DateTo) searchParams.append('DateTo', params.DateTo)
    if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString())
    if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString())
    if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm)
    if (params.SortBy) searchParams.append('SortBy', params.SortBy)
    if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection)
    const qStr = searchParams.toString()
    if (qStr) query = `?${qStr}`
  }
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${query}`, signal }).then((r) =>
    unwrapApiResponse<PaginatedBonusDeduction>(r)
  )
}

export function createBonus(payload: BonusDeductionCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<BonusDeductionReadDto>(r)
  )
}

export function updateBonus(id: string, payload: BonusDeductionUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<BonusDeductionReadDto>(r)
  )
}

export function deleteBonus(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
