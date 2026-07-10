import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, MoreHorizontal, Search, X } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchPmsReservations } from '../../../features/pms/pmsSlice'
import { ReservationDetailsPopup } from '../../reservations/pupops/ReservationDetailsPopup'
import { ExtendStayPopup } from '../../reservations/pupops/ExtendStayPopup'
import { CheckInProcessPopup } from '../../reservations/pupops/CheckInProcessPopup'
import { CheckOutProcessPopup } from '../../reservations/checkout/CheckOutProcessPopup'
import { MoveRoomPopup } from '../../reservations/pupops/MoveRoomPopup'

type Props = {
  open: boolean
  onClose: () => void
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentMonthRange() {
  const now = new Date()
  return {
    startDate: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '-----'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

export function InHouseMonthModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const inHouseReservations = useAppSelector((s) => s.pms.reservations)
  const monthRange = useMemo(() => getCurrentMonthRange(), [])

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
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
  const menuRef = useRef<HTMLDivElement | null>(null)
  const pageSize = 8

  const today = useMemo(() => formatDateInput(new Date()), [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setPage(1)
    setOpenMenuForId(null)
    void dispatch(fetchPmsReservations(monthRange))
  }, [dispatch, monthRange, open])

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

    return inHouseReservations.filter((row) => {
      if (!q) return true
      return [row.guestName, row.id, row.roomNumber, row.roomTypeName].some((value) =>
        (value ?? '').toLowerCase().includes(q),
      )
    })
  }, [inHouseReservations, query])

  useEffect(() => {
    setPage(1)
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safePage])

  const checkOutReservation = useMemo(() => {
    if (!checkOutReservationId) return null
    return inHouseReservations.find((row) => row.id === checkOutReservationId) ?? null
  }, [checkOutReservationId, inHouseReservations])

  const refreshInHouseReservations = () => {
    void dispatch(fetchPmsReservations(monthRange))
  }

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

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="flex h-[calc(100vh-4rem)] w-[92vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
            <div>
              <div className="text-lg font-semibold text-white">In House list</div>
              <div className="mt-0.5 text-sm text-white/70">
                {formatDateForDisplay(monthRange.startDate)} - {formatDateForDisplay(monthRange.endDate)}
              </div>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10" aria-label="Close">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 px-8 py-6">
            <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-col">
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="relative min-w-[260px] flex-1">
                  <input
                    className="h-11 w-full rounded-full border border-slate-200 bg-[#F3F5FF] px-5 pr-11 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
                    placeholder="Search by Guest Name, Room, Res ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
                <div className="ml-auto text-sm font-semibold text-slate-700">{filteredRows.length} results</div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <div className="grid grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_0.85fr_0.95fr_0.8fr_0.75fr] rounded-t-2xl bg-[#EAF2FF] px-5 py-3 text-[12px] font-bold text-slate-700">
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
                    <p className="mt-1 text-sm text-slate-500">This popup shows the current month.</p>
                  </div>
                ) : (
                  rows.map((row, idx) => {
                    const paymentLabel = row.paidAmount >= row.totalAmount ? 'Fully Paid' : 'Unpaid'
                    const isCheckInToday = row.checkInDate.startsWith(today)
                    const isCheckOutToday = row.checkOutDate.startsWith(today)

                    return (
                      <div
                        key={`${row.id}-${idx}`}
                        className={[
                          'grid grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_0.85fr_0.95fr_0.8fr_0.75fr] items-center px-5 py-3 text-[13px]',
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="truncate">{row.guestName || '-----'}</span>
                        </div>
                        <div className="text-slate-600">
                          <div className="font-medium text-slate-700">{row.roomNumber || '-----'}</div>
                          <div className="text-[11px] text-slate-500">{row.roomTypeName || '-----'}</div>
                        </div>
                        <div className="text-slate-600">{formatDateForDisplay(row.checkInDate)}</div>
                        <div className="text-slate-600">{formatDateForDisplay(row.checkOutDate)}</div>
                        <div className="text-slate-600">{row.status || '-----'}</div>
                        <div className="text-slate-600">{paymentLabel}</div>
                        <div className="text-slate-600">-----</div>
                        <div className="flex justify-end gap-2">
                          {isCheckInToday && row.status !== 'CheckedIn' && row.status !== 'CheckedOut' ? (
                            <button type="button" className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-emerald-700 px-3 text-[12px] font-semibold leading-none text-white" onClick={() => { setCheckInReservationId(row.id); setCheckInOpen(true) }}>
                              check in
                            </button>
                          ) : isCheckOutToday && row.status === 'CheckedIn' ? (
                            <button type="button" className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-rose-600 px-3 text-[12px] font-semibold leading-none text-white" onClick={() => { setCheckOutReservationId(row.id); setCheckOutOpen(true) }}>
                              check out
                            </button>
                          ) : (
                            <button type="button" className="inline-flex h-7 items-center justify-center rounded-lg bg-[#0B4EA2] px-4 text-white transition-colors hover:bg-[#0a3f85]" aria-label="View" onClick={() => { setDetailsReservationId(row.id); setDetailsOpen(true) }}>
                              <Eye className="h-4 w-4" />
                            </button>
                          )}

                          <div className="relative">
                            <button type="button" className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200" aria-label="More" onClick={() => setOpenMenuForId((prev) => (prev === row.id ? null : row.id))}>
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {openMenuForId === row.id ? (
                              <div ref={menuRef} className="absolute right-0 top-9 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                <button type="button" className="flex w-full cursor-not-allowed items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-400" disabled>
                                  Cancel Reservation
                                </button>
                                <button type="button" className="flex w-full cursor-not-allowed items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-400" disabled>
                                  Early Check out
                                </button>
                                <button type="button" className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50" onClick={() => { setOpenMenuForId(null); setMoveRoomReservationId(row.id); setMoveRoomOpen(true) }}>
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

              {totalPages > 1 ? (
                <div className="mt-3 flex h-10 shrink-0 items-center justify-end gap-3">
                  <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button key={pageNumber} type="button" className={['inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold', safePage === pageNumber ? 'bg-[#0B4EA2] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'].join(' ')} onClick={() => setPage(pageNumber)}>
                      {pageNumber}
                    </button>
                  ))}
                  <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Modal>

      <ReservationDetailsPopup open={detailsOpen} onClose={closeDetails} reservationId={detailsReservationId} onOpenExtendStay={onOpenExtendStay} onPaymentSuccess={refreshInHouseReservations} />
      <ExtendStayPopup open={extendStayOpen} onClose={closeExtendStay} reservationId={extendStayReservationId} />
      <MoveRoomPopup open={moveRoomOpen} onClose={() => { setMoveRoomOpen(false); setMoveRoomReservationId(null) }} reservationId={moveRoomReservationId} />
      <CheckInProcessPopup open={checkInOpen} onClose={() => { setCheckInOpen(false); setCheckInReservationId(null) }} reservationId={checkInReservationId} />
      <CheckOutProcessPopup open={checkOutOpen} onClose={() => { setCheckOutOpen(false); setCheckOutReservationId(null) }} reservation={checkOutReservation as any} onSuccess={refreshInHouseReservations} />
    </>
  )
}
