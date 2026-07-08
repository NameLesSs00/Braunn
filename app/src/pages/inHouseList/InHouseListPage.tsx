import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  LogIn,
  MoreHorizontal,
  Search,
} from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchPmsReservations } from '../../features/pms/pmsSlice'
import { ReservationDetailsPopup } from '../reservations/pupops/ReservationDetailsPopup'
import { ExtendStayPopup } from '../reservations/pupops/ExtendStayPopup'
import { CheckInProcessPopup } from '../reservations/pupops/CheckInProcessPopup'
import { CheckOutProcessPopup } from '../reservations/checkout/CheckOutProcessPopup'
import { MoveRoomPopup } from '../reservations/pupops/MoveRoomPopup'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '-----'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase() || 'G'
}

function GuestDot({ name }: { name: string }) {
  const letter = initials(name)[0] || 'G'
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
      {letter}
    </span>
  )
}

export function InHouseListPage() {
  const dispatch = useAppDispatch()
  const inHouseReservations = useAppSelector((s) => s.pms.reservations)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [checkInFrom, setCheckInFrom] = useState(() => new Date().toISOString().split('T')[0])
  const [checkInTo, setCheckInTo] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })

  const [page, setPage] = useState(1)
  const pageSize = 8

  // Action menu state
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Popups state
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsReservationId, setDetailsReservationId] = useState<string | null>(null)

  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkInReservationId, setCheckInReservationId] = useState<string | null>(null)

  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [checkOutReservationId, setCheckOutReservationId] = useState<string | null>(null)

  const [extendStayOpen, setExtendStayOpen] = useState(false)
  const [extendStayReservationId, setExtendStayReservationId] = useState<string | null>(null)

  const [moveRoomOpen, setMoveRoomOpen] = useState(false)
  const [moveRoomReservationId, setMoveRoomReservationId] = useState<string | null>(null)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const computedDateRange = useMemo(() => ({
    startDate: checkInFrom || today,
    endDate: checkInTo || (() => {
      const d = new Date()
      d.setDate(d.getDate() + 7)
      return d.toISOString().split('T')[0]
    })(),
  }), [checkInFrom, checkInTo, today])

  useEffect(() => {
    void dispatch(fetchPmsReservations(computedDateRange))
  }, [dispatch, computedDateRange])

  useEffect(() => {
    if (!openMenuForId) return
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpenMenuForId(null)
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [openMenuForId])

  const filteredRows = useMemo(() => {
    let result = [...inHouseReservations]
    const q = query.trim().toLowerCase()

    if (q) {
      result = result.filter((r) =>
        [r.guestName, r.id, r.roomTypeName].some((v) => (v ?? '').toLowerCase().includes(q))
      )
    }

    if (statusFilter !== '') {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (roomTypeFilter !== 'all') {
      result = result.filter((r) => r.roomTypeName?.toLowerCase().includes(roomTypeFilter.toLowerCase()))
    }

    if (checkInFrom) {
      result = result.filter((r) => r.checkInDate.slice(0, 10) >= checkInFrom)
    }

    if (checkInTo) {
      result = result.filter((r) => r.checkInDate.slice(0, 10) <= checkInTo)
    }

    if (paymentStatusFilter !== 'all') {
      if (paymentStatusFilter === 'Fully paid') {
        result = result.filter((r) => r.paidAmount >= r.totalAmount)
      } else if (paymentStatusFilter === 'deposit paid') {
        result = result.filter((r) => r.paidAmount > 0 && r.paidAmount < r.totalAmount)
      }
    }

    return result
  }, [inHouseReservations, query, statusFilter, roomTypeFilter, checkInFrom, checkInTo, paymentStatusFilter])

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, roomTypeFilter, checkInFrom, checkInTo, paymentStatusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safePage])

  const checkOutReservation = useMemo(() => {
    if (!checkOutReservationId) return null
    const found = inHouseReservations.find((r) => r.id === checkOutReservationId)
    if (!found) return null

    return found as any
  }, [checkOutReservationId, inHouseReservations])

  const closeDetails = () => {
    setDetailsOpen(false)
    setDetailsReservationId(null)
  }

  const closeExtendStay = () => {
    setExtendStayOpen(false)
    setExtendStayReservationId(null)
  }

  const onOpenExtendStay = (reservationId: string) => {
    closeDetails()
    setExtendStayReservationId(reservationId)
    setExtendStayOpen(true)
  }

  const onOpenCheckIn = (reservationId: string) => {
    setCheckInReservationId(reservationId)
    setCheckInOpen(true)
  }

  const refreshInHouseReservations = () => {
    void dispatch(fetchPmsReservations(computedDateRange))
  }

  const handleExportPdf = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text('In-House Guests List', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    // Table Data
    const tableColumn = [
      'Guest Name',
      'Room',
      'Room Type',
      'Check-in',
      'Check-out',
      'Status',
      'Payment',
    ]
    const tableRows = filteredRows.map((r) => [
      r.guestName || '-----',
      r.roomNumber || '-----',
      r.roomTypeName || '-----',
      formatDateForDisplay(r.checkInDate),
      formatDateForDisplay(r.checkOutDate),
      r.status || '-----',
      r.paidAmount >= r.totalAmount ? 'Fully Paid' : 'Unpaid',
    ])

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [11, 78, 162], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 249, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    })

    doc.save(`InHouseList_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const selectClass =
    'h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10'

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[260px] flex-1">
          <input
            className="h-11 w-full rounded-full border border-slate-200 bg-[#F3F5FF] px-5 pr-11 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
            placeholder="Search by Guest Name ,Phone No,Res ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm font-semibold text-slate-700">{filteredRows.length} results</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Status</div>
          <div className="relative">
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="CheckedIn">Checked In</option>
              <option value="CheckedOut">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Room Type</div>
          <div className="relative">
            <select
              className={selectClass}
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Payment Status</div>
          <div className="relative">
            <select
              className={selectClass}
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="all">All Payment Status</option>
              <option value="deposit paid">deposit paid</option>
              <option value="Fully paid">Fully paid</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Check-in from</div>
          <div className="relative">
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={checkInFrom}
              onChange={(e) => setCheckInFrom(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Check-in To</div>
          <div className="relative">
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={checkInTo}
              onChange={(e) => setCheckInTo(e.target.value)}
            />
          </div>
        </div>

        <div className="hidden xl:block" />

        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mt-5 min-h-[430px] overflow-hidden rounded-2xl border border-slate-100 bg-white flex flex-col">
        <div className="grid grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_0.85fr_0.95fr_0.8fr_0.75fr] bg-[#EAF2FF] px-5 py-3 text-[12px] font-bold text-slate-700">
          <div>Guest</div>
          <div>Room</div>
          <div>Check-in</div>
          <div>Check-out</div>
          <div>Status</div>
          <div>Payment</div>
          <div>Source</div>
          <div className="text-right">Action</div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-700">No in-house reservations found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search.</p>
          </div>
        ) : (
          rows.map((r, idx) => {
            const paymentLabel = r.paidAmount >= r.totalAmount ? 'Fully Paid' : 'Unpaid'
            const isCheckInToday = r.checkInDate.startsWith(today)
            const isCheckOutToday = r.checkOutDate.startsWith(today)

            return (
              <div
                key={`${r.id}-${idx}`}
                className={[
                  'grid grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_0.85fr_0.95fr_0.8fr_0.75fr] items-center px-5 py-3 text-[13px]',
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
                ].join(' ')}
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="truncate">{r.guestName || '-----'}</span>
                  <GuestDot name={r.guestName || 'G'} />
                </div>
                <div className="text-slate-600">
                  <div className="font-medium text-slate-700">{r.roomNumber || '-----'}</div>
                  <div className="text-[11px] text-slate-500">{r.roomTypeName || '-----'}</div>
                </div>
                <div className="text-slate-600">{formatDateForDisplay(r.checkInDate)}</div>
                <div className="text-slate-600">{formatDateForDisplay(r.checkOutDate)}</div>
                <div className="text-slate-600">{r.status || '-----'}</div>
                <div className="text-slate-600">{paymentLabel}</div>
                <div className="text-slate-600">-----</div>
                <div className="flex justify-end gap-2">
                  {isCheckInToday && r.status !== 'CheckedIn' && r.status !== 'CheckedOut' ? (
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-emerald-700 px-3 text-[12px] font-semibold leading-none text-white"
                      onClick={() => onOpenCheckIn(r.id)}
                    >
                      <LogIn className="h-4 w-4" />
                      check in
                    </button>
                  ) : isCheckOutToday && r.status === 'CheckedIn' ? (
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-rose-600 px-3 text-[12px] font-semibold leading-none text-white"
                      onClick={() => {
                        setCheckOutReservationId(r.id)
                        setCheckOutOpen(true)
                      }}
                    >
                      check out
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex h-7 items-center justify-center rounded-lg bg-[#0B4EA2] px-4 text-white transition-colors hover:bg-[#0a3f85]"
                      aria-label="View"
                      onClick={() => {
                        setDetailsReservationId(r.id)
                        setDetailsOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <div className="relative">
                    <button
                      type="button"
                      className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                      aria-label="More"
                      onClick={() => setOpenMenuForId((prev) => (prev === r.id ? null : r.id))}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenuForId === r.id ? (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-9 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                          onClick={() => setOpenMenuForId(null)}
                        >
                          Cancel Reservation
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                          onClick={() => setOpenMenuForId(null)}
                        >
                          Early Check out
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setOpenMenuForId(null)
                            setMoveRoomReservationId(r.id)
                            setMoveRoomOpen(true)
                          }}
                        >
                          Move Room
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-5 flex items-center justify-end gap-3 pb-5">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold',
              safePage === p ? 'bg-[#0B4EA2] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
            ].join(' ')}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <ReservationDetailsPopup
        open={detailsOpen}
        onClose={closeDetails}
        reservationId={detailsReservationId}
        onOpenExtendStay={onOpenExtendStay}
        onPaymentSuccess={refreshInHouseReservations}
      />

      <ExtendStayPopup
        open={extendStayOpen}
        onClose={closeExtendStay}
        reservationId={extendStayReservationId}
      />

      <MoveRoomPopup
        open={moveRoomOpen}
        onClose={() => {
          setMoveRoomOpen(false)
          setMoveRoomReservationId(null)
        }}
        reservationId={moveRoomReservationId}
      />

      <CheckInProcessPopup
        open={checkInOpen}
        onClose={() => {
          setCheckInOpen(false)
          setCheckInReservationId(null)
        }}
        reservationId={checkInReservationId}
      />

      <CheckOutProcessPopup
        open={checkOutOpen}
        onClose={() => {
          setCheckOutOpen(false)
          setCheckOutReservationId(null)
        }}
        reservation={checkOutReservation}
        onSuccess={refreshInHouseReservations}
      />
    </div>
  )
}
