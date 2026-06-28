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
  baseRoomAmount: number
  mealPlansTotal: number
  servicesTotal: number
  taxAmount: number
  grossTotalPrice: number
  depositAmount: number
  discountAmount: number
  discountPercentage: number
  couponDiscountAmount: number
  netRemainingBalance: number
  grandTotal: number
  paidAmount: number
  remainingBalance: number
  totalAdditionalServices: number
  totalMealPlanCost: number
  currency: string
  paymentStatus: string
  lastPaymentMethod: string | null
  lastPaymentReference: string | null
  lastPaymentDate: string | null
}

export interface PmsReservationRoom {
  reservationRoomId: string
  roomTypeId: string
  roomId: string | null
  checkInDate: string
  checkOutDate: string
  status: string
  pricePerNight: number
  totalPrice: number
}

export interface PmsReservationDetails extends PmsReservation {
  bookingReference: string | null
  reservationType: string
  bookingSource: string
  guest: PmsGuest
  reservationRooms: PmsReservationRoom[]
  createdAt: string
  companions: any[]
  guarantee: any | null
  finance: PmsFinance
  additionalServices: any[]
  mealPlans: any[]
  specialRequests: string | null
  comments: string | null
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
