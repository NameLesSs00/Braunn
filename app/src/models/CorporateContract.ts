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

// Types for nested objects
export type CorporateContractPackage = {
  id: string
  contractId: string
  packageId: string
  startDate: string // Date-time string
  endDate: string // Date-time string
  isActive: boolean
  notes: string
  assignedAt: string // Date-time string
  removedAt: string | null // Date-time string or null
}

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
  currentPackage?: unknown
  packageVersions?: unknown[]
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
  packages?: CorporateContractPackage[]
  packageVersions?: unknown[]
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

export type CreateCorporateContractPackageRequest = {
  packageId: string
  startDate: string
  endDate: string
  notes?: string
}
