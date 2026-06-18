import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient'
import type {
  HkmIssueReadDto,
  HkmIssueCreateDto,
  HkmIssueUpdateDto,
  HkmIssuesListDto,
  HkmIssuesParams,
} from '../../../models/HKmodels/HkmIssue'

const basePath = 'hkm/issues'

function buildQuery(params?: HkmIssuesParams): string {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.PageNumber !== undefined) q.set('PageNumber', String(params.PageNumber))
  if (params.PageSize !== undefined) q.set('PageSize', String(params.PageSize))
  if (params.ItemId !== undefined && params.ItemId !== '') q.set('ItemId', String(params.ItemId))
  if (params.RoomId !== undefined && params.RoomId !== '') q.set('RoomId', params.RoomId)
  
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getHkmIssues(params?: HkmIssuesParams, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}${buildQuery(params)}`, signal }).then((r) =>
    unwrapApiResponse<HkmIssuesListDto>(r)
  )
}

export function createHkmIssue(payload: HkmIssueCreateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmIssueReadDto>(r)
  )
}

export function getHkmIssueById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<HkmIssueReadDto>(r)
  )
}

export function updateHkmIssue(id: number, payload: HkmIssueUpdateDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal }).then((r) =>
    unwrapApiResponse<HkmIssueReadDto>(r)
  )
}

export function deleteHkmIssue(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<string>(r)
  )
}
