// ─── Shift Start Feature – Types ──────────────────────────────────────────────

export type ShiftStartInfo = {
  name: string
  role: string
  shiftType: 'Morning' | 'Evening' | 'Night'
  startTime: string
  openingBalance: number
}

export type ShiftOption = {
  id: string
  label: string
  timeRange: string
}
