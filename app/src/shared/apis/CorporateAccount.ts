import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  CorporateAccount,
  CreateCorporateAccountRequest,
  UpdateCorporateAccountRequest,
} from '../../models/CorporateAccount'

const basePath = '/local/corporate-accounts'

/** GET /api/local/corporate-accounts — returns all accounts with embedded contracts */
export function getCorporateAccounts(signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: basePath, signal }).then((r) =>
    unwrapApiResponse<CorporateAccount[]>(r)
  )
}

/** POST /api/local/corporate-accounts — returns the new account id (UUID string) */
export function createCorporateAccount(
  payload: CreateCorporateAccountRequest,
  signal?: AbortSignal
): Promise<string> {
  const body = {
    companyName: payload.companyName,
    contactPerson: payload.contactPerson,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    isActive: payload.isActive,
  }
  return apiRequest<unknown>({ method: 'POST', path: basePath, body, signal }).then((r) =>
    unwrapApiResponse<string>(r)
  )
}

/** GET /api/local/corporate-accounts/{id} — returns a single account with embedded contracts */
export function getCorporateAccountById(id: string, signal?: AbortSignal) {
  return apiRequest<unknown>({ method: 'GET', path: `${basePath}/${id}`, signal }).then((r) =>
    unwrapApiResponse<CorporateAccount>(r)
  )
}

/** PUT /api/local/corporate-accounts/{id} — returns 204 (no body) */
export function updateCorporateAccount(
  id: string,
  payload: UpdateCorporateAccountRequest,
  signal?: AbortSignal
) {
  const body = {
    companyName: payload.companyName,
    contactPerson: payload.contactPerson,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    isActive: payload.isActive,
  }
  return apiRequest<void>({ method: 'PUT', path: `${basePath}/${id}`, body, signal })
}

/** DELETE /api/local/corporate-accounts/{id} — returns 204 (no body) */
export function deleteCorporateAccount(id: string, signal?: AbortSignal) {
  return apiRequest<void>({ method: 'DELETE', path: `${basePath}/${id}`, signal })
}
