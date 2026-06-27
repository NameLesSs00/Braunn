export interface PackageRoomRate {
  roomTypeId: string
  maxGuestsAllowed: number
}

export interface PackageMealRate {
  mealPlanId: string
  pricePerNight: number
}

export interface PackageServiceRate {
  additionalServiceId: string
  pricePerNight: number
}

export interface Package {
  id: string
  code: string
  name: string
  description: string
  ratePlanCode: string
  startDate: string
  endDate: string
  isActive: boolean
  baseNightPrice: number
  adultExtraPrice: number
  childExtraPrice: number
  taxPercentage: number
  discountPercentage: number
  currencyCode: string
  mealTotalPerNight?: number
  serviceTotalPerNight?: number
  subtotalBeforeTax?: number
  taxAmount?: number
  discountAmount?: number
  finalNightPrice?: number
  roomRates: PackageRoomRate[]
  mealRates: PackageMealRate[]
  serviceRates: PackageServiceRate[]
}

export interface CreatePackagePayload {
  code: string
  name: string
  description: string
  ratePlanCode: string
  startDate: string
  endDate: string
  isActive: boolean
  baseNightPrice: number
  adultExtraPrice: number
  childExtraPrice: number
  taxPercentage: number
  discountPercentage: number
  currencyCode: string
  roomRates: PackageRoomRate[]
  mealRates: PackageMealRate[]
  serviceRates: PackageServiceRate[]
}

export interface UpdatePackagePayload {
  code: string
  name: string
  description: string
  ratePlanCode: string
  startDate: string
  endDate: string
  isActive: boolean
  baseNightPrice: number
  adultExtraPrice: number
  childExtraPrice: number
  taxPercentage: number
  discountPercentage: number
  currencyCode: string
  roomRates: PackageRoomRate[]
  mealRates: PackageMealRate[]
  serviceRates: PackageServiceRate[]
}
