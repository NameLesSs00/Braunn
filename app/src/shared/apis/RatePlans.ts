import { apiRequest, unwrapApiResponse } from './apiClient'
import type { RatePlan, GetRatePlansParams, CreateRatePlanPayload, UpdateRatePlanPayload } from '../../models/RatePlan'

const basePath = '/local/ari/rate-plans'

export function getRatePlans(params?: GetRatePlansParams, signal?: AbortSignal) {
  const cleanedParams: Record<string, string> = {}
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleanedParams[key] = String(value)
      }
    })
  }
  
  const qp = new URLSearchParams(cleanedParams).toString()
  const path = qp ? `${basePath}?${qp}` : basePath

  return apiRequest<unknown>({
    method: 'GET',
    path,
    signal
  }).then((r) => unwrapApiResponse<RatePlan[]>(r))
}

export function createRatePlan(payload: CreateRatePlanPayload, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: payload,
    signal
  }).then(r => unwrapApiResponse<RatePlan>(r))
}

export function getRatePlanById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal
  }).then(r => unwrapApiResponse<RatePlan>(r))
}

export function updateRatePlan(id: string, payload: UpdateRatePlanPayload, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: payload,
    signal
  }).then(r => unwrapApiResponse<RatePlan>(r))
}

export function getRatePlanByCode(code: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/by-code/${code}`,
    signal
  }).then(r => unwrapApiResponse<RatePlan>(r))
}

export function activateRatePlan(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}/activate`,
    signal
  }).then(r => unwrapApiResponse<void>(r))
}

export function deactivateRatePlan(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}/deactivate`,
    signal
  }).then(r => unwrapApiResponse<void>(r))
}
