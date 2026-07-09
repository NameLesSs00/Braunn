import { useEffect, useMemo, useRef, useState } from 'react'

import { ChevronLeft, ChevronRight, Eye, LogIn, MoreHorizontal, Download } from 'lucide-react'
import { IoSearchSharp } from "react-icons/io5";

import { IconImage } from '../../shared/ui/IconImage'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { getPmsReservations } from '../../shared/apis/PmsReservation'
import { fetchReservationsTable } from '../../features/pms/pmsSlice'
import type { PmsReservation } from '../../models/PmsReservation'
import { ReservationDetailsPopup } from './pupops/ReservationDetailsPopup'
import { ExtendStayPopup } from './pupops/ExtendStayPopup'
import { CheckInProcessPopup } from './pupops/CheckInProcessPopup'
import { CheckOutProcessPopup } from './checkout/CheckOutProcessPopup'
import { OtaReservationModal } from '../../widgets/reservations/OtaReservationModal/OtaReservationModal'
import { MoveRoomPopup } from './pupops/MoveRoomPopup'
import { ExportInHouseListPopup } from '../inHouseList/ExportInHouseListPopup'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const getLocalYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const today = getLocalYYYYMMDD()
const lastDayOfMonth = getLocalYYYYMMDD(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))

interface ReservationsFilters {
  query: string
  statusFilter: string
  roomTypeFilter: string
  paymentStatusFilter: string
  checkInFrom: string
  checkInTo: string
}

let reservationsFiltersCache: ReservationsFilters | null = null

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        onClick={() => onChange(Math.max(1, page - 1))}
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          className={[
            'grid h-9 w-9 place-items-center rounded-full text-sm font-semibold',
            p === page ? 'bg-[#0B4EA2] text-white' : 'bg-white text-slate-500 hover:bg-slate-50',
          ].join(' ')}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        onClick={() => onChange(Math.min(pages, page + 1))}
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ReservationsPage() {
  const dispatch = useAppDispatch()
  const pmsReservations = useAppSelector((s) => s.pms.reservationsTableRows)
  const reservationsLoading = useAppSelector((s) => s.pms.reservationsTableStatus === 'loading')
  const initialFilters = useMemo<ReservationsFilters>(() => reservationsFiltersCache ?? {
    query: '',
    statusFilter: '',
    roomTypeFilter: 'all',
    paymentStatusFilter: 'all',
    checkInFrom: today,
    checkInTo: lastDayOfMonth,
  }, [])

  const [checkInFrom, setCheckInFrom] = useState(initialFilters.checkInFrom)
  const [checkInTo, setCheckInTo] = useState(initialFilters.checkInTo)

  useEffect(() => {
    const request = dispatch(fetchReservationsTable({ startDate: checkInFrom, endDate: checkInTo }))
    return () => request.abort()
  }, [dispatch, checkInFrom, checkInTo])

  const [query, setQuery] = useState(initialFilters.query)
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

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

  const [statusFilter, setStatusFilter] = useState<string>(initialFilters.statusFilter)
  const [roomTypeFilter, setRoomTypeFilter] = useState(initialFilters.roomTypeFilter)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(initialFilters.paymentStatusFilter)

  const [otaOpen, setOtaOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 6

  useEffect(() => {
    reservationsFiltersCache = {
      query,
      statusFilter,
      roomTypeFilter,
      paymentStatusFilter,
      checkInFrom,
      checkInTo,
    }
  }, [query, statusFilter, roomTypeFilter, paymentStatusFilter, checkInFrom, checkInTo])

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
    const q = query.trim().toLowerCase()
    let result = [...pmsReservations]

    if (q) {
      result = result.filter((r) => [r.guestName, r.id, r.roomTypeName].some((v) => (v ?? '').toLowerCase().includes(q)))
    }

    if (statusFilter !== '') {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (roomTypeFilter !== 'all') {
      result = result.filter((r) => r.roomTypeName?.toLowerCase().includes(roomTypeFilter.toLowerCase()))
    }

    if (paymentStatusFilter !== 'all') {
      if (paymentStatusFilter === 'Fully paid') {
        result = result.filter((r) => r.paidAmount >= r.totalAmount)
      } else if (paymentStatusFilter === 'deposit paid') {
        result = result.filter((r) => r.paidAmount > 0 && r.paidAmount < r.totalAmount)
      }
    }

    return result
  }, [pmsReservations, query, statusFilter, roomTypeFilter, paymentStatusFilter])

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, roomTypeFilter, paymentStatusFilter, checkInFrom, checkInTo])

  const pages = Math.max(1, Math.ceil(filteredRows.length / perPage))
  const safePage = Math.min(page, pages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * perPage
    return filteredRows.slice(start, start + perPage)
  }, [filteredRows, safePage])

  const checkOutReservation = useMemo(() => {
    if (!checkOutReservationId) return null
    return pmsReservations.find((r) => r.id === checkOutReservationId) || null
  }, [checkOutReservationId, pmsReservations])

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

  const refreshReservations = () => {
    void dispatch(fetchReservationsTable({ startDate: checkInFrom, endDate: checkInTo }))
  }

  const exportReservations = async (from: string, to: string) => {
    let exportRows = await getPmsReservations({ startDate: from, endDate: to })
    const normalizedQuery = query.trim().toLowerCase()

    if (normalizedQuery) {
      exportRows = exportRows.filter((reservation) =>
        [reservation.guestName, reservation.id, reservation.roomTypeName]
          .some((value) => (value ?? '').toLowerCase().includes(normalizedQuery))
      )
    }
    if (statusFilter) {
      exportRows = exportRows.filter((reservation) => reservation.status === statusFilter)
    }
    if (roomTypeFilter !== 'all') {
      exportRows = exportRows.filter((reservation) =>
        reservation.roomTypeName?.toLowerCase().includes(roomTypeFilter.toLowerCase())
      )
    }
    if (paymentStatusFilter === 'Fully paid') {
      exportRows = exportRows.filter((reservation) => reservation.paidAmount >= reservation.totalAmount)
    } else if (paymentStatusFilter === 'deposit paid') {
      exportRows = exportRows.filter((reservation) =>
        reservation.paidAmount > 0 && reservation.paidAmount < reservation.totalAmount
      )
    }

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Reservations List', 14, 20)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Date range: ${from} to ${to}`, 14, 29)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36)

    autoTable(doc, {
      startY: 44,
      head: [[
        'Guest',
        'Room',
        'Room Type',
        'Check-in',
        'Check-out',
        'Status',
        'Payment',
        'Source',
      ]],
      body: exportRows.map((reservation) => [
        reservation.guestName || '-----',
        reservation.roomNumber || '-----',
        reservation.roomTypeName || '-----',
        formatDateForDisplay(reservation.checkInDate),
        formatDateForDisplay(reservation.checkOutDate),
        reservation.status || '-----',
        reservation.paidAmount >= reservation.totalAmount
          ? 'Fully Paid'
          : reservation.paidAmount > 0
            ? 'Deposit Paid'
            : 'Unpaid',
        reservation.channelName || reservation.bookingSource || '-----',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [11, 78, 162], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [244, 249, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    })

    doc.save(`Reservations_${from}_to_${to}.pdf`)
  }

  return (
    <div className="space-y-6">
      <ReservationDetailsPopup
        open={detailsOpen}
        onClose={closeDetails}
        reservationId={detailsReservationId}
        reservationStatus={pmsReservations.find((reservation) => reservation.id === detailsReservationId)?.status}
        onOpenExtendStay={onOpenExtendStay}
        onPaymentSuccess={refreshReservations}
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
        onSuccess={() => {
          void dispatch(fetchReservationsTable({ startDate: checkInFrom, endDate: checkInTo }))
        }}
      />

      <CheckOutProcessPopup
        open={checkOutOpen}
        onClose={() => {
          setCheckOutOpen(false)
          setCheckOutReservationId(null)
        }}
        reservation={checkOutReservation}
        onSuccess={refreshReservations}
      />

      <OtaReservationModal open={otaOpen} onClose={() => setOtaOpen(false)} />

      <ExportInHouseListPopup
        open={exportOpen}
        initialFrom={checkInFrom}
        initialTo={checkInTo}
        onClose={() => setExportOpen(false)}
        onExport={exportReservations}
        title="Export Reservations List"
        subject="reservations list"
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-2xl">
            <input
              className="h-11 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search by Guest Name ,ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 opacity-70">
              <IconImage src={IoSearchSharp} alt="Search" className="h-4 w-4" />
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-600">{filteredRows.length} results</div>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</div>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="CheckedIn">Checked In</option>
              <option value="CheckedOut">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex-1 min-w-[120px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Room Type</div>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div className="flex-1 min-w-[120px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment</div>
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="all">All Payment Status</option>
              <option value="deposit paid">deposit paid</option>
              <option value="Fully paid">Fully paid</option>
            </select>
          </div>

          <div className="flex-1 min-w-[130px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-in From</div>
            <div className="relative">
              <input
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none placeholder:text-slate-400"
                placeholder="YYYY-MM-DD"
                type="date"
                value={checkInFrom}
                onChange={(e) => setCheckInFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[130px] space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Check-in To</div>
            <div className="relative">
              <input
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-600 outline-none placeholder:text-slate-400"
                placeholder="YYYY-MM-DD"
                type="date"
                value={checkInTo}
                onChange={(e) => setCheckInTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          {/* <button
            type="button"
            onClick={() => setOtaOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#0B4EA2] px-6 text-sm font-semibold text-[#0B4EA2] transition-all hover:bg-blue-50 active:scale-95"
          >
            <span className="text-base leading-none">+</span>
            OTA Reservation
          </button> */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_.9fr_1fr_.8fr_1.2fr] bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
          <div>Guest</div>
          <div>Room</div>
          <div>Check-in</div>
          <div>Check-out</div>
          <div>Status</div>
          <div>Payment</div>
          <div>Source</div>
          <div className="text-center">Action</div>
        </div>

        <div className="min-h-[360px] flex flex-col">
          {reservationsLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading reservations...</p>
            </div>
          ) : pageRows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <IoSearchSharp className="h-6 w-6" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-700">No reservations found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            pageRows.map((row: PmsReservation, idx) => {
              const statusLabel = row.status
            const paymentLabel = row.paidAmount >= row.totalAmount ? 'Fully Paid' : row.paidAmount > 0 ? 'deposit paid' : 'Unpaid'

            const isCheckInToday = row.checkInDate?.startsWith(today) ?? false
            const isCheckOutDue =
              row.status === 'CheckedIn' &&
              Boolean(row.checkOutDate) &&
              row.checkOutDate.slice(0, 10) <= today
            return (
              <div
                key={row.id}
                className={[
                  'grid grid-cols-[1.5fr_1fr_1fr_1fr_.9fr_1fr_.8fr_1.2fr] items-center px-6 py-3 text-[12px] text-slate-700',
                  idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-slate-800">{row.guestName}</div>
                </div>

                <div>
                  {row.roomNumber ? (
                    <div className="leading-tight">
                      <div className="font-medium text-slate-800">{row.roomTypeName}</div>
                      <div className="text-[11px] text-slate-500">{row.roomNumber}</div>
                    </div>
                  ) : (
                    row.roomTypeName
                  )}
                </div>

                <div>{formatDateForDisplay(row.checkInDate)}</div>
                <div>{formatDateForDisplay(row.checkOutDate)}</div>
                <div>{statusLabel}</div>
                <div>{paymentLabel}</div>
                <div>{row.channelName || '—'}</div>

                <div className="relative flex items-center justify-center gap-2">
                  {isCheckInToday && row.status !== 'CheckedIn' && row.status !== 'CheckedOut' ? (
                    // Check in button (green)
                    <button
                      type="button"
                      className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-emerald-700 px-3 text-[12px] font-semibold leading-none text-white"
                      onClick={() => onOpenCheckIn(row.id)}
                    >
                      <LogIn className="h-4 w-4" />
                      check in
                    </button>
                  ) : (
                    <>
                      {isCheckOutDue ? (
                        <button
                          type="button"
                          className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-rose-600 px-3 text-[12px] font-semibold leading-none text-white"
                          onClick={() => {
                            setCheckOutReservationId(row.id)
                            setCheckOutOpen(true)
                          }}
                        >
                          check out
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md bg-[#0B4EA2] px-3 text-[12px] font-semibold leading-none text-white"
                        onClick={() => {
                          setDetailsReservationId(row.id)
                          setDetailsOpen(true)
                        }}
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
                    aria-label="More"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setOpenMenuForId((prev) => (prev === row.id ? null : row.id))}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {openMenuForId === row.id ? (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-11 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpenMenuForId(null)}
                      >
                        cancel Reservation
                      </button>
                      {row.status === 'CheckedIn' && !isCheckOutDue ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                          onClick={() => {
                            setOpenMenuForId(null)
                            setCheckOutReservationId(row.id)
                            setCheckOutOpen(true)
                          }}
                        >
                          Early Check out
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setOpenMenuForId(null)
                          setMoveRoomReservationId(row.id)
                          setMoveRoomOpen(true)
                        }}
                      >
                        Move Room
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          }))}
        </div>
        <div className="mt-4 flex justify-between items-center px-6 pb-5">
          <div className="text-[13px] text-slate-500 font-medium">
            Showing {pageRows.length} of {filteredRows.length} reservations
          </div>
          <Pagination page={safePage} pages={pages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
