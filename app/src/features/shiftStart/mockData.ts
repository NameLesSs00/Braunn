import type { ShiftOption, ShiftStartInfo } from './types'

export const MOCK_SHIFT_OPTIONS: ShiftOption[] = [
  { id: 'morning', label: 'Morning Shift', timeRange: '08:00 AM - 04:00 PM' },
  { id: 'evening', label: 'Evening Shift', timeRange: '04:00 PM - 12:00 AM' },
  { id: 'night',   label: 'Night Shift',   timeRange: '12:00 AM - 08:00 AM' },
]

export const MOCK_SHIFT_START_INFO: ShiftStartInfo = {
  name: 'Ahmed Hassan',
  role: 'Front Desk Cashier',
  shiftType: 'Morning',
  startTime: '08:00 AM',
  openingBalance: 500,
}
