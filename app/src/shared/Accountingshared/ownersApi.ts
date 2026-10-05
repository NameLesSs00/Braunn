import { apiRequest, unwrapApiResponse } from '../apis/apiClient'
import type { Owner, CreateOwnerRequest, UpdateOwnerRequest } from '../../models/Accounting/owner'

const basePath = 'pms/owners'

export function getOwners(fullName?: string, signal?: AbortSignal) {
  const urlParams = new URLSearchParams()
  if (fullName) urlParams.append('fullName', fullName)
  const q = urlParams.toString()
  const path = q ? `${basePath}?${q}` : basePath

  return apiRequest<unknown>({ method: 'GET', path, signal })
    .then((r) => unwrapApiResponse<Owner[]>(r))
}

export function getOwnerById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal })
    .then((r) => unwrapApiResponse<Owner>(r))
}

export function createOwner(payload: CreateOwnerRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal })
    .then((r) => unwrapApiResponse<Owner>(r))
}

export function updateOwner(id: string, payload: UpdateOwnerRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal })
    .then((r) => unwrapApiResponse<Owner>(r))
}

export function deactivateOwner(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: `${basePath}/${id}/deactivate`, signal })
    .then((r) => unwrapApiResponse<Owner>(r))
}

export function deleteOwner(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
    .then((r) => unwrapApiResponse<void>(r))
}
