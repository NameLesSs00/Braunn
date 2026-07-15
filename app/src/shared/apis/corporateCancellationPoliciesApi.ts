import { apiRequest, unwrapApiResponse } from './apiClient'
import type { 
  CorporateCancellationPolicy, 
  CreateCorporateCancellationPolicyDto, 
  UpdateCorporateCancellationPolicyDto 
} from '../../models/CorporateCancellationPolicy'

const basePath = '/admin/corporate-cancellation-policies'

export interface GetCorporateCancellationPoliciesParams {
  Search?: string
  ContractType?: 'Allotment' | 'Commitment'
  IsActive?: boolean
  EffectiveOn?: string
}

export function getCorporateCancellationPolicies(params?: GetCorporateCancellationPoliciesParams, signal?: AbortSignal) {
  const query = new URLSearchParams()
  if (params?.Search) query.append('Search', params.Search)
  if (params?.ContractType) query.append('ContractType', params.ContractType)
  if (params?.IsActive !== undefined) query.append('IsActive', params.IsActive.toString())
  if (params?.EffectiveOn) query.append('EffectiveOn', params.EffectiveOn)

  const queryString = query.toString()
  const path = queryString ? `${basePath}?${queryString}` : basePath

  return apiRequest<unknown>({ method: 'GET', path, signal }).then(r => unwrapApiResponse<CorporateCancellationPolicy[]>(r))
}

export function getCorporateCancellationPolicyById(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then(r => unwrapApiResponse<CorporateCancellationPolicy>(r))
}

export function createCorporateCancellationPolicy(data: CreateCorporateCancellationPolicyDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: data, signal }).then(r => unwrapApiResponse<CorporateCancellationPolicy>(r))
}

export function updateCorporateCancellationPolicy(id: number, data: UpdateCorporateCancellationPolicyDto, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: data, signal }).then(r => unwrapApiResponse<CorporateCancellationPolicy>(r))
}

export function activateCorporateCancellationPolicy(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: `${basePath}/${id}/activate`, signal }).then(r => unwrapApiResponse<CorporateCancellationPolicy>(r))
}

export function deactivateCorporateCancellationPolicy(id: number, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: `${basePath}/${id}/deactivate`, signal }).then(r => unwrapApiResponse<CorporateCancellationPolicy>(r))
}
