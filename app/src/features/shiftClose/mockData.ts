import type { ShiftOverview, OperationItem, PaymentOverview } from './types'
import type { FolioInvoice } from './components/OpenFoliosReviewSection'

export const MOCK_SHIFT_OVERVIEW: ShiftOverview = {
  name: 'Ahmed Hassan',
  role: 'Front Desk Cashier',
  startTime: '08:00 AM',
  endTime: '03:10 PM',
  reservations: 4,
  checkIns: 0,
  checkOuts: 0,
  revenue: 0,
}

export const MOCK_OPERATIONS: OperationItem[] = [
  {
    label: 'Check-ins processed',
    description: '0 guests checked-in today',
    status: 'success',
  },
  {
    label: 'Check-outs processed',
    description: '0 guests checked-out today',
    status: 'success',
  },
  {
    label: 'No pending room moves',
    description: 'All room assignments finalized',
    status: 'success',
  },
]

export const MOCK_PAYMENT: PaymentOverview = {
  systemTotal: 0,
  countedAmount: 0,
  balanced: true,
  methods: [
    { label: 'Cash', amount: 0 },
    { label: 'Credit Card', amount: 0 },
    { label: 'Online/OTA', amount: 0 },
    { label: 'Company', amount: 0 },
  ],
  total: 0,
}

export const MOCK_INVOICES: FolioInvoice[] = [
  { guest: 'John Smith',    room: '102', balance: 480,  daysOverdue: 28 },
  { guest: 'Michael Brown', room: '203', balance: 540,  daysOverdue: 30 },
  { guest: 'Sophie Martin', room: '304', balance: 1250, daysOverdue: 29 },
]
