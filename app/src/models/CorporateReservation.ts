export type CorporateReservationGuest = {
  firstName: string
  lastName: string
  email: string
  phone: string
  idType: string
  idNumber: string
  nationality: string
  address: string
  streetName: string
  countryCode: string
}

export type CorporateReservationCompanion = {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  address: string
  nationalId: string
}

export type CorporateReservationGuarantee = {
  guaranteeType: string
  guaranteeCode: string
  cardType: string
  cardCode: string
  cardHolderName: string
  maskedCardNumber: string
  tokenizedCardReference: string
  expirationDate: string
  seriesCodeMasked: string
  notes: string
}

export type CorporateReservationRoomRequest = {
  roomTypeId: string
  roomQuantity: number
  adults: number
  children: number
  childAges?: number[]
  ratePlanCode: string
  mealPlanIds?: string[]
  serviceIds?: string[]
}

export type CreateCorporateReservationV2Request = {
  corporateAccountId: string
  corporateContractId: string
  corporatePackageId: string
  checkInDate: string
  checkOutDate: string
  guest: CorporateReservationGuest
  companions: CorporateReservationCompanion[]
  guarantee: CorporateReservationGuarantee
  roomRequests: CorporateReservationRoomRequest[]
  currency: string
  specialRequests: string
  comments: string
  externalReference: string
}

export type CreateCorporateReservationV2Response = {
  reservationId: string
  bookingReference: string
  sourceType: string
  status: string
  corporateAccountId: string
  corporateContractId: string
  corporatePackageId: string
  corporatePackageVersionId?: string
  contractType?: string
  currency: string
  baseSubtotal: number
  discountAmount: number
  taxAmount: number
  grandTotal: number
  consumedRoomNights: number
  minimumRemainingCorporateRooms: number
  warnings: string[]
}
