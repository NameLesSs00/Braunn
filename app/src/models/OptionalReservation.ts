// ─── List item (returned by GET /api/optional-reservations items[]) ──────────
export interface OptionalReservationListItem {
  id: string
  optionNumber: string
  guestName: string
  guestDisplayName: string
  phone: string | null
  checkInDate: string
  checkOutDate: string
  roomSummary: string
  status: string
  expiresAt: string
  expiresAtUtc: string
  assignedToUserId: string | null
  assignedToName: string | null
  assignedToDisplayName: string | null
  bookingSource: string | number
  reservationType: string
  isExpired: boolean
  isExpiringSoon: boolean
  expiresToday: boolean
  needsAttention: boolean
  expiryStatus: string
  createdAtUtc: string
  version: number
  convertedReservationId: string | null
}

// ─── Paginated list response ──────────────────────────────────────────────────
export interface OptionalReservationListResponse {
  items: OptionalReservationListItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// ─── Full detail (returned by GET /api/optional-reservations/{id}) ────────────
export interface OptionalReservationDetail {
  id: string
  optionNumber: string
  status: string
  guest: {
    fullName: string
    firstName: string
    lastName: string
    email: string
    phone: string
    nationalId: string
    address: string
    streetName: string
    countryCode: string
  }
  checkInDate: string
  checkOutDate: string
  bookingSource: string
  reservationType: string
  currency: string
  roomRequests: {
    roomTypeId: string
    roomQuantity: number
    adults: number
    children: number
    childAges: number[]
    ratePlanCode: string
    pricePerNight: number
  }[]
  selectedServices: {
    additionalServiceId: string
    serviceDate: string
    price: number
  }[]
  selectedMealPlans: {
    mealPlanId: string
    price: number
    serviceDateStart: string
    numberOfDays: number
  }[]
  companions: {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    address: string
    nationalId: string
  }[]
  specialRequests: string
  comments: string
  discountPercentage: number
  paymentMethod: string
  guarantee: Record<string, string> | null
  expiresAt: string
  assignedToUserId: string | null
  assignedToName: string | null
  isExpired: boolean
  isExpiringSoon: boolean
  expiresToday: boolean
  needsAttention: boolean
  expiryStatus: string | number
  daysUntilExpiry: number
  hoursUntilExpiry: number
  convertedReservationId: string | null
  createdAtUtc: string
  createdByUserId: string
  createdByName: string
  updatedAtUtc: string | null
  expiredAtUtc: string | null
  cancelledAtUtc: string | null
  version: number
  convertedAtUtc: string | null
  convertedBookingReference: string | null
  warnings: string[]
}

// ─── Query filters for GET list ───────────────────────────────────────────────
export interface OptionalReservationFilters {
  Status?: string
  BookingSource?: string
  RoomTypeId?: string
  CheckInFrom?: string
  CheckInTo?: string
  CheckOutFrom?: string
  CheckOutTo?: string
  ExpiresFrom?: string
  ExpiresTo?: string
  OnlyExpired?: boolean
  Page?: number
  PageSize?: number
}

// ─── Create request (POST /api/optional-reservations) ────────────────────────
export interface CreateOptionalReservationRequest {
  guest: {
    firstName: string
    lastName: string
    email: string
    phone: string
    nationalId: string
    address: string
    streetName: string
    countryCode: string
  }
  checkInDate: string
  checkOutDate: string
  bookingSource: string
  reservationType: string
  currency: string
  roomRequests: {
    roomTypeId: string
    roomQuantity: number
    adults: number
    children: number
    childAges: number[]
    ratePlanCode: string
    pricePerNight: number
  }[]
  selectedServices: {
    additionalServiceId: string
    serviceDate: string
    price: number
  }[]
  selectedMealPlans: {
    mealPlanId: string
    price: number
    serviceDateStart: string
    numberOfDays: number
  }[]
  companions: {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    address: string
    nationalId: string
  }[]
  specialRequests: string
  comments: string
  discountPercentage: number
  paymentMethod: string
  guarantee: Record<string, never>
  expiresAt: string
  assignedToUserId?: string
}

// ─── Update request (PUT /api/optional-reservations/{id}) ────────────────────
export interface UpdateOptionalReservationRequest extends Omit<CreateOptionalReservationRequest, 'guarantee'> {
  guarantee: Record<string, string> | null
  expectedVersion: number
}

// ─── Extend expiry request ────────────────────────────────────────────────────
export interface ExtendExpiryRequest {
  newExpiresAt: string
  reason: string
  expectedVersion: number
}

// ─── Delete request ───────────────────────────────────────────────────────────
export interface DeleteOptionalReservationRequest {
  reason: string
}

// ─── Legacy alias kept for existing code ─────────────────────────────────────
export type OptionalReservation = OptionalReservationListItem

// ─── Conversion ───────────────────────────────────────────────────────────────
export interface ConvertOptionalReservationRequest {
  expectedVersion: number
  overrideCheckInDate?: string
  overrideCheckOutDate?: string
  overrideCurrency?: string
  overrideBookingSource?: string
  overrideReservationType?: string
  overrideRoomRequests?: {
    roomTypeId: string
    roomQuantity: number
    adults: number
    children: number
    childAges: number[]
    ratePlanCode: string
    pricePerNight: number
  }[]
  overrideSelectedServices?: {
    additionalServiceId: string
    serviceDate: string
    price: number
  }[]
  overrideSelectedMealPlans?: {
    mealPlanId: string
    price: number
    serviceDateStart: string
    numberOfDays: number
  }[]
  overrideDiscountPercentage?: number
  comments?: string
  externalReference?: string
}

export interface ConversionPreviewResponse {
  optionalReservationId: string
  optionNumber: string
  canConvert: boolean
  availability: {
    isAvailable: boolean
    shortages: {
      roomTypeId: string
      roomTypeName: string
      date: string
      requestedRooms: number
      availableRooms: number
    }[]
  }
  pricing: {
    currency: string
    quotedTotal: number
    currentTotal: number
    difference: number
    discountPercentage: number
    discountAmount: number
    taxAmount: number
  }
  guest: {
    willReuseExistingGuest: boolean
    existingGuestId?: string
  }
  warnings: string[]
  errors: string[]
}
