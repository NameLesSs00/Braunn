import { apiRequest, unwrapApiResponse } from './apiClient'
import type { CorporateAccount, CreateCorporateAccountRequest, UpdateCorporateAccountRequest } from '../../models/CorporateAccount'

const basePath = '/local/corporate-accounts'

export function getCorporateAccounts(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) => unwrapApiResponse<CorporateAccount[]>(r))
}

export function createCorporateAccount(payload: CreateCorporateAccountRequest, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'POST', path: basePath, body: payload, signal }).then((r) => unwrapApiResponse<CorporateAccount>(r))
}

export function getCorporateAccountById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) => unwrapApiResponse<CorporateAccount>(r))
}

export function updateCorporateAccount(id: string, payload: UpdateCorporateAccountRequest, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'PUT', path: `${basePath}/${id}`, body: payload, signal })
}

export function deleteCorporateAccount(id: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
}




