export interface PmsReservation {
  id: string
  guestName: string
  roomNumber: string | null
  roomTypeName: string
  checkInDate: string
  checkOutDate: string
  status: string
  totalAmount: number
  paidAmount: number
  channelName: string | null
}

export interface PmsGuest {
  id: string
  firstName: string
  lastName: string
  fullName: string
  dateOfBirth: string
  nationality: string
  idType: string
  idNumber: string
  phone: string
  email: string
  streetAddress: string | null
  city: string | null
  country: string | null
  postalCode: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  createdAt: string
}

export interface PmsFinance {
  reservationId: string
  currency: string
  totalBeforeTax: number
  totalTax: number
  totalAfterTax: number
  discountAmount: number
  finalAmount: number
  totalAdditionalServices: number
  totalDiscount: number
  grandTotal: number
  remainingBalance: number
  paidAmount: number
  dueAmount: number
  paymentStatus: string
  payments: any[]
  discounts: any[]
}

export interface PmsReservationDetails extends PmsReservation {
  guest: PmsGuest
  roomTypeId: string
  roomId: string | null
  baseRateAtBooking: number
  currency: string
  externalReservationId: string | null
  channelConfirmedId: string | null
  rateTigerConfirmedId: string | null
  createdAt: string
  companions: any[]
  guarantee: any | null
  finance: PmsFinance
}
export interface PmsCheckInByDate {
  reservationId: string
  guestFullName: string
  roomNumber: string
  roomTypeName: string
  checkInDate: string
  checkOutDate: string
  remainingBalance: number
  status: string
}
export interface PmsInHouseReservation {
  reservationId: string
  guestFullName: string
  roomNumber: string
  roomTypeName: string
  checkInDate: string
  checkOutDate: string
  remainingBalance: number
  status: string
}
