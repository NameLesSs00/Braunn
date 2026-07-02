// Enums
export enum ContractType {
  Allotment = 'Allotment',
  Commitment = 'Commitment',
}

export enum ContractStatus {
  Draft = 'Draft',
  Active = 'Active',
  Terminated = 'Terminated',
  Suspended = 'Suspended',
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

// Main Contract Type
export type CorporateContract = {
  id: string
  corporateAccountId: string
  contractNumber: string
  contractType: ContractType
  contractStatus: ContractStatus
  startDate: string // Date-time string
  endDate: string // Date-time string
  cancellationPolicy: string
  penaltyPercentage: number
  depositAmount: number
  currency: string
  releaseDaysBefore: number | null
  billingCycle: BillingCycle
  rateCalculationMethod: RateCalculationMethod
  terminationDate: string | null // Date-time string or null
  contractCreatedAt: string // Date-time string
  notes: string
  isActive: boolean
  packages: CorporateContractPackage[]
  rates: CorporateContractRate[]
  discounts: CorporateContractDiscount[]
  lockedRoomAllocations: CorporateContractLockedRoomAllocation[]
}

// Request/Response types
export type CreateCorporateContractRequest = {
  corporateAccountId: string
  contractNumber: string
  contractType: ContractType
  contractStatus?: ContractStatus
  startDate: string
  endDate: string
  cancellationPolicy: string
  penaltyPercentage: number
  depositAmount: number
  currency: string
  releaseDaysBefore?: number | null
  billingCycle: BillingCycle
  rateCalculationMethod: RateCalculationMethod
  notes?: string
}

export type UpdateCorporateContractRequest = Omit<CreateCorporateContractRequest, 'corporateAccountId'> & {
  contractStatus?: ContractStatus
}

export type CreateCorporateContractPackageRequest = {
  packageId: string
  startDate: string
  endDate: string
  notes?: string
}
