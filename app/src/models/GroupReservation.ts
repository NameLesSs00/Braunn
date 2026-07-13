export type GroupWizardStep = 1 | 2 | 3 | 4

export type GroupInfoDraft = {
  groupName: string
  contactPerson: string
  email: string
  phone: string
  status: string
  arrivalDate: string
  departureDate: string
  discountPercentage: string
  notes: string
}

export type GroupRoomRequestDraft = {
  id: number
  roomTypeId: string
  roomTypeName: string
  quantity: number
  adults: number
  children: number
  ratePlanCode: string
  rateTotal: number
}

export type GroupCompanionDraft = {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  address: string
  nationalId: string
}

export type GroupSelectedServiceDraft = {
  id: number
  additionalServiceId: string
  serviceDate: string
  price: number
}

export type GroupSelectedMealPlanDraft = {
  id: number
  mealPlanId: string
  serviceDateStart: string
  numberOfDays: number
  price: number
}

export type GroupReservationDraftItem = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  nationalId: string
  country: string
  address: string
  reservationType: string
  currency: string
  specialRequests: string
  roomRequests: GroupRoomRequestDraft[]
  mealPlanName: string
  serviceNames: string[]
  selectedMealPlans: GroupSelectedMealPlanDraft[]
  selectedServices: GroupSelectedServiceDraft[]
  companions: GroupCompanionDraft[]
  paymentStatus: 'Pending' | 'Partial' | 'Paid'
  status: 'Draft' | 'Confirmed'
}

export type GroupReservationFormDraft = Omit<GroupReservationDraftItem, 'id' | 'mealPlanName' | 'serviceNames' | 'paymentStatus' | 'status'>

export type GroupPaymentDraft = {
  amount: string
  currency: string
  paymentMethod: 'Card' | 'Cash' | 'Online'
  paymentReference: string
  paymentDate: string
  paymentType: 'Deposit' | 'Payment'
  method: 'Card' | 'Cash' | 'Online'
}

export type GroupReservationDraftValue = {
  groupInfo: GroupInfoDraft
  reservations: GroupReservationDraftItem[]
  payment: GroupPaymentDraft
}

export type CreateGroupReservationRequest = {
  groupName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  arrivalDate: string
  departureDate: string
  status: string
  groupDiscountPercentage: number
  notes: string
  reservations: Array<{
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
    reservationType: string
    currency: string
    roomRequests: Array<{
      roomTypeId: string
      roomQuantity: number
      adults: number
      children: number
      childAges: number[]
      ratePlanCode: string
    }>
    selectedServices: Array<{
      additionalServiceId: string
      serviceDate: string
      price: number
    }>
    selectedMealPlans: Array<{
      mealPlanId: string
      price: number
      serviceDateStart: string
      numberOfDays: number
    }>
    companions: Array<{
      firstName: string
      lastName: string
      phoneNumber: string
      email: string
      address: string
      nationalId: string
    }>
    specialRequests: string
    comments: string
  }>
}

export type CreatedGroupReservationChild = {
  id?: string | null
  reservationId?: string | null
  bookingReference?: string | null
  guestId?: string | null
  guestName?: string | null
  reservationRoomIds?: string[] | null
  roomTypeNames?: string[] | null
  originalTotal?: number | null
  groupDiscountPercentage?: number | null
  groupDiscountAmount?: number | null
  finalTotal?: number | null
  remainingBalance?: number | null
  currency?: string | null
}

export type CreateGroupReservationResponse = {
  id?: string | null
  groupId?: string | null
  groupReservationId?: string | null
  groupReference?: string | null
  groupName?: string | null
  status?: string | null
  arrivalDate?: string | null
  departureDate?: string | null
  groupDiscountPercentage?: number | null
  childReservationCount?: number | null
  totalBeforeDiscount?: number | null
  totalDiscountAmount?: number | null
  totalAfterDiscount?: number | null
  reservationIds?: string[] | null
  reservations?: CreatedGroupReservationChild[] | null
  childReservations?: CreatedGroupReservationChild[] | null
  localReservations?: CreatedGroupReservationChild[] | null
  warnings?: string[] | null
}
