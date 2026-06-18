import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  LaundryIssueReadDto,
  LaundryIssueCreateDto,
  LaundryIssueUpdateDto,
  LaundryIssuesParams,
  LaundryIssuesListDto,
} from '../../../models/Laundrymodels/LaundryIssue'

const basePath = 'laundry/issues'

function buildQuery(params?: LaundryIssuesParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.PageNumber !== undefined) q.set('PageNumber', String(params.PageNumber))
  if (params.PageSize !== undefined) q.set('PageSize', String(params.PageSize))
  if (params.ItemId !== undefined) q.set('ItemId', String(params.ItemId))
  if (params.Date) q.set('Date', params.Date)
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getLaundryIssues(params?: LaundryIssuesParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${buildQuery(params)}`, signal }).then((r) =>
    unwrapApiResponse<LaundryIssuesListDto>(r)
  )
}

export function getLaundryIssueById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<LaundryIssueReadDto>(r)
  )
}

export function createLaundryIssue(payload: LaundryIssueCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryIssueReadDto>(r)
  )
}

export function updateLaundryIssue(id: number, payload: LaundryIssueUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<LaundryIssueReadDto>(r)
  )
}

export function deleteLaundryIssue(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<void>(r)
  )
}
