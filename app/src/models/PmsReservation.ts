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
  // New fields from /local/reservations/by-date
  bookingReference?: string | null
  guestId?: string
  guest?: any
  roomId?: string
  roomTypeId?: string
  roomType?: any
  actualCheckOutDate?: string | null
  bookingSource?: string
  reservationType?: string
  corporateAccountId?: string | null
  groupContractId?: string | null
  couponCode?: string | null
  baseRateAtBooking?: number
  remainingAmount?: number
  currency?: string
  createdAt?: string
  localFinance?: any
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
  reservationRoomIds: string[]
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

// ─── Folio endpoint types (GET /api/pms/reservations/{id}/folio) ───────────

export interface FolioCharge {
  chargeId?: string
  reservationRoomId?: string
  roomNumber: string | null
  department: string
  description: string
  postingDate: string
  quantity: number
  unitAmount: number
  amountBeforeTax: number
  taxAmount: number
  amountAfterTax: number
  isVoided: boolean
  isPostedToFolio: boolean
  externalReference: string | null
}

export interface FolioPayment {
  paymentId?: string
  paymentDate: string
  paymentMethod: string | null
  amount: number
  currency: string | null
  type: string | null
  reference: string | null
  externalReference?: string | null
  reason: string | null
  status: string | null
}

export interface FolioTotals {
  roomChargesTotal: number
  serviceChargesTotal: number
  mealChargesTotal: number
  packageChargesTotal: number
  manualChargesTotal: number
  taxTotal: number
  chargesTotal: number
  paymentsTotal: number
  grossPaymentsTotal: number
  refundsTotal: number
  netPaymentsTotal: number
  remainingBalance: number
  paymentStatus: string
}

export interface FolioRateRateLine {
  ratePlanCode: string
  startDate: string
  endDate: string
  amountAfterTax: number
}

export interface FolioService {
  serviceDate: string
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface FolioMealPlan {
  mealPlanCode: string
  mealPlanName: string
  pricePerDay: number
  numberOfNights: number
  totalCost: number
  serviceDateStart: string
  serviceDateEnd: string
}

export interface FolioDiscount {
  discountName: string
  calculatedAmount: number
}

export interface FolioGuest {
  firstName: string | null
  middleName: string | null
  lastName: string | null
  fullName: string | null
  salutation: string | null
  dateOfBirth: string | null
  nationality: string | null
  idType: string | null
  idNumber: string | null
  phone: string | null
  email: string | null
  streetAddress: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
}

export interface FolioCompanion {
  firstName: string | null
  lastName: string | null
  idType: string | null
  idNumber: string | null
  nationality: string | null
  dateOfBirth: string | null
  gender: string | null
  relationshipToPrimary: string | null
}

export interface FolioReservationRoom {
  reservationRoomId: string
  roomTypeName: string | null
  roomNumber: string | null
  checkInDate: string
  checkOutDate: string
  actualCheckInAt: string | null
  actualCheckOutAt: string | null
  assignedAt: string | null
  adults: number
  children: number
  pricePerNight: number
  totalPrice: number
  status: string | null
}

export interface FolioGuarantee {
  guaranteeType: string | null
  cardType: string | null
  cardHolderName: string | null
  maskedCardNumber: string | null
  expirationDate: string | null
}

export interface PmsReservationFolio {
  bookingReference: string | null
  roomNumbers: string[]
  charges: FolioCharge[]
  payments: FolioPayment[]
  totals: FolioTotals
  reservationStatus: string | null
  reservationType: string | null
  bookingSource: string | null
  sourceType: string | null
  guest: FolioGuest | null
  companions: FolioCompanion[]
  reservationRooms: FolioReservationRoom[]
  specialRequests: string | null
  comments: string | null
  hasGuarantee: boolean
  guarantee: FolioGuarantee | null
  groupName: string | null
  couponCode: string | null
  // Root-level summary fields
  guestName: string
  roomNumber: string
  roomTypeName: string
  channelName: string
  externalReservationId: string | null
  rateTigerConfirmedId: string | null
  currency: string
  checkInDate: string
  checkOutDate: string
  numberOfNights: number
  totalRoomRate: number
  roomRateLines: FolioRateRateLine[]
  totalAdditionalServices: number
  services: FolioService[]
  totalMealPlanCost: number
  mealPlans: FolioMealPlan[]
  totalDiscounts: number
  discounts: FolioDiscount[]
  grandTotal: number
  paidAmount: number
  remainingBalance: number
  paymentStatus: string
}
