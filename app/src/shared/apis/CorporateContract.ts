import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  CorporateContract,
  CreateCorporateContractRequest,
  UpdateCorporateContractRequest,
  CreateCorporateContractPackageRequest,
  CorporateContractPackage,
} from '../../models/CorporateContract'

const basePath = '/corporate-contracts'

// ============ Corporate Contract Endpoints ============

export async function getCorporateContractById(id: string, signal?: AbortSignal): Promise<CorporateContract> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  })
  return unwrapApiResponse<CorporateContract>(response)
}

export async function getCorporateContractsByAccountId(
  accountId: string,
  signal?: AbortSignal
): Promise<CorporateContract[]> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/by-account/${accountId}`,
    signal,
  })
  return unwrapApiResponse<CorporateContract[]>(response)
}

export async function createCorporateContract(
  payload: CreateCorporateContractRequest,
  signal?: AbortSignal
): Promise<CorporateContract> {
  const apiPayload = {
    ...payload,
    contractStatus: 'Draft', // Always set to Draft on creation
  }
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: apiPayload,
    signal,
  })
  return unwrapApiResponse<CorporateContract>(response)
}

export async function updateCorporateContract(
  id: string,
  payload: UpdateCorporateContractRequest,
  signal?: AbortSignal
): Promise<CorporateContract> {
  const response = await apiRequest<unknown>({
    method: 'PUT',
    path: `${basePath}/${id}`,
    body: payload,
    signal,
  })
  return unwrapApiResponse<CorporateContract>(response)
}

// ============ Package Management Endpoints ============

export async function addPackageToCorporateContract(
  contractId: string,
  payload: CreateCorporateContractPackageRequest,
  signal?: AbortSignal
): Promise<CorporateContractPackage> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${basePath}/${contractId}/packages`,
    body: payload,
    signal,
  })
  return unwrapApiResponse<CorporateContractPackage>(response)
}

export async function removePackageFromCorporateContract(
  contractId: string,
  contractPackageId: string,
  signal?: AbortSignal
): Promise<void> {
  await apiRequest<void>({
    method: 'DELETE',
    path: `${basePath}/${contractId}/packages/${contractPackageId}`,
    signal,
  })
}
