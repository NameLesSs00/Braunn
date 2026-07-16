export type ReservationPolicyType =
  | 'AdvanceBooking'
  | 'Modification'
  | 'Cancellation'
  | 'ExtendStay'
  | 'RoomChange'
  | 'EarlyCheckout'
  | 'LateCheckout'
  | 'NoShow'

export type ReservationPolicy = {
  id: number
  name: string
  code: string
  policyType: ReservationPolicyType
  isActive: boolean
  appliesToReservationType?: string | null
  appliesToBookingSource?: string | null
  appliesToRatePlanCode?: string | null
  effectiveFrom?: string | null
  effectiveTo?: string | null
  priority: number
  settings: string | Record<string, unknown> | null
  createdAtUtc?: string | null
  updatedAtUtc?: string | null
}

export type CancellationPolicySettings = {
  freeCancellationBeforeHours: number
  percentage: number
  requiresManualApproval: boolean
}

export type EarlyCheckoutPolicySettings = {
  percentage: number
  requiresManualApproval: boolean
}

export type LateCheckoutPolicySettings = {
  freeUntil: string
  halfDayUntil: string
  halfDayPercentage: number
  fullDayPercentage: number
  requiresManualApproval: boolean
  pricingSource: 'BookedRate' | string
}

export type ExtendStayPolicySettings = {
  isAllowed: boolean
  availabilityRequired: boolean
  requiresManualApproval: boolean
}

export type RoomChangePolicySettings = {
  operationalMoveAllowed: boolean
  upgradePricingBehavior: 'ChargeRateDifference' | 'NoCharge' | string
  downgradeBehavior: 'NoRefund' | 'RefundDifference' | string
  downgradeRefundBehavior: 'NoRefund' | 'RefundDifference' | string
  requiresManualApproval: boolean
}

export type ReservationPolicySettings =
  | CancellationPolicySettings
  | EarlyCheckoutPolicySettings
  | LateCheckoutPolicySettings
  | ExtendStayPolicySettings
  | RoomChangePolicySettings

export type ReservationPolicyPayload<TSettings extends Record<string, any> = Record<string, any>> = {
  name: string
  code: string
  isActive: boolean
  appliesToReservationType?: string
  appliesToBookingSource?: string
  appliesToRatePlanCode: string
  effectiveFrom: string
  effectiveTo: string | null
  priority: number
  settings: TSettings
}
