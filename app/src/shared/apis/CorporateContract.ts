import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  CorporateContract,
  CorporateContractDetailsResponse,
  CreateCorporateContractRequest,
  UpdateCorporateContractRequest,
  CreateCorporateContractPackageRequest,
  CorporateContractPackage,
} from '../../models/CorporateContract'

const basePath = '/corporate-contracts'

function normalizeContract(contract: CorporateContract): CorporateContract {
  return {
    ...contract,
    contractStatus: contract.contractStatus ?? contract.status,
    packages: contract.packages ?? [],
    rates: contract.rates ?? [],
    discounts: contract.discounts ?? [],
    lockedRoomAllocations: contract.lockedRoomAllocations ?? [],
  }
}

function normalizeContractResponse(value: unknown): CorporateContract {
  const unwrapped = unwrapApiResponse<CorporateContract | CorporateContractDetailsResponse>(value)
  if (unwrapped && typeof unwrapped === 'object' && 'contract' in unwrapped) {
    const details = unwrapped as CorporateContractDetailsResponse
    return normalizeContract({
      ...details.contract,
      corporateCancellationPolicy: details.contract.corporateCancellationPolicy ?? details.cancellationPolicy ?? null,
      inventory: details.contract.inventory ?? details.inventory,
      credit: details.contract.credit ?? details.credit,
    })
  }
  return normalizeContract(unwrapped as CorporateContract)
}

function normalizeContractsResponse(value: unknown): CorporateContract[] {
  const unwrapped = unwrapApiResponse<CorporateContract[] | { contracts?: CorporateContract[]; items?: CorporateContract[] }>(value)
  const contracts = Array.isArray(unwrapped)
    ? unwrapped
    : unwrapped.contracts ?? unwrapped.items ?? []
  return contracts.map(normalizeContract)
}

// ============ Corporate Contract Endpoints ============

export async function getCorporateContractById(id: string, signal?: AbortSignal): Promise<CorporateContract> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${id}`,
    signal,
  })
  return normalizeContractResponse(response)
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
  return normalizeContractsResponse(response)
}

export async function createCorporateContract(
  payload: CreateCorporateContractRequest,
  signal?: AbortSignal
): Promise<CorporateContract> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: basePath,
    body: payload,
    signal,
  })
  return normalizeContractResponse(response)
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
  return normalizeContractResponse(response)
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
