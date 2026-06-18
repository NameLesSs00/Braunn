// ─── Shift Close Feature – Types ──────────────────────────────────────────────

export type ShiftOverview = {
  name: string
  role: string
  startTime: string
  endTime: string
  reservations: number
  checkIns: number
  checkOuts: number
  revenue: number
}

export type OperationItem = {
  label: string
  description: string
  status: 'success' | 'warning' | 'info'
}

export type PaymentMethod = {
  label: string
  amount: number
}

export type PaymentOverview = {
  systemTotal: number
  countedAmount: number
  balanced: boolean
  methods: PaymentMethod[]
  total: number
}
