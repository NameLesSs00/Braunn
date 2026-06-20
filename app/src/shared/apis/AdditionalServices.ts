import { apiRequest, unwrapApiResponse } from './apiClient'
import type { AdditionalService, CreateAdditionalServiceRequest } from '../../models/AdditionalService'

export async function getAdditionalServices(signal?: AbortSignal): Promise<AdditionalService[]> {
  const response = await apiRequest<unknown>({ method: 'GET', path: '/admin/financial-settings/services', signal })
  return unwrapApiResponse<AdditionalService[]>(response)
}

export async function createAdditionalService(payload: CreateAdditionalServiceRequest, signal?: AbortSignal): Promise<string> {
  const response = await apiRequest<unknown>({ method: 'POST', path: '/admin/financial-settings/services', body: payload, signal })
  return unwrapApiResponse<string>(response)
}
