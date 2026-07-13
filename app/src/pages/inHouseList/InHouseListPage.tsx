import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { getPmsReservations } from '../../shared/apis/PmsReservation'
import { fetchInHouseListReservations } from '../../features/pms/pmsSlice'
import type { PmsReservation } from '../../models/PmsReservation'
import { ReservationDetailsPopup } from '../reservations/pupops/ReservationDetailsPopup'
import { ExtendStayPopup } from '../reservations/pupops/ExtendStayPopup'
import { CheckInProcessPopup } from '../reservations/pupops/CheckInProcessPopup'
import { MoveRoomPopup } from '../reservations/pupops/MoveRoomPopup'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ExportInHouseListPopup } from './ExportInHouseListPopup'

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '-----'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
  }
}

const inHouseFiltersStorageKey = 'in-house-list-page-filters'

interface InHouseFilters {
  query: string
  statusFilter: string
  roomTypeFilter: string
  paymentStatusFilter: string
  checkInFrom: string
  checkInTo: string
}

function getSavedInHouseFilters(defaults: InHouseFilters): InHouseFilters {
  try {
    const saved = sessionStorage.getItem(inHouseFiltersStorageKey)
    if (!saved) return defaults

    const filters = { ...defaults, ...JSON.parse(saved) }
    if (filters.statusFilter === 'CheckedOut' || filters.statusFilter === 'Cancelled') {
      filters.statusFilter = ''
    }
    return filters
  } catch {
    return defaults
  }
}

function isCurrentInHouseReservation(reservation: PmsReservation) {
  const status = (reservation.status ?? '').replace(/[\s_-]/g, '').toLowerCase()
  return status !== 'checkedout' && status !== 'cancelled' && status !== 'canceled'
}

function getVisiblePageNumbers(page: number, pages: number) {
  const visible = new Set<number>([1, pages, page - 1, page, page + 1])
  if (page <= 3) {
    visible.add(2)
    visible.add(3)
    visible.add(4)
  }
  if (page >= pages - 2) {
    visible.add(pages - 3)
    visible.add(pages - 2)
    visible.add(pages - 1)
  }
  return Array.from(visible)
    .filter((p) => p >= 1 && p <= pages)
    .sort((a, b) => a - b)
}

export function InHouseListPage() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const inHouseReservations = useAppSelector((s) => s.pms.inHouseListRows)
  const inHouseLoading = useAppSelector((s) => s.pms.inHouseListStatus === 'loading')
  const monthRange = useMemo(() => getCurrentMonthRange(), [])
  const shouldUseMonthRange = searchParams.get('range') === 'month'
  const initialFilters = useMemo(() => {
    const defaultStartDate = shouldUseMonthRange ? monthRange.startDate : formatDateInput(new Date())
    const defaultEndDate = shouldUseMonthRange
      ? monthRange.endDate
      : formatDateInput(new Date(new Date().setDate(new Date().getDate() + 7)))

    return getSavedInHouseFilters({
      query: '',
      statusFilter: '',
      roomTypeFilter: 'all',
      paymentStatusFilter: 'all',
      checkInFrom: defaultStartDate,
      checkInTo: defaultEndDate,
    })
  }, [monthRange.endDate, monthRange.startDate, shouldUseMonthRange])

  const [query, setQuery] = useState(initialFilters.query)
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter)
  const [roomTypeFilter, setRoomTypeFilter] = useState(initialFilters.roomTypeFilter)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(initialFilters.paymentStatusFilter)
  const [checkInFrom, setCheckInFrom] = useState(initialFilters.checkInFrom)
  const [checkInTo, setCheckInTo] = useState(initialFilters.checkInTo)

  const [page, setPage] = useState(1)
  const pageSize = 15

  // Action menu state
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Popups state
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsReservationId, setDetailsReservationId] = useState<string | null>(null)

  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkInReservationId, setCheckInReservationId] = useState<string | null>(null)

  const [extendStayOpen, setExtendStayOpen] = useState(false)
  const [extendStayReservationId, setExtendStayReservationId] = useState<string | null>(null)

  const [moveRoomOpen, setMoveRoomOpen] = useState(false)
  const [moveRoomReservationId, setMoveRoomReservationId] = useState<string | null>(null)
  const [exportOpen, setExportOpen] = useState(false)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    const filters: InHouseFilters = {
      query,
      statusFilter,
      roomTypeFilter,
      paymentStatusFilter,
      checkInFrom,
      checkInTo,
    }

    sessionStorage.setItem(inHouseFiltersStorageKey, JSON.stringify(filters))
  }, [query, statusFilter, roomTypeFilter, paymentStatusFilter, checkInFrom, checkInTo])

  const computedDateRange = useMemo(() => ({
    startDate: checkInFrom || today,
    endDate: checkInTo || (() => {
      const d = new Date()
      d.setDate(d.getDate() + 7)
      return d.toISOString().split('T')[0]
    })(),
  }), [checkInFrom, checkInTo, today])

  useEffect(() => {
    const request = dispatch(fetchInHouseListReservations(computedDateRange))
    return () => request.abort()
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
    let result = inHouseReservations.filter(isCurrentInHouseReservation)
    const q = query.trim().toLowerCase()

    if (q) {
      result = result.filter((r) =>
        [r.guestName, r.bookingReference, r.id, r.roomNumber, r.roomTypeName, r.channelName, r.bookingSource]
          .some((v) => (v ?? '').toLowerCase().includes(q))
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
    void dispatch(fetchInHouseListReservations(computedDateRange))
  }

  const handleExportPdf = (exportRows: PmsReservation[], from: string, to: string) => {
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
      'Source',
    ]
    const tableRows = exportRows.map((r) => [
      `${r.guestName || '-----'}\n${r.bookingReference || r.id || '-----'}`,
      r.roomNumber || '-----',
      r.roomTypeName || '-----',
      formatDateForDisplay(r.checkInDate),
      formatDateForDisplay(r.checkOutDate),
      r.status || '-----',
      r.paidAmount >= r.totalAmount ? 'Fully Paid' : 'Unpaid',
      r.channelName || r.bookingSource || '-----',
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

    doc.save(`InHouseList_${from}_to_${to}.pdf`)
  }

  const exportInHouseList = async (from: string, to: string) => {
    const exportRows = await getPmsReservations({ startDate: from, endDate: to })
    handleExportPdf(exportRows.filter(isCurrentInHouseReservation), from, to)
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

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
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
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setExportOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
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

        {inHouseLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
            <p className="mt-3 text-sm font-medium text-slate-500">Loading in-house reservations...</p>
          </div>
        ) : rows.length === 0 ? (
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
            const normalizedStatus = (r.status || '').replace(/[\s_-]/g, '').toLowerCase()
            const canExtendStay = normalizedStatus !== 'checkedout' && normalizedStatus !== 'cancelled' && normalizedStatus !== 'canceled'
            return (
              <div
                key={`${r.id}-${idx}`}
                className={[
                  'grid grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_0.85fr_0.95fr_0.8fr_0.75fr] items-center px-5 py-3 text-[13px]',
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
                ].join(' ')}
              >
                <div className="min-w-0 leading-tight text-slate-700">
                  <div className="truncate font-medium">{r.guestName || '-----'}</div>
                  <div className="truncate text-[11px] text-slate-500" title={r.bookingReference || r.id}>
                    {r.bookingReference || r.id || '-----'}
                  </div>
                </div>
                <div className="text-slate-600">
                  <div className="font-medium text-slate-700">{r.roomNumber || '-----'}</div>
                  <div className="text-[11px] text-slate-500">{r.roomTypeName || '-----'}</div>
                </div>
                <div className="text-slate-600">{formatDateForDisplay(r.checkInDate)}</div>
                <div className="text-slate-600">{formatDateForDisplay(r.checkOutDate)}</div>
                <div className="text-slate-600">{r.status || '-----'}</div>
                <div className="text-slate-600">{paymentLabel}</div>
                <div className="truncate text-slate-600" title={r.channelName || r.bookingSource || undefined}>
                  {r.channelName || r.bookingSource || '-----'}
                </div>
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
                          onClick={() => {
                            setOpenMenuForId(null)
                            setMoveRoomReservationId(r.id)
                            setMoveRoomOpen(true)
                          }}
                        >
                          Move Room
                        </button>
                        {canExtendStay ? (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                              setOpenMenuForId(null)
                              onOpenExtendStay(r.id)
                            }}
                          >
                            Extend Stay
                          </button>
                        ) : null}
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

        {getVisiblePageNumbers(safePage, totalPages).map((p) => (
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
        reservationStatus={inHouseReservations.find((reservation) => reservation.id === detailsReservationId)?.status}
        onOpenExtendStay={onOpenExtendStay}
        onPaymentSuccess={refreshInHouseReservations}
      />

      <ExtendStayPopup
        open={extendStayOpen}
        onClose={closeExtendStay}
        reservationId={extendStayReservationId}
        onSuccess={refreshInHouseReservations}
      />

      <MoveRoomPopup
        open={moveRoomOpen}
        onClose={() => {
          setMoveRoomOpen(false)
          setMoveRoomReservationId(null)
        }}
        reservationId={moveRoomReservationId}
        onSuccess={refreshInHouseReservations}
      />

      <CheckInProcessPopup
        open={checkInOpen}
        onClose={() => {
          setCheckInOpen(false)
          setCheckInReservationId(null)
        }}
        reservationId={checkInReservationId}
      />

      <ExportInHouseListPopup
        open={exportOpen}
        initialFrom={checkInFrom}
        initialTo={checkInTo}
        onClose={() => setExportOpen(false)}
        onExport={exportInHouseList}
      />
    </div>
  )
}
