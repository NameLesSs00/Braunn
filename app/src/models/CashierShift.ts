// ─── Cashier Shift ────────────────────────────────────────────────────────────

export type ShiftType = 'Morning' | 'Evening' | 'Night'
export type ShiftStatus = 'Open' | 'Closed'

export interface CashierShift {
  id: string
  cashierUserId: string
  shiftType: ShiftType
  openedAtUtc: string
  businessDate: string
  closedAtUtc: string | null
  plannedStartTime: string
  plannedEndTime: string
  openingCashAmount: number
  expectedCashAmount: number
  actualCashAmount: number | null
  differenceAmount: number
  status: ShiftStatus
  notes: string | null
}

export interface OpenShiftPayload {
  shiftType: ShiftType
  plannedStartTime: string
  plannedEndTime: string
  openingCashAmount: number
  notes?: string
}

export interface CloseShiftPayload {
  actualCashAmount: number
  notes?: string
}
