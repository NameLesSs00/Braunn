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
  const result = unwrapApiResponse<Partial<CorporateContractSummary>>(response)
  return {
    ...result,
    contract: {
      contractId,
      contractNumber: result.contract?.contractNumber ?? '',
      contractType: result.contract?.contractType ?? '',
      companyName: result.contract?.companyName ?? '',
      currency: result.contract?.currency ?? 'EUR',
    },
    pricing: {
      source: result.pricing?.source ?? '',
      packageId: result.pricing?.packageId ?? '',
      packageCode: result.pricing?.packageCode ?? '',
      packageVersionId: result.pricing?.packageVersionId ?? '',
      packageVersionNumber: result.pricing?.packageVersionNumber ?? 0,
      discountPercentage: result.pricing?.discountPercentage ?? 0,
      taxPercentage: result.pricing?.taxPercentage ?? 0,
    },
    inventory: {
      ...result.inventory,
      source: result.inventory?.source ?? '',
      generated: result.inventory?.generated ?? false,
      allocatedRoomNights: result.inventory?.allocatedRoomNights ?? 0,
      consumedRoomNights: result.inventory?.consumedRoomNights ?? 0,
      releasedRoomNights: result.inventory?.releasedRoomNights ?? 0,
      remainingRoomNights: result.inventory?.remainingRoomNights ?? 0,
      pickupPercentage: result.inventory?.pickupPercentage ?? 0,
      roomTypes: result.inventory?.roomTypes ?? [],
      byRoomType: result.inventory?.byRoomType ?? [],
    },
    commercialValue: {
      guaranteedCommitmentLiability: result.commercialValue?.guaranteedCommitmentLiability ?? false,
      grossRoomValue: result.commercialValue?.grossRoomValue ?? 0,
      discountAmount: result.commercialValue?.discountAmount ?? 0,
      taxAmount: result.commercialValue?.taxAmount ?? 0,
      netContractValue: result.commercialValue?.netContractValue ?? 0,
      potentialMaximumValue: result.commercialValue?.potentialMaximumValue ?? 0,
      consumedReservationValue: result.commercialValue?.consumedReservationValue ?? 0,
    },
    consumption: {
      consumedRoomNights: result.consumption?.consumedRoomNights ?? 0,
      consumedValue: result.consumption?.consumedValue ?? 0,
      remainingCommittedValue: result.consumption?.remainingCommittedValue ?? 0,
    },
    credit: {
      creditLimit: result.credit?.creditLimit ?? 0,
      currentExposure: result.credit?.currentExposure ?? 0,
      remainingCredit: result.credit?.remainingCredit ?? 0,
      contractValueAboveCreditLimit: result.credit?.contractValueAboveCreditLimit ?? 0,
    },
    reservations: {
      total: result.reservations?.total ?? 0,
      future: result.reservations?.future ?? 0,
      reserved: result.reservations?.reserved ?? 0,
      checkedIn: result.reservations?.checkedIn ?? 0,
      checkedOut: result.reservations?.checkedOut ?? 0,
      cancelled: result.reservations?.cancelled ?? 0,
      noShow: result.reservations?.noShow ?? 0,
    },
    byPackageVersion: result.byPackageVersion ?? [],
    warnings: result.warnings ?? [],
  }
}
