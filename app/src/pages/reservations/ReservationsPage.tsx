import { useEffect, useMemo, useRef, useState } from 'react'

import { ChevronLeft, ChevronRight, Eye, LogIn, MoreHorizontal, Download } from 'lucide-react'
import { IoSearchSharp } from "react-icons/io5";

import { IconImage } from '../../shared/ui/IconImage'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchPmsReservations } from '../../features/pms/pmsSlice'
import type { PmsReservation } from '../../models/PmsReservation'
import { ReservationDetailsPopup } from './pupops/ReservationDetailsPopup'
import { ExtendStayPopup } from './pupops/ExtendStayPopup'
import { CheckInProcessPopup } from './pupops/CheckInProcessPopup'
import { CheckOutProcessPopup } from './checkout/CheckOutProcessPopup'
import { OtaReservationModal } from '../../widgets/reservations/OtaReservationModal/OtaReservationModal'
import { MoveRoomPopup } from './pupops/MoveRoomPopup'

const today = new Date().toISOString().split('T')[0]
const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '—'
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
  const pmsReservations = useAppSelector((s) => s.pms.reservations)

  const [checkInFrom, setCheckInFrom] = useState(today)
  const [checkInTo, setCheckInTo] = useState(lastDayOfMonth)

  useEffect(() => {
    void dispatch(fetchPmsReservations({ startDate: checkInFrom, endDate: checkInTo }))
  }, [dispatch, checkInFrom, checkInTo])

  const [query, setQuery] = useState('')
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

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')

  const [otaOpen, setOtaOpen] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 6

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

  return (
    <div className="space-y-6">
      <ReservationDetailsPopup
        open={detailsOpen}
        onClose={closeDetails}
        reservationId={detailsReservationId}
        onOpenExtendStay={onOpenExtendStay}
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
          void dispatch(fetchPmsReservations({ startDate: checkInFrom, endDate: checkInTo }))
        }}
      />

      <CheckOutProcessPopup
        open={checkOutOpen}
        onClose={() => {
          setCheckOutOpen(false)
          setCheckOutReservationId(null)
        }}
        reservation={checkOutReservation}
      />

      <OtaReservationModal open={otaOpen} onClose={() => setOtaOpen(false)} />

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

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Status</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
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

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Room Type</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Payment Status</div>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="all">All Payment Status</option>
              <option value="deposit paid">deposit paid</option>
              <option value="Fully paid">Fully paid</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Check-in from</div>
            <div className="relative">
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none placeholder:text-slate-400"
                placeholder="YYYY-MM-DD"
                type="date"
                value={checkInFrom}
                onChange={(e) => setCheckInFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold text-slate-700">Check-in To</div>
            <div className="relative">
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none placeholder:text-slate-400"
                placeholder="YYYY-MM-DD"
                type="date"
                value={checkInTo}
                onChange={(e) => setCheckInTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end justify-end md:col-span-1">
            <Pagination page={safePage} pages={pages} onChange={setPage} />
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
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white pb-32">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_.7fr_.9fr_1fr_.8fr_1.2fr] bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
          <div>Guest</div>
          <div>Room</div>
          <div>Check-in</div>
          <div>Check-out</div>
          <div>Guests</div>
          <div>Status</div>
          <div>Payment</div>
          <div>Source</div>
          <div className="text-center">Action</div>
        </div>

        <div>
          {pageRows.map((row: PmsReservation, idx) => {
            const statusLabel = row.status
            const paymentLabel = row.paidAmount >= row.totalAmount ? 'Fully Paid' : row.paidAmount > 0 ? 'deposit paid' : 'Unpaid'

            const isCheckInToday = row.checkInDate.startsWith(today)
            const isCheckOutToday = row.checkOutDate.startsWith(today)

            return (
              <div
                key={row.id}
                className={[
                  'grid grid-cols-[1.5fr_1fr_1fr_1fr_.7fr_.9fr_1fr_.8fr_1.2fr] items-center px-6 py-3 text-[12px] text-slate-700',
                  idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-slate-800">{row.guestName}</div>
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                    {initials(row.guestName)}
                  </div>
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
                <div>----</div>
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
                  ) : isCheckOutToday && row.status === 'CheckedIn' ? (
                    // Check out button (rose)
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
                  ) : (
                    // Default view action
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
          })}
        </div>
      </div>
    </div>
  )
}
