import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Search, X } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchPmsReservations } from '../../../features/pms/pmsSlice'
import { ReservationDetailsPopup } from '../../reservations/pupops/ReservationDetailsPopup'
import { ExtendStayPopup } from '../../reservations/pupops/ExtendStayPopup'
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

export function SearchReservationModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const reservations = useAppSelector((s) => s.pms.reservations)
  const monthRange = useMemo(() => getCurrentMonthRange(), [])

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [checkInFrom, setCheckInFrom] = useState(monthRange.startDate)
  const [checkInTo, setCheckInTo] = useState(monthRange.endDate)
  const [checkOutFrom, setCheckOutFrom] = useState('')
  const [checkOutTo, setCheckOutTo] = useState('')
  const [page, setPage] = useState(1)
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsReservationId, setDetailsReservationId] = useState<string | null>(null)
  const [extendStayOpen, setExtendStayOpen] = useState(false)
  const [extendStayReservationId, setExtendStayReservationId] = useState<string | null>(null)
  const [moveRoomOpen, setMoveRoomOpen] = useState(false)
  const [moveRoomReservationId, setMoveRoomReservationId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const pageSize = 15

  useEffect(() => {
    if (!open) return
    setQuery('')
    setStatusFilter('all')
    setRoomTypeFilter('all')
    setPaymentFilter('all')
    setSourceFilter('all')
    setCheckInFrom(monthRange.startDate)
    setCheckInTo(monthRange.endDate)
    setCheckOutFrom('')
    setCheckOutTo('')
    setPage(1)
    setOpenMenuForId(null)
    void dispatch(fetchPmsReservations({ startDate: monthRange.startDate, endDate: monthRange.endDate }))
  }, [dispatch, monthRange, open])

  useEffect(() => {
    if (!open) return
    void dispatch(fetchPmsReservations({ startDate: checkInFrom || monthRange.startDate, endDate: checkInTo || monthRange.endDate }))
  }, [checkInFrom, checkInTo, dispatch, monthRange.endDate, monthRange.startDate, open])

  useEffect(() => {
    if (!openMenuForId) return
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpenMenuForId(null)
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [openMenuForId])

  const statusOptions = useMemo(() => Array.from(new Set(reservations.map((row) => row.status).filter(Boolean))).sort(), [reservations])
  const roomTypeOptions = useMemo(() => Array.from(new Set(reservations.map((row) => row.roomTypeName).filter(Boolean))).sort(), [reservations])
  const sourceOptions = useMemo(
    () => Array.from(new Set(reservations.map((row) => row.channelName || row.bookingSource || 'direct').filter(Boolean))).sort(),
    [reservations],
  )

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()

    return reservations
      .filter((row) => {
        if (!q) return true
        return [
          row.guestName,
          row.id,
          row.bookingReference,
          row.roomNumber,
          row.roomTypeName,
          row.status,
          row.channelName,
          row.bookingSource,
          row.guest?.phone,
          row.guest?.email,
        ].some((value) => (value ?? '').toLowerCase().includes(q))
      })
      .filter((row) => statusFilter === 'all' || row.status === statusFilter)
      .filter((row) => roomTypeFilter === 'all' || row.roomTypeName === roomTypeFilter)
      .filter((row) => {
        if (paymentFilter === 'all') return true
        const remaining = row.remainingAmount ?? Math.max(0, row.totalAmount - row.paidAmount)
        if (paymentFilter === 'fullyPaid') return remaining <= 0
        if (paymentFilter === 'partial') return row.paidAmount > 0 && remaining > 0
        if (paymentFilter === 'unpaid') return row.paidAmount <= 0 && remaining > 0
        return true
      })
      .filter((row) => sourceFilter === 'all' || (row.channelName || row.bookingSource || 'direct') === sourceFilter)
      .filter((row) => !checkOutFrom || row.checkOutDate.slice(0, 10) >= checkOutFrom)
      .filter((row) => !checkOutTo || row.checkOutDate.slice(0, 10) <= checkOutTo)
  }, [checkOutFrom, checkOutTo, paymentFilter, query, reservations, roomTypeFilter, sourceFilter, statusFilter])

  useEffect(() => {
    setPage(1)
  }, [checkOutFrom, checkOutTo, paymentFilter, query, roomTypeFilter, sourceFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safePage])

  const refreshReservations = () => {
    void dispatch(fetchPmsReservations({ startDate: checkInFrom || monthRange.startDate, endDate: checkInTo || monthRange.endDate }))
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
              <div className="text-lg font-semibold text-white">Search booking</div>
              <div className="mt-0.5 text-sm text-white/70">
                {formatDateForDisplay(checkInFrom || monthRange.startDate)} - {formatDateForDisplay(checkInTo || monthRange.endDate)}
              </div>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10" aria-label="Close">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 px-8 py-6">
            <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-col">
              <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[repeat(4,minmax(140px,0.65fr))_minmax(260px,1.35fr)]">
                <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter}>
                  <option value="all">All status</option>
                  {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                </FilterSelect>
                <FilterSelect label="Room type" value={roomTypeFilter} onChange={setRoomTypeFilter}>
                  <option value="all">All room types</option>
                  {roomTypeOptions.map((roomType) => <option key={roomType} value={roomType}>{roomType}</option>)}
                </FilterSelect>
                <FilterSelect label="Payment" value={paymentFilter} onChange={setPaymentFilter}>
                  <option value="all">All payment</option>
                  <option value="fullyPaid">Fully paid</option>
                  <option value="partial">Partial paid</option>
                  <option value="unpaid">Unpaid</option>
                </FilterSelect>
                <FilterSelect label="Source" value={sourceFilter} onChange={setSourceFilter}>
                  <option value="all">All sources</option>
                  {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
                </FilterSelect>

                <div className="relative min-w-[260px] self-end">
                  <input
                    className="h-10 w-full rounded-full border border-slate-200 bg-[#F3F5FF] px-5 pr-11 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
                    placeholder="Search guest, room, ID, phone, email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                <DateFilter label="Check-in from" value={checkInFrom} onChange={setCheckInFrom} />
                <DateFilter label="Check-in to" value={checkInTo} onChange={setCheckInTo} />
                <DateFilter label="Check-out from" value={checkOutFrom} onChange={setCheckOutFrom} />
                <DateFilter label="Check-out to" value={checkOutTo} onChange={setCheckOutTo} />
              </div>

              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-700">{filteredRows.length} results</div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    setQuery('')
                    setStatusFilter('all')
                    setRoomTypeFilter('all')
                    setPaymentFilter('all')
                    setSourceFilter('all')
                    setCheckInFrom(monthRange.startDate)
                    setCheckInTo(monthRange.endDate)
                    setCheckOutFrom('')
                    setCheckOutTo('')
                  }}
                >
                  Reset filters
                </button>
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
                    <h3 className="text-[15px] font-semibold text-slate-700">No reservations found</h3>
                    <p className="mt-1 text-sm text-slate-500">Try changing the filters above.</p>
                  </div>
                ) : (
                  rows.map((row, idx) => {
                    const remaining = row.remainingAmount ?? Math.max(0, row.totalAmount - row.paidAmount)
                    const paymentLabel = remaining <= 0 ? 'Fully Paid' : row.paidAmount > 0 ? 'Partial' : 'Unpaid'

                    return (
                      <div
                        key={`${row.id}-${idx}`}
                        className={[
                          'grid grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_0.85fr_0.95fr_0.8fr_0.75fr] items-center px-5 py-3 text-[13px]',
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
                        ].join(' ')}
                      >
                        <div className="min-w-0 leading-tight text-slate-700">
                          <div className="truncate font-medium">{row.guestName || '-----'}</div>
                          <div className="truncate text-[11px] text-slate-500" title={row.bookingReference || row.id}>
                            {row.bookingReference || row.id || '-----'}
                          </div>
                        </div>
                        <div className="text-slate-600">
                          <div className="font-medium text-slate-700">{row.roomNumber || '-----'}</div>
                          <div className="text-[11px] text-slate-500">{row.roomTypeName || '-----'}</div>
                        </div>
                        <div className="text-slate-600">{formatDateForDisplay(row.checkInDate)}</div>
                        <div className="text-slate-600">{formatDateForDisplay(row.checkOutDate)}</div>
                        <div className="text-slate-600">{row.status || '-----'}</div>
                        <div className="text-slate-600">{paymentLabel}</div>
                        <div className="text-slate-600">{row.channelName || row.bookingSource || '-----'}</div>
                        <div className="flex justify-end gap-2">
                          <button type="button" className="inline-flex h-7 items-center justify-center rounded-lg bg-[#0B4EA2] px-4 text-white transition-colors hover:bg-[#0a3f85]" aria-label="View" onClick={() => { setDetailsReservationId(row.id); setDetailsOpen(true) }}>
                            <Eye className="h-4 w-4" />
                          </button>

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
                  {getVisiblePageNumbers(safePage, totalPages).map((pageNumber) => (
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

      <ReservationDetailsPopup open={detailsOpen} onClose={closeDetails} reservationId={detailsReservationId} onOpenExtendStay={onOpenExtendStay} onPaymentSuccess={refreshReservations} />
      <ExtendStayPopup open={extendStayOpen} onClose={closeExtendStay} reservationId={extendStayReservationId} />
      <MoveRoomPopup open={moveRoomOpen} onClose={() => { setMoveRoomOpen(false); setMoveRoomReservationId(null) }} reservationId={moveRoomReservationId} onSuccess={refreshReservations} />
    </>
  )
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="relative block">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">{label}</span>
      <select className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-slate-400" />
    </label>
  )
}

function DateFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-slate-600">{label}</span>
      <input type="date" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
