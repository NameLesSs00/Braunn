export interface ChildPolicy {
  ageFrom: number
  ageTo: number
  amountBeforeTax: number
  amountAfterTax: number
}

export interface ChildPolicyPayload {
  ageFrom: number
  ageTo: number
  amount: number
}

export interface LocalARIRate {
  date: string
  roomTypeId: string
  ratePlanCode: string
  currency: string
  taxPercentage: number
  basePriceBeforeTax: number
  basePriceAfterTax: number
  extraAdultPriceBeforeTax: number
  extraAdultPriceAfterTax: number
  childrenPriceBeforeTax: number
  childrenPriceAfterTax: number
  childPolicies: ChildPolicy[]
  amountBeforeTax: number
  amountAfterTax: number
  numberOfGuests: number
  originalBaseRate: number
  appliedRuleName: string | null
  seasonalApplied: string | null
  seasonalAdjustmentAmount: number
  groupApplied: string | null
  groupDiscountAmount: number
  finalRateAfterTax: number
  modifiedBy: string
  modifiedAt: string
}

export interface GetLocalARIRatesParams {
  roomTypeId: string
  ratePlanCode: string
  startDate: string
  endDate: string
  roomCount: number
  adults: number
  children: number
  extraBeds: number
  groupName?: string
  corporateAccountId?: string
}

export interface CreateLocalARIRatePayload {
  roomTypeId: string
  dateFrom: string
  dateTo: string
  ratePlanCode: string
  currency: string
  basePrice: number
  numberOfGuests: number
  extraAdultPrice: number
  childrenPrice: number
  taxPercentage: number
  childPolicies: ChildPolicyPayload[]
}
export interface CreateLocalARIAvailabilityPayload {
  roomTypeId: string
  dateFrom: string
  dateTo: string
  availableCount: number
}

export interface GetLocalARIAvailabilityParams {
  startDate: string
  endDate: string
  roomTypeId?: string
}

export interface LocalARIAvailabilityInventory {
  date: string
  totalRooms: number
  bookedRooms: number
  blockedByContracts: number
  netAvailableRooms: number
}

export interface LocalARIAvailability {
  roomTypeId: string
  roomTypeName: string
  inventory: LocalARIAvailabilityInventory[]
}

export interface UpdateLocalARISingleDayRatePayload {
  roomTypeId: string
  ratePlanCode: string
  date: string
  newBaseRate: number
}

export interface CreateLocalARIRestrictionPayload {
  roomTypeId: string
  dateFrom: string
  dateTo: string
  ratePlanCode: string
  closedToArrival: boolean
  closedToDeparture: boolean
  stopSell: boolean
  minLOS: number
  maxLOS: number
}

export interface GetLocalARIRatesHistoryParams {
  roomTypeId?: string
  date?: string
}

export interface LocalARIRateHistory {
  id: string
  roomTypeId: string
  ratePlanCode: string
  date: string
  oldBaseRate: number
  newBaseRate: number
  changedBy: string
  changedAt: string
}

