import { apiRequest, unwrapApiResponse } from './apiClient'
import type { LocalARIRate, GetLocalARIRatesParams, CreateLocalARIRatePayload, CreateLocalARIAvailabilityPayload, GetLocalARIAvailabilityParams, LocalARIAvailability, UpdateLocalARISingleDayRatePayload } from '../../models/LocalAri'

const basePath = '/local/ari'

export function getLocalARIRates(params: GetLocalARIRatesParams, signal?: AbortSignal) {
  const cleanedParams: Record<string, string> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanedParams[key] = String(value)
    }
  })
  
  const qp = new URLSearchParams(cleanedParams).toString()
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/rates?${qp}`,
    signal
  }).then((r) => unwrapApiResponse<LocalARIRate[]>(r))
}

export function saveLocalARIRates(payload: CreateLocalARIRatePayload, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/rates`,
    body: payload,
    signal
  }).then((r) => unwrapApiResponse<unknown>(r))
}
export function saveLocalARIAvailability(payload: CreateLocalARIAvailabilityPayload, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/availability`,
    body: payload,
    signal
  }).then((r) => unwrapApiResponse<unknown>(r))
}

export function getLocalARIAvailability(params: GetLocalARIAvailabilityParams, signal?: AbortSignal) {
  const cleanedParams: Record<string, string> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanedParams[key] = String(value)
    }
  })
  
  const qp = new URLSearchParams(cleanedParams).toString()
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/availability?${qp}`,
    signal
  }).then((r) => unwrapApiResponse<LocalARIAvailability[]>(r))
}

export function updateLocalARISingleDayRate(payload: UpdateLocalARISingleDayRatePayload, signal?: AbortSignal) {
  return apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/rates/single-day`,
    body: payload,
    signal
  }).then((r) => unwrapApiResponse<unknown>(r))
}

