import { apiRequest, unwrapApiResponse } from './apiClient'
import type { RatePlan, GetRatePlansParams } from '../../models/RatePlan'

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
