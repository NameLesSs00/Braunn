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

// ============ OTA ARI (RateTiger) Types ============

export interface ARIRequestIdResponse {
  requestId: string
  generatedAtUtc: string
}

export interface ARIRatePlan {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AgeQualifyingCode = '10' | '8' // '10' = Adult, '8' = Child

export interface ARIBaseByGuestAmt {
  amountAfterTax: number
  currencyCode: string
  numberOfGuests: number
  ageQualifyingCode: AgeQualifyingCode
}

export interface ARIAdditionalGuestAmt {
  amount: number
  ageQualifyingCode: AgeQualifyingCode
}

export interface ARIRateAmountMessage {
  rates: {
    baseByGuestAmts: ARIBaseByGuestAmt[]
    additionalGuestAmts: ARIAdditionalGuestAmt[]
  }[]
  statusApplicationControl: {
    start: string
    end: string
    invTypeCode: string   // room type code
    ratePlanCode: string  // rate plan code
  }
}

export interface ARIUpdateRatesPayload {
  rateAmountMessages: {
    requestId: string
    timeStamp: string
    notifType: string
    hotelCode: string
    partnerId: string
    rateAmountMessage: ARIRateAmountMessage[]
  }
}

export interface ARIUpdateRatesResponse {
  rateTigerSuccess: boolean
  requestId: string
  correlationId: string
  hotelCode: string
  storedCurrentRates: number
  historyRowsCreated: number
  rateTigerResponse: {
    otaRateAmountNotifRS: {
      requestId: string
      timeStamp: string
      hotelCode: string
      correlationId: string
      success: string
      error: string | null
    }
  }
  errors: string[]
}

// ============ OTA ARI — Rates View Types ============

export interface ARIRateRecord {
  id: string
  hotelCode: string
  partnerId: string
  invTypeCode: string
  ratePlanCode: string
  stayDate: string
  rateKind: 'BaseByGuest' | 'AdditionalGuest'
  ageQualifyingCode: string   // '10' = Adult, '8' = Child
  numberOfGuests: number | null
  amountAfterTax: number
  currencyCode: string | null
  requestId: string
  correlationId: string
  lastSyncedAtUtc: string
  lastSyncSuccess: boolean
}

export interface GetARIRatesParams {
  hotelCode: string
  invTypeCode: string
  ratePlanCode: string
  startDate: string
  endDate: string
}
