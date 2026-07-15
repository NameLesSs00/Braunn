// Enums
export enum ContractType {
  Allotment = 'Allotment',
  Commitment = 'Commitment',
}

export enum ContractStatus {
  Draft = 'Draft',
  PendingActivation = 'PendingActivation',
  Active = 'Active',
  Terminated = 'Terminated',
  Suspended = 'Suspended',
  Expired = 'Expired',
}

export enum BillingCycle {
  MonthlyInvoice = 'MonthlyInvoice',
  PerReservation = 'PerReservation',
  Cash = 'Cash',
  CreditBilling = 'CreditBilling',
}

export enum RateCalculationMethod {
  Fixed = 'Fixed',
  PercentageDiscount = 'PercentageDiscount',
  Dynamic = 'Dynamic',
}

export enum CorporatePackageVersionStatus {
  Draft = 'Draft',
  Active = 'Active',
  Superseded = 'Superseded',
  Expired = 'Expired',
}

// Types for nested objects
export type CorporatePackageRoomRate = {
  roomTypeId: string
  adults: number
  children: number
  childAges: number[]
  ratePlanCode: string
  pricePerNight: number
}

export type CorporatePackageMealRate = {
  mealPlanId: string
  pricePerNight: number
}

export type CorporatePackageServiceRate = {
  additionalServiceId: string
  pricePerNight: number
}

export type CorporatePackageVersion = {
  id: string
  corporatePackageId: string
  versionNumber: number
  effectiveFrom: string
  effectiveTo: string | null
  isActive: boolean
  status: CorporatePackageVersionStatus | string
  taxPercentage: number
  discountPercentage: number
  currencyCode: string
  adultExtraPrice: number
  childExtraPrice: number
  createdAtUtc?: string
  createdByUserId?: string | null
  notes?: string | null
  roomRates: CorporatePackageRoomRate[]
  mealRates: CorporatePackageMealRate[]
  serviceRates: CorporatePackageServiceRate[]
}

export type CorporatePackageDto = {
  id: string
  corporateContractId: string
  code: string
  name: string
  description?: string | null
  isActive: boolean
  currentVersion: CorporatePackageVersion | null
  versionCount: number
  versions: CorporatePackageVersion[]
}

export type CorporateContractPackage = CorporatePackageDto

export type CorporateContractRate = {
  id: string
  contractId: string
  roomTypeId: string
  ratePerNight: number
  startDate: string // Date-time string
  endDate: string // Date-time string
  isActive: boolean
}

export type CorporateContractDiscount = {
  id: string
  contractId: string
  discountType: string // e.g., 'percentage', 'fixed'
  discountValue: number
  startDate: string // Date-time string
  endDate: string // Date-time string
  isActive: boolean
}

export type CorporateContractLockedRoomAllocation = {
  id: string
  contractId: string
  roomTypeId: string
  allocatedRooms: number
  startDate: string // Date-time string
  endDate: string // Date-time string
  isActive: boolean
}

export type CorporateContractCancellationPolicy = {
  id: number
  name: string
  code: string
  appliesToContractType: ContractType
  liquidatedDamagesPenaltyPercentage: number
}

export type CorporateContractCreditSummary = {
  creditLimit: number
  currentExposure: number
  remainingCredit: number
  contractValueAboveCreditLimit: number
}

export type CorporateContractInventorySummary = {
  source: string
  generated: boolean
  allocatedRoomNights: number
  consumedRoomNights: number
  releasedRoomNights: number
  remainingRoomNights: number
  pickupPercentage: number
  roomTypes: unknown[]
  byRoomType: unknown[]
}

export type CorporateContractDetailsResponse = {
  contract: CorporateContract
  company?: {
    id: string
    companyName: string
    contactPerson?: string
    email?: string
    phone?: string
  }
  cancellationPolicy?: CorporateContractCancellationPolicy | null
  currentPackage?: CorporatePackageDto | null
  packageVersions?: CorporatePackageVersion[]
  inventory?: CorporateContractInventorySummary
  consumption?: unknown
  reservations?: unknown
  credit?: CorporateContractCreditSummary
  legacyCompatibility?: unknown
  warnings?: string[]
}

// Main Contract Type
export type CorporateContract = {
  id: string
  corporateAccountId: string
  companyName?: string
  contractNumber: string
  contractType: ContractType
  status?: ContractStatus | string
  contractStatus?: ContractStatus | string
  startDate: string // Date-time string
  endDate: string // Date-time string
  corporateCancellationPolicyId?: number
  corporateCancellationPolicy?: CorporateContractCancellationPolicy | null
  cancellationPolicy?: string
  penaltyPercentage?: number
  depositAmount?: number
  creditLimit?: number
  currency: string
  releaseDaysBefore: number | null
  billingCycle?: BillingCycle
  rateCalculationMethod?: RateCalculationMethod
  terminationDate: string | null // Date-time string or null
  contractCreatedAt: string // Date-time string
  notes: string
  isActive: boolean
  packages?: CorporatePackageDto[]
  packageVersions?: CorporatePackageVersion[]
  rates?: CorporateContractRate[]
  discounts: CorporateContractDiscount[]
  lockedRoomAllocations: CorporateContractLockedRoomAllocation[]
  inventory?: CorporateContractInventorySummary
  credit?: CorporateContractCreditSummary
}

// Request/Response types
export type CreateCorporateContractRequest = {
  corporateAccountId: string
  contractNumber: string
  contractType: ContractType
  startDate: string
  endDate: string
  corporateCancellationPolicyId: number
  creditLimit: number
  currency: string
  releaseDaysBefore: number | null
  notes?: string
}

export type UpdateCorporateContractRequest = {
  startDate: string
  endDate: string
  corporateCancellationPolicyId: number
  creditLimit: number
  currency: string
  releaseDaysBefore: number | null
  notes?: string
}

export type CreateCorporatePackageVersionRequest = {
  effectiveFrom: string
  effectiveTo: string | null
  taxPercentage: number
  discountPercentage: number
  currencyCode: string
  adultExtraPrice: number
  childExtraPrice: number
  notes?: string
  roomRates: CorporatePackageRoomRate[]
  mealRates: CorporatePackageMealRate[]
  serviceRates: CorporatePackageServiceRate[]
}

export type CreateCorporateContractPackageRequest = {
  code: string
  name: string
  description?: string
  isActive: boolean
  initialVersion: CreateCorporatePackageVersionRequest
}

export type CorporateContractPackagesQuery = {
  Search?: string
  IsActive?: boolean
  EffectiveOn?: string
  ContractId?: string
  CurrencyCode?: string
}

export type CorporateInventoryRoomAllocationRequest = {
  roomTypeId: string
  allocatedRooms: number
}

export type GenerateCorporateInventoryRequest = {
  roomAllocations: CorporateInventoryRoomAllocationRequest[]
  regenerateFutureUnusedRows: boolean
  reason: string
}

export type GenerateCorporateInventoryRoomTypeResult = {
  roomTypeId: string
  roomTypeName: string
  roomsPerDay: number
  generatedDays: number
  existingDays: number
}

export type GenerateCorporateInventoryResponse = {
  contractId: string
  packageId: string
  packageVersionId: string
  contractType: ContractType | string
  fromDate: string
  toDate: string
  roomTypes: GenerateCorporateInventoryRoomTypeResult[]
  hotelAvailabilityImpact: boolean
  warnings: string[]
}

export type CorporateInventoryQuery = {
  fromDate?: string
  toDate?: string
  roomTypeId?: string
  contractType?: string
  packageId?: string
  versionId?: string
  onlyAvailable?: boolean
  onlyAdjusted?: boolean
}

export type CorporateInventoryRow = {
  id: string
  contractId: string
  packageId: string
  packageVersionId: string
  roomTypeId: string
  roomTypeName: string
  stayDate: string
  contractType: ContractType | string
  allocatedRooms: number
  consumedRooms: number
  releasedRooms: number
  manualAdjustmentRooms: number
  remainingCorporateRooms: number
}

export type CorporateInventoryResponse = {
  totalRows: number
  totalAllocatedRoomNights: number
  totalConsumedRoomNights: number
  totalReleasedRoomNights: number
  totalRemainingRoomNights: number
  rows: CorporateInventoryRow[]
}

export type CorporateContractSummaryContract = {
  contractId: string
  contractNumber: string
  contractType: ContractType | string
  companyName: string
  currency: string
}

export type CorporateContractSummaryPricing = {
  source: string
  packageId: string
  packageCode: string
  packageVersionId: string
  packageVersionNumber: number
  discountPercentage: number
  taxPercentage: number
}

export type CorporateContractSummaryInventoryRoomType = {
  roomTypeId: string
  roomTypeName: string
  fromDate: string
  toDate: string
  allocatedRoomsPerDay: number
  allocatedRoomNights: number
  consumedRoomNights: number
  releasedRoomNights: number
  remainingRoomNights: number
}

export type CorporateContractSummaryInventory = {
  source: string
  generated: boolean
  allocatedRoomNights: number
  consumedRoomNights: number
  releasedRoomNights: number
  remainingRoomNights: number
  pickupPercentage: number
  roomTypes: CorporateContractSummaryInventoryRoomType[]
  byRoomType: CorporateContractSummaryInventoryRoomType[]
}

export type CorporateContractSummaryCommercialValue = {
  guaranteedCommitmentLiability: boolean
  grossRoomValue: number
  discountAmount: number
  taxAmount: number
  netContractValue: number
  potentialMaximumValue: number
  consumedReservationValue: number
}

export type CorporateContractSummaryConsumption = {
  consumedRoomNights: number
  consumedValue: number
  remainingCommittedValue: number
}

export type CorporateContractSummaryCredit = {
  creditLimit: number
  currentExposure: number
  remainingCredit: number
  contractValueAboveCreditLimit: number
}

export type CorporateContractSummaryReservations = {
  total: number
  future: number
  reserved: number
  checkedIn: number
  checkedOut: number
  cancelled: number
  noShow: number
}

export type CorporateContractSummaryPackageVersion = {
  packageVersionId: string
  versionNumber: number
  grossRoomValue: number
  discountAmount: number
  taxAmount: number
  netValue: number
}

export type CorporateContractSummary = {
  contract: CorporateContractSummaryContract
  pricing: CorporateContractSummaryPricing
  inventory: CorporateContractSummaryInventory
  commercialValue: CorporateContractSummaryCommercialValue
  consumption: CorporateContractSummaryConsumption
  credit: CorporateContractSummaryCredit
  reservations: CorporateContractSummaryReservations
  byPackageVersion: CorporateContractSummaryPackageVersion[]
  warnings: string[]
}
