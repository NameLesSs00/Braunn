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
  sourceType?: string | null
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

export interface ReservationPolicySettings {
  freeCancellationBeforeHours?: number
  percentage?: number
  requiresManualApproval?: boolean
  [key: string]: unknown
}

export interface ReservationPolicy {
  id: number
  name: string
  code: string
  policyType: string
  isActive: boolean
  appliesToReservationType: string | null
  appliesToBookingSource: string | null
  appliesToRatePlanCode: string | null
  effectiveFrom: string | null
  effectiveTo: string | null
  priority: number
  settings: ReservationPolicySettings | null
  createdAtUtc: string | null
  updatedAtUtc: string | null
}

export interface ReservationPolicyEvaluationRequest {
  reservationId: string
  policyType: 'Cancellation'
  reservationType: string
  bookingSource: string
  ratePlanCode: string
  evaluationDateTime: string
  checkInDateTime: string
  checkOutDateTime: string
  requestedDateTime: string
  bookingTotal: number
  firstNightAmount: number
  nightlyRate: number
  unusedNightsAmount: number
  rateDifference: number
  extensionNights: number
  availabilityConfirmed: boolean
  isOperationalRoomMove: boolean
  isGuestRequestedUpgrade: boolean
  netPaidAmount: number
  manualAmount: number
}

export interface ReservationPolicyEvaluationResult {
  isAllowed: boolean
  policyCode: string
  policyName: string
  policyType: string
  reason: string
  percentage: number
  calculationBase: number
  calculationBaseSource: string
  calculatedAmount: number
  penaltyAmount: number
  refundAmount: number
  chargeAmount: number
  requiresManualApproval: boolean
  warnings: string[]
}

export interface EvaluateLateCheckoutRequest {
  reservationRoomId: string
  actualCheckoutDateTime: string
  evaluationDateTime: string
  forceManualApprovalOverride: boolean
}

export interface LateCheckoutChargeBreakdown {
  date: string
  chargeType: string | null
  nightlyRateBeforeTax: number
  percentage: number
  amountBeforeTax: number
  taxAmount: number
  amountAfterTax: number
  alreadyPosted: boolean
  existingChargeId: string | null
  externalReference: string | null
}

export interface EvaluateLateCheckoutResponse {
  reservationId: string
  reservationRoomId: string
  roomId: string | null
  roomNumber: string | null
  roomTypeId: string
  roomTypeName: string | null
  ratePlanCode: string | null
  currency: string | null
  scheduledCheckoutDateTime: string
  actualCheckoutDateTime: string
  lateCheckoutBand: string | null
  percentage: number
  nightlyRateBeforeTax: number
  taxAmount: number
  chargeBeforeTax: number
  chargeAfterTax: number
  existingOutstandingBalance: number
  estimatedRemainingBalanceAfterPosting: number
  isAllowed: boolean
  requiresManualApproval: boolean
  policyId: number | null
  policyCode: string | null
  policyName: string | null
  breakdown: LateCheckoutChargeBreakdown[] | null
  warnings: string[] | null
  pricingSource: string | null
  bookedNightlyRate: number | null
  dynamicNightlyRate: number | null
  occupancyAdults: number
  occupancyChildren: number
  occupancyChildAges: number[] | null
  rateWarnings: string[] | null
}

export interface CompleteLateCheckoutRequest {
  actualCheckoutDateTime: string
  reason?: string | null
  forceManualApprovalOverride: boolean
  manualChargeAmount?: number
  externalReference?: string | null
}

export interface EvaluateExtendStayRequest {
  reservationId: string
  newCheckoutDate: string
  evaluationDateTime: string
  useCurrentRatePlan: boolean
  manualNightlyRate: number
  forceManualApprovalOverride: boolean
}

export interface ExtendStayNightlyBreakdown {
  date: string
  roomTypeId: string
  roomTypeName: string | null
  ratePlanCode: string | null
  adults: number
  children: number
  baseRoomAmount: number
  taxAmount: number
  roomAmountAfterTax: number
  mealPlanAmount: number
  recurringServiceAmount: number
  nightTotal: number
  isRoomTypeAvailable: boolean
  isAssignedRoomAvailable: boolean
  warnings: string[] | null
}

export interface ExtendStayMealPlanBreakdown {
  mealPlanId: string
  mealPlanCode: string | null
  mealPlanName: string | null
  pricingMode: string | null
  addedDays: number
  unitPrice: number
  addedAmount: number
}

export type ExtendStayUnavailableDate = Record<string, unknown>

export interface EvaluateExtendStayResponse {
  reservationId: string
  reservationRoomId: string
  currentCheckoutDate: string
  newCheckoutDate: string
  additionalNights: number
  isAllowed: boolean
  requiresManualApproval: boolean
  policyId: number | null
  policyCode: string | null
  policyName: string | null
  policyType: string | null
  calculationBase: number
  calculationBaseSource: string | null
  pricingSource: string | null
  roomTypeId: string
  roomTypeName: string | null
  assignedRoomId: string | null
  assignedRoomNumber: string | null
  ratePlanCode: string | null
  currency: string | null
  additionalRoomAmountBeforeTax: number
  additionalRoomTaxAmount: number
  additionalRoomAmountAfterTax: number
  additionalMealPlanAmount: number
  additionalRecurringServicesAmount: number
  additionalGrandTotal: number
  requiresMealPlanConfirmation: boolean
  nightlyBreakdown: ExtendStayNightlyBreakdown[] | null
  mealPlanBreakdown: ExtendStayMealPlanBreakdown[] | null
  unavailableDates: ExtendStayUnavailableDate[] | null
  warnings: string[] | null
}

export interface ExecuteExtendStayRequest {
  newCheckoutDate: string
  reason: string
  useCurrentRatePlan: boolean
  manualNightlyRate: number
  externalReference?: string | null
  forceManualApprovalOverride: boolean
}

export interface ExecuteExtendStayResponse {
  reservationId: string
  oldCheckoutDate: string
  newCheckoutDate: string
  additionalNights: number
  additionalCharge: number
  remainingBalance: number
  paymentStatus: string | null
  chargeIds: string[] | null
  warnings: string[] | null
}

export type RoomChangeType = 'OperationalMove' | 'Upgrade' | 'Downgrade'

export interface EvaluateRoomChangeRequest {
  reservationRoomId: string
  newRoomId: string
  changeType: RoomChangeType
  effectiveDate?: string | null
  evaluationDateTime?: string | null
  forceManualApprovalOverride: boolean
}

export interface RoomChangeNightlyBreakdown {
  date: string
  oldNightRateBeforeTax: number
  oldTax: number
  oldNightRateAfterTax: number
  newNightRateBeforeTax: number
  newTax: number
  newNightRateAfterTax: number
  difference: number
}

export interface EvaluateRoomChangeResponse {
  reservationId: string
  reservationRoomId: string
  currentRoomId: string | null
  currentRoomNumber: string | null
  currentRoomTypeId: string | null
  currentRoomTypeName: string | null
  newRoomId: string
  newRoomNumber: string | null
  newRoomTypeId: string | null
  newRoomTypeName: string | null
  changeType: RoomChangeType | string
  effectiveDate: string | null
  checkoutDate: string | null
  remainingNights: number
  ratePlanCode: string | null
  currency: string | null
  oldStayAmount: number
  newStayAmount: number
  rateDifference: number
  upgradeChargeAmount: number
  downgradeCreditAmount: number
  netPaidAmount: number
  estimatedRemainingBalanceAfterAdjustment: number
  maximumRefundableAmount: number
  suggestedRefundAmount: number
  isAllowed: boolean
  requiresManualApproval: boolean
  policyId: number | null
  policyCode: string | null
  policyName: string | null
  unavailableDates: string[] | null
  nightlyBreakdown: RoomChangeNightlyBreakdown[] | null
  warnings: string[] | null
}

export interface ChangeRoomRequest {
  newRoomId: string
  changeType?: string | null
  reason?: string | null
  effectiveDate?: string | null
  forceManualApprovalOverride: boolean
  processRefund: boolean
  manualChargeAmount?: number | null
  manualRefundAmount?: number | null
  externalReference?: string | null
  refundPaymentMethod?: string | null
  refundReference?: string | null
  originalPaymentId?: string | null
  refundExternalReference?: string | null
}

export interface ChangeRoomResponse {
  quote: EvaluateRoomChangeResponse | null
  creditChargeId: string | null
  reservationId: string
  reservationRoomId: string
  oldRoomId: string | null
  newRoomId: string
  oldRoomNumber: string | null
  newRoomNumber: string | null
  oldRoomTypeId: string | null
  newRoomTypeId: string | null
  changeType: string | null
  chargeAmount: number
  refundAmount: number
  refundProcessed: boolean
  refundId: string | null
  refundStatus: string | null
  chargeId: string | null
  remainingBalance: number
  paymentStatus: string | null
  warnings: string[] | null
}

export interface CancelReservationRequest {
  reason: string
  cancellationDate: string
  forceManualApprovalOverride: boolean
  externalReference: string
  postPenaltyToFolio: boolean
  processRefund: boolean
  refundPaymentMethod: string
  refundReference: string
  originalPaymentId: string | null
  refundExternalReference: string
}

export interface CancelReservationResult {
  reservationId: string
  bookingReference: string
  previousStatus: string
  newStatus: string
  isAllowed: boolean
  requiresManualApproval: boolean
  penaltyAmount: number
  refundAmount: number
  refundProcessed: boolean
  refundId: string | null
  refundStatus: string
  remainingBalance: number
  paymentStatus: string
  penaltyChargeId: string | null
  reason: string
  warnings: string[]
}
