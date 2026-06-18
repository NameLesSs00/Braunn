export interface LocalARIRate {
  date: string
  amountBeforeTax: number
  amountAfterTax: number
  ageQualifyingCode: string
  numberOfGuests: number
  originalBaseRate: number
  appliedRuleName: string | null
  seasonalApplied: string | null
  seasonalAdjustmentAmount: number
  groupApplied: string | null
  groupDiscountAmount: number
  finalRateAfterTax: number
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
  amount: number
  ratePlanCode: string
  currency: string
  numberOfGuests: number
  ageQualifyingCode: string
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

