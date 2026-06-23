export type PackagePricing = {
  roomTotal: number
  mealTotal: number
  serviceTotal: number
  subtotal: number
  discountAmount: number
  taxAmount: number
  serviceChargeAmount: number
  finalPrice: number
  pricePerNight: number
}

export type PackagePeriodRoomRate = {
  id: string
  packagePeriodId: string
  roomTypeId: string
  maxGuestsAllowed: number
}

export type PackagePeriodMealRate = {
  id: string
  packagePeriodId: string
  mealPlanId: string
  pricePerDay: number
}

export type PackagePeriodServiceRate = {
  id: string
  packagePeriodId: string
  additionalServiceId: string
  pricePerDay: number
}

export type PackagePeriod = {
  id: string
  packageId: string
  name: string
  fromDate: string
  toDate: string
  baseNightPrice: number
  includedNights: number
  taxPercentage: number
  serviceChargePercentage: number
  currencyCode: string
  discountType: string
  discountValue: number
  pricing: PackagePricing
  roomRates: PackagePeriodRoomRate[]
  mealRates: PackagePeriodMealRate[]
  serviceRates: PackagePeriodServiceRate[]
}

export type CorporatePackageDetails = {
  id: string
  code: string
  name: string
  description: string
  ratePlanCode: string
  validFrom: string
  validTo: string
  startDate: string
  endDate: string
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  mealPlanIds: string[]
  serviceIds: string[]
  rateIds: string[]
  discountIds: string[]
  periods: PackagePeriod[]
}

export type CorporateAccountPackage = {
  id: string
  corporateAccountId: string
  packageId: string
  startDate: string
  endDate: string
  isActive: boolean
  notes: string
  package: CorporatePackageDetails
}

export type CorporateAccount = {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  creditLimit: number
  isActive: boolean
  createdAt: string
  packages?: CorporateAccountPackage[]

  // UI Legacy fields
  contractStartDate?: string
  contractEndDate?: string
  negotiatedRate?: number
  discountPercentage?: number
  paymentTerms?: string
  billingMethod?: string
  cancellationPolicy?: string
  departureDate?: string
  depositRequired?: number
  discountAmount?: number
  blockedRooms?: number
}

export type CreateCorporateAccountRequest = Omit<CorporateAccount, 'id' | 'createdAt' | 'packages'>

export type UpdateCorporateAccountRequest = CreateCorporateAccountRequest
