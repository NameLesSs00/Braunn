import { apiRequest, unwrapApiResponse } from './apiClient'
import type { ARIRate, ARIAvailability } from '../../models/ARI'

const basePath = '/rt/ari'

export function getARIRates(startDate: string, endDate: string, signal?: AbortSignal) {
  const qp = `startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  return apiRequest<unknown>({ 
    method: 'GET', 
    path: `${basePath}/rate?${qp}`, 
    signal 
  }).then((r) => unwrapApiResponse<ARIRate[]>(r))
}

export interface GetARIAvailabilityParams {
  RoomTypeCode: string
  Start: string
  End: string
}

export function getARIAvailability(params: GetARIAvailabilityParams, signal?: AbortSignal) {
  const qp = new URLSearchParams(params as any).toString()
  return apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/availability?${qp}`,
    signal
  }).then((r) => unwrapApiResponse<ARIAvailability[]>(r))
}
