import { apiRequest, unwrapApiResponse } from './apiClient'
import type { AdditionalService, CreateAdditionalServiceRequest, UpdateAdditionalServiceRequest } from '../../models/AdditionalService'

const basePath = 'additional-services'

export async function getAdditionalServices(signal?: AbortSignal): Promise<AdditionalService[]> {
  const response = await apiRequest<unknown>({ method: 'GET', path: basePath, signal })
  return unwrapApiResponse<AdditionalService[]>(response)
}

export async function getAdditionalServiceById(id: string, signal?: AbortSignal): Promise<AdditionalService> {
  const response = await apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal })
  return unwrapApiResponse<AdditionalService>(response)
}

export async function createAdditionalService(payload: CreateAdditionalServiceRequest, signal?: AbortSignal): Promise<AdditionalService> {
  const response = await apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal })
  return unwrapApiResponse<AdditionalService>(response)
}

export async function updateAdditionalService(id: string, payload: UpdateAdditionalServiceRequest, signal?: AbortSignal): Promise<void> {
  const response = await apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal })
  return unwrapApiResponse<void>(response)
}

export async function deleteAdditionalService(id: string, signal?: AbortSignal): Promise<void> {
  const response = await apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
  return unwrapApiResponse<void>(response)
}
