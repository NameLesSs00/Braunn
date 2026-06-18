export interface BaseGuestAmount {
  amountAfterTax: number
  currencyCode: string
  numberOfGuests: number
  ageQualifyingCode: string
}

export interface AdditionalGuestAmount {
  amount: number
  ageQualifyingCode: string
}

export interface ARIRate {
  id: string
  requestId: string
  timeStamp: string
  notifType: string
  hotelCode: string
  partnerId: string
  date: string
  invTypeCode: string
  ratePlanCode: string
  baseGuestAmounts: BaseGuestAmount[]
  additionalGuestAmounts: AdditionalGuestAmount[]
}

export interface ARIAvailability {
  date: string
  availableCount: number
  isSyncedToChannel: boolean
  lastSyncedAt: string
  roomTypeCode: string
}
