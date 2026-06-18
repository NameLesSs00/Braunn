import { useMemo, useState, useEffect } from 'react'
import { Printer, X, ChevronDown, Calendar as CalendarIcon } from 'lucide-react'

type SourceTab = 'All' | 'Phone' | 'Website' | 'Walk-in' | 'OTA' | 'Corporate'

type ReservationRow = {
  id: string
  guestName: string
  roomType: string
  checkIn: string
  checkOut: string
  nights: number
  rate: string
  total: string
  source: Exclude<SourceTab, 'All'>
  status: 'Confirmed' | 'Cancelled' | 'Pending'
}

const tabs: SourceTab[] = ['All', 'Phone', 'Website', 'Walk-in', 'OTA', 'Corporate']

const mockRows: ReservationRow[] = [
  { id: 'RSV-10421', guestName: 'John Smith', roomType: 'Deluxe Suite', checkIn: 'Dec 12', checkOut: 'Dec 15', nights: 3, rate: '€220', total: '€660', source: 'Website', status: 'Confirmed' },
  { id: 'RSV-10422', guestName: 'Maria Garcia', roomType: 'Standard', checkIn: 'Dec 10', checkOut: 'Dec 12', nights: 2, rate: '€180', total: '€360', source: 'Corporate', status: 'Confirmed' },
  { id: 'RSV-10423', guestName: 'Ahmed Ali', roomType: 'Deluxe', checkIn: 'Dec 18', checkOut: 'Dec 19', nights: 1, rate: '€160', total: '€160', source: 'Phone', status: 'Pending' },
  { id: 'RSV-10424', guestName: 'Olivia Brown', roomType: 'Suite', checkIn: 'Dec 20', checkOut: 'Dec 23', nights: 3, rate: '€240', total: '€720', source: 'OTA', status: 'Confirmed' },
  { id: 'RSV-10425', guestName: 'Liam Wilson', roomType: 'Standard', checkIn: 'Dec 05', checkOut: 'Dec 06', nights: 1, rate: '€120', total: '€120', source: 'Walk-in', status: 'Cancelled' },
  { id: 'RSV-10426', guestName: 'Sophia Chen', roomType: 'Deluxe', checkIn: 'Dec 14', checkOut: 'Dec 16', nights: 2, rate: '€160', total: '€320', source: 'Website', status: 'Confirmed' },
  { id: 'RSV-10427', guestName: 'Noah Müller', roomType: 'Standard', checkIn: 'Dec 15', checkOut: 'Dec 17', nights: 2, rate: '€120', total: '€240', source: 'Phone', status: 'Confirmed' },
  { id: 'RSV-10428', guestName: 'Emma Jones', roomType: 'Suite', checkIn: 'Dec 16', checkOut: 'Dec 20', nights: 4, rate: '€240', total: '€960', source: 'OTA', status: 'Pending' },
  { id: 'RSV-10429', guestName: 'Jackson Lee', roomType: 'Deluxe Suite', checkIn: 'Dec 18', checkOut: 'Dec 21', nights: 3, rate: '€220', total: '€660', source: 'Corporate', status: 'Confirmed' },
  { id: 'RSV-10430', guestName: 'Isabella Rossi', roomType: 'Standard', checkIn: 'Dec 20', checkOut: 'Dec 21', nights: 1, rate: '€120', total: '€120', source: 'Walk-in', status: 'Confirmed' },
  { id: 'RSV-10431', guestName: 'Lucas Dubois', roomType: 'Deluxe', checkIn: 'Dec 22', checkOut: 'Dec 25', nights: 3, rate: '€160', total: '€480', source: 'Website', status: 'Confirmed' },
  { id: 'RSV-10432', guestName: 'Mia Tanaka', roomType: 'Standard', checkIn: 'Dec 24', checkOut: 'Dec 26', nights: 2, rate: '€120', total: '€240', source: 'Phone', status: 'Pending' },
  { id: 'RSV-10433', guestName: 'Ethan Wright', roomType: 'Suite', checkIn: 'Dec 25', checkOut: 'Dec 28', nights: 3, rate: '€240', total: '€720', source: 'OTA', status: 'Confirmed' },
  { id: 'RSV-10434', guestName: 'Ava Martinez', roomType: 'Deluxe Suite', checkIn: 'Dec 26', checkOut: 'Dec 30', nights: 4, rate: '€220', total: '€880', source: 'Corporate', status: 'Cancelled' },
  { id: 'RSV-10435', guestName: 'James Bond', roomType: 'Standard', checkIn: 'Dec 28', checkOut: 'Jan 02', nights: 5, rate: '€120', total: '€600', source: 'Website', status: 'Confirmed' },
  { id: 'RSV-10436', guestName: 'Charlotte King', roomType: 'Deluxe', checkIn: 'Dec 01', checkOut: 'Dec 04', nights: 3, rate: '€160', total: '€480', source: 'Phone', status: 'Confirmed' },
  { id: 'RSV-10437', guestName: 'Benjamin Scott', roomType: 'Standard', checkIn: 'Dec 03', checkOut: 'Dec 05', nights: 2, rate: '€120', total: '€240', source: 'OTA', status: 'Confirmed' },
  { id: 'RSV-10438', guestName: 'Amelia Young', roomType: 'Suite', checkIn: 'Dec 05', checkOut: 'Dec 08', nights: 3, rate: '€240', total: '€720', source: 'Corporate', status: 'Pending' },
  { id: 'RSV-10439', guestName: 'Alexander Hall', roomType: 'Deluxe Suite', checkIn: 'Dec 07', checkOut: 'Dec 09', nights: 2, rate: '€220', total: '€440', source: 'Website', status: 'Confirmed' },
  { id: 'RSV-10440', guestName: 'Harper Allen', roomType: 'Standard', checkIn: 'Dec 09', checkOut: 'Dec 10', nights: 1, rate: '€120', total: '€120', source: 'Walk-in', status: 'Confirmed' },
  { id: 'RSV-10441', guestName: 'Daniel Hernandez', roomType: 'Deluxe', checkIn: 'Dec 11', checkOut: 'Dec 14', nights: 3, rate: '€160', total: '€480', source: 'Phone', status: 'Confirmed' },
  { id: 'RSV-10442', guestName: 'Evelyn Lopez', roomType: 'Standard', checkIn: 'Dec 12', checkOut: 'Dec 15', nights: 3, rate: '€120', total: '€360', source: 'OTA', status: 'Cancelled' },
  { id: 'RSV-10443', guestName: 'Matthew Perez', roomType: 'Suite', checkIn: 'Dec 14', checkOut: 'Dec 17', nights: 3, rate: '€240', total: '€720', source: 'Corporate', status: 'Confirmed' },
  { id: 'RSV-10444', guestName: 'Elizabeth Green', roomType: 'Deluxe Suite', checkIn: 'Dec 15', checkOut: 'Dec 18', nights: 3, rate: '€220', total: '€660', source: 'Website', status: 'Confirmed' },
  { id: 'RSV-10445', guestName: 'David Taylor', roomType: 'Standard', checkIn: 'Dec 17', checkOut: 'Dec 19', nights: 2, rate: '€120', total: '€240', source: 'Walk-in', status: 'Pending' },
  { id: 'RSV-10446', guestName: 'Joseph Moore', roomType: 'Deluxe', checkIn: 'Dec 19', checkOut: 'Dec 22', nights: 3, rate: '€160', total: '€480', source: 'Phone', status: 'Confirmed' },
  { id: 'RSV-10447', guestName: 'Susan Clark', roomType: 'Standard', checkIn: 'Dec 20', checkOut: 'Dec 23', nights: 3, rate: '€120', total: '€360', source: 'OTA', status: 'Confirmed' },
  { id: 'RSV-10448', guestName: 'Charles Lewis', roomType: 'Suite', checkIn: 'Dec 22', checkOut: 'Dec 25', nights: 3, rate: '€240', total: '€720', source: 'Corporate', status: 'Confirmed' },
  { id: 'RSV-10449', guestName: 'Margaret Lee', roomType: 'Deluxe Suite', checkIn: 'Dec 23', checkOut: 'Dec 26', nights: 3, rate: '€220', total: '€660', source: 'Website', status: 'Confirmed' },
  { id: 'RSV-10450', guestName: 'Christopher Hill', roomType: 'Standard', checkIn: 'Dec 25', checkOut: 'Dec 27', nights: 2, rate: '€120', total: '€240', source: 'Walk-in', status: 'Cancelled' },
]

function eurToNumber(value: string) {
  const cleaned = value.replace(/[^\d.,-]/g, '').replace(/,/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

function formatEur(n: number) {
  return `€${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export function RevenueSourceDetailsPopup({
  isOpen,
  onClose,
  title = 'Revenue Source Details',
  subtitle = 'Direct Bookings – December 2025',
  initialTab = 'All',
  allowedTabs,
}: {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  initialTab?: SourceTab
  allowedTabs?: SourceTab[]
}) {
  const [activeTab, setActiveTab] = useState<SourceTab>(initialTab)
  const [search, setSearch] = useState('')
  const [roomType, setRoomType] = useState('All Types')
  const [status, setStatus] = useState('All status')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  const visibleTabs = useMemo(() => {
    if (!allowedTabs) return tabs
    return tabs.filter((t) => allowedTabs.includes(t))
  }, [allowedTabs])

  const filteredRows = useMemo(() => {
    let rows = mockRows
    if (activeTab !== 'All') rows = rows.filter((r) => r.source === activeTab)

    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter((r) => r.guestName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    }

    if (roomType !== 'All Types') rows = rows.filter((r) => r.roomType === roomType)
    if (status !== 'All status') rows = rows.filter((r) => r.status === status)

    if (dateFrom || dateTo) {
      const fromTime = dateFrom ? new Date(dateFrom).getTime() : -Infinity
      const toTime = dateTo ? new Date(dateTo).getTime() : Infinity

      rows = rows.filter((r) => {
        // Mock data uses "Dec 12" format. Convert to comparable timestamp.
        const rowTime = new Date(`${r.checkIn}, ${new Date().getFullYear()}`).getTime()
        return rowTime >= fromTime && rowTime <= toTime
      })
    }

    return rows
  }, [activeTab, roomType, search, status, dateFrom, dateTo])

  const totals = useMemo(() => {
    const totalRevenue = filteredRows.reduce((sum, r) => sum + eurToNumber(r.total), 0)
    const nights = filteredRows.reduce((sum, r) => sum + r.nights, 0)
    const reservations = filteredRows.length
    const avgRate = nights > 0 ? Math.round(totalRevenue / nights) : 0
    return { totalRevenue, nights, reservations, avgRate }
  }, [filteredRows])

  const allRoomTypes = useMemo(() => {
    const set = new Set(mockRows.map((r) => r.roomType))
    return ['All Types', ...Array.from(set)]
  }, [])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-[#004bb4] px-6 py-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                <div className="mt-0.5 text-xs text-blue-100">{subtitle}</div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-white/90 hover:bg-white/10"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-6 pb-6">
            {/* Summary cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[11px] font-medium text-slate-500">Total Reservations</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{totals.reservations}</div>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                <div className="text-[11px] font-medium text-slate-500">Total Revenue</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{formatEur(totals.totalRevenue)}</div>
              </div>
              <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                <div className="text-[11px] font-medium text-slate-500">Average Rate</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{formatEur(totals.avgRate)}</div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="text-[11px] font-medium text-slate-500">Total Nights</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{totals.nights}</div>
              </div>
            </div>

            {/* Tabs + print */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-6">
                {visibleTabs.map((t) => {
                  const active = t === activeTab
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActiveTab(t)}
                      className={[
                        'text-sm font-medium transition-colors',
                        active ? 'text-[#004bb4] underline underline-offset-[10px] decoration-2' : 'text-slate-500 hover:text-slate-700',
                      ].join(' ')}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[#004bb4] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Printer className="h-4 w-4" />
                Print Report
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex w-full max-w-[200px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-400 text-sm">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <span className="text-slate-500 font-medium">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent outline-none text-slate-600"
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <span className="text-slate-500 font-medium">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent outline-none text-slate-600"
                />
              </div>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <span className="text-slate-500 font-medium">Room Type</span>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="bg-transparent text-sm outline-none text-slate-600"
                >
                  {allRoomTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <span className="text-slate-500 font-medium">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-transparent text-sm outline-none text-slate-600"
                >
                  {['All status', 'Confirmed', 'Pending', 'Cancelled'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </label>
            </div>

            {/* Info row */}
            <div className="mt-4 flex items-center justify-between gap-4 text-xs text-slate-500">
              <div>Showing {filteredRows.length} reservations</div>
              <div className="font-semibold text-slate-700">Total Revenue: {formatEur(totals.totalRevenue)}</div>
            </div>

            {/* Table */}
            {/* Table */}
            <div className="mt-4 rounded-xl border border-slate-100">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-20 bg-slate-50 text-xs font-semibold text-slate-600 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                    <tr>
                      <th className="bg-slate-50 px-4 py-3">Reservation ID</th>
                      <th className="bg-slate-50 px-4 py-3">Guest Name</th>
                      <th className="bg-slate-50 px-4 py-3">Room Type</th>
                      <th className="bg-slate-50 px-4 py-3">Check-in</th>
                      <th className="bg-slate-50 px-4 py-3">Check-out</th>
                      <th className="bg-slate-50 px-4 py-3">Nights</th>
                      <th className="bg-slate-50 px-4 py-3">Rate</th>
                      <th className="bg-slate-50 px-4 py-3">Total</th>
                      <th className="bg-slate-50 px-4 py-3">Source</th>
                      <th className="bg-slate-50 px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-14 text-center text-sm text-slate-500">
                          No reservations found matching your filters
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3">
                            <button type="button" className="text-[#004bb4] hover:underline">
                              {r.id.replace('RSV-', 'RSV-\\n')}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{r.guestName}</td>
                          <td className="px-4 py-3 text-slate-700">{r.roomType}</td>
                          <td className="px-4 py-3 text-slate-600">{r.checkIn}</td>
                          <td className="px-4 py-3 text-slate-600">{r.checkOut}</td>
                          <td className="px-4 py-3 text-slate-700">{r.nights}</td>
                          <td className="px-4 py-3 text-slate-700">{r.rate}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{r.total}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {r.source}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={[
                                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                                r.status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : r.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-800',
                              ].join(' ')}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      
    </>
  )
}

