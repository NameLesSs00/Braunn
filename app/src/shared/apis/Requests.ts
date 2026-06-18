import { apiRequest, unwrapApiResponse } from './apiClient'
import type { RequestListResponse, RequestQueryParams, CreateRequestRequest, RequestItem, UpdateRequestRequest } from '../../models/Request'

const basePath = 'request'

function toQuery(params?: RequestQueryParams) {
  if (!params) return ''
  const q = new URLSearchParams()
  if (params.pageNumber !== undefined) q.set('PageNumber', String(params.pageNumber))
  if (params.pageSize !== undefined) q.set('PageSize', String(params.pageSize))
  if (params.status) q.set('Status', String(params.status))
  if (params.roomNo) q.set('RoomNo', String(params.roomNo))
  if (params.date) q.set('Date', String(params.date))
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function getRequests(params?: RequestQueryParams, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}${toQuery(params)}`,
    signal,
  }).then((r) => unwrapApiResponse<RequestListResponse>(r))
}

export function getRequestById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  }).then((r) => unwrapApiResponse<RequestItem>(r))
}

export function createRequest(payload: CreateRequestRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function updateRequest(id: string, payload: UpdateRequestRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: payload,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function deleteRequest(id: string, signal?: AbortSignal) {
  return apiRequest<void>({
    method: 'DELETE',
    path: `${basePath}/${id}`,
    signal,
  })
}

export function setRequestPending(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}/pending`,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function setRequestProgress(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}/progress`,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function setRequestSuccess(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}/success`,
    signal,
  }).then((r) => unwrapApiResponse<unknown>(r))
}







