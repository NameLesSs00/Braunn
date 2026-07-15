import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  CorporateContract,
  CorporateContractDetailsResponse,
  CreateCorporateContractRequest,
  UpdateCorporateContractRequest,
  CreateCorporateContractPackageRequest,
  CorporateContractPackage,
  CorporateContractPackagesQuery,
  CorporateInventoryQuery,
  CorporateInventoryResponse,
  CorporateContractSummary,
  GenerateCorporateInventoryRequest,
  GenerateCorporateInventoryResponse,
} from '../../models/CorporateContract'

const basePath = '/corporate-contracts'
const corporatePackagesBasePath = '/corporate-packages'

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

function normalizePackage(pkg: CorporateContractPackage): CorporateContractPackage {
  return {
    ...pkg,
    versions: pkg.versions ?? [],
    currentVersion: pkg.currentVersion
      ? {
          ...pkg.currentVersion,
          roomRates: pkg.currentVersion.roomRates ?? [],
          mealRates: pkg.currentVersion.mealRates ?? [],
          serviceRates: pkg.currentVersion.serviceRates ?? [],
        }
      : null,
  }
}

function normalizePackagesResponse(value: unknown): CorporateContractPackage[] {
  const unwrapped = unwrapApiResponse<
    CorporateContractPackage[] | { packages?: CorporateContractPackage[]; items?: CorporateContractPackage[] }
  >(value)
  const packages = Array.isArray(unwrapped)
    ? unwrapped
    : unwrapped.packages ?? unwrapped.items ?? []
  return packages.map(normalizePackage)
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

function buildPackageQuery(params?: CorporateContractPackagesQuery): string {
  if (!params) return ''
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function buildInventoryQuery(params?: CorporateInventoryQuery): string {
  if (!params) return ''
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getCorporateContractPackages(
  contractId: string,
  params?: CorporateContractPackagesQuery,
  signal?: AbortSignal
): Promise<CorporateContractPackage[]> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${contractId}/packages${buildPackageQuery(params)}`,
    signal,
  })
  return normalizePackagesResponse(response)
}

export async function createCorporateContractPackage(
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
  return normalizePackage(unwrapApiResponse<CorporateContractPackage>(response))
}

export const addPackageToCorporateContract = createCorporateContractPackage

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

// ============ Corporate Inventory Endpoints ============

export async function generateCorporatePackageInventory(
  packageId: string,
  versionId: string,
  payload: GenerateCorporateInventoryRequest,
  signal?: AbortSignal
): Promise<GenerateCorporateInventoryResponse> {
  const response = await apiRequest<unknown>({
    method: 'POST',
    path: `${corporatePackagesBasePath}/${packageId}/versions/${versionId}/inventory/generate`,
    body: payload,
    signal,
  })
  const result = unwrapApiResponse<GenerateCorporateInventoryResponse>(response)
  return {
    ...result,
    roomTypes: result.roomTypes ?? [],
    warnings: result.warnings ?? [],
  }
}

export async function getCorporateContractInventory(
  contractId: string,
  params?: CorporateInventoryQuery,
  signal?: AbortSignal
): Promise<CorporateInventoryResponse> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${contractId}/inventory${buildInventoryQuery(params)}`,
    signal,
  })
  const result = unwrapApiResponse<CorporateInventoryResponse>(response)
  return {
    totalRows: result.totalRows ?? 0,
    totalAllocatedRoomNights: result.totalAllocatedRoomNights ?? 0,
    totalConsumedRoomNights: result.totalConsumedRoomNights ?? 0,
    totalReleasedRoomNights: result.totalReleasedRoomNights ?? 0,
    totalRemainingRoomNights: result.totalRemainingRoomNights ?? 0,
    rows: result.rows ?? [],
  }
}

export async function getCorporateContractSummary(
  contractId: string,
  signal?: AbortSignal
): Promise<CorporateContractSummary> {
  const response = await apiRequest<unknown>({
    method: 'GET',
    path: `${basePath}/${contractId}/summary`,
    signal,
  })
  const result = unwrapApiResponse<CorporateContractSummary>(response)
  return {
    ...result,
    inventory: {
      ...result.inventory,
      roomTypes: result.inventory?.roomTypes ?? [],
      byRoomType: result.inventory?.byRoomType ?? [],
    },
    byPackageVersion: result.byPackageVersion ?? [],
    warnings: result.warnings ?? [],
  }
}
