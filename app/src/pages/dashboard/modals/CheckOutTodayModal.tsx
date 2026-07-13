import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchPmsReservations } from '../../../features/pms/pmsSlice'
import { CheckOutProcessPopup } from '../../reservations/checkout/CheckOutProcessPopup'

type Props = {
  open: boolean
  onClose: () => void
}

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '-----'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function getLocalYYYYMMDD(d: Date = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDepartureLookupRange(today: string) {
  const start = new Date(today)
  start.setDate(start.getDate() - 90)
  return {
    startDate: getLocalYYYYMMDD(start),
    endDate: today,
  }
}

function normalizeStatus(value?: string | null) {
  return (value || '').replace(/[\s_-]/g, '').toLowerCase()
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

export function CheckOutTodayModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const reservations = useAppSelector((s) => s.pms.reservations)
  const reservationsLoading = useAppSelector((s) => s.pms.status === 'loading')

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [checkOutReservationId, setCheckOutReservationId] = useState<string | null>(null)
  const fetchedForOpenRef = useRef(false)
  const pageSize = 15

  const today = useMemo(() => getLocalYYYYMMDD(), [])
  const departureLookupRange = useMemo(() => getDepartureLookupRange(today), [today])

  useEffect(() => {
    if (!open) {
      fetchedForOpenRef.current = false
      return
    }
    setQuery('')
    setPage(1)
    if (fetchedForOpenRef.current) return
    fetchedForOpenRef.current = true
    void dispatch(fetchPmsReservations(departureLookupRange))
  }, [departureLookupRange, dispatch, open])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()

    return reservations
      .filter((r) => r.checkOutDate?.slice(0, 10) === today)
      .filter((r) => normalizeStatus(r.status) === 'checkedin')
      .filter((r) => {
        if (!q) return true
        return [r.guestName, r.bookingReference, r.roomNumber, r.roomTypeName].some((value) =>
          (value ?? '').toLowerCase().includes(q),
        )
      })
  }, [query, reservations, today])

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
    return reservations.find((r) => r.id === checkOutReservationId) ?? null
  }, [checkOutReservationId, reservations])

  const refreshDepartures = () => {
    void dispatch(fetchPmsReservations(departureLookupRange))
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="flex h-[calc(100vh-4rem)] w-[92vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
            <div className="text-lg font-semibold text-white">Departures Today</div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
              aria-label="Close"
            >
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
                <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_.9fr_1fr_1.1fr] bg-[#EAF2FF] px-5 py-3 text-[12px] font-bold text-slate-700">
                  <div>Guest</div>
                  <div>Room</div>
                  <div>Check-in</div>
                  <div>Check-out</div>
                  <div>Status</div>
                  <div>Payment</div>
                  <div className="text-right">Action</div>
                </div>

                {reservationsLoading ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
                    <p className="mt-3 text-sm font-medium text-slate-500">Loading departures...</p>
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                    <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                      <Search className="h-6 w-6" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-slate-700">No departures found for today</h3>
                    <p className="mt-1 text-sm text-slate-500">Checked-in reservations with today as checkout date will appear here.</p>
                  </div>
                ) : (
                  rows.map((row, idx) => {
                    const paymentLabel = row.remainingBalance > 0 ? 'Unpaid' : 'Fully Paid'

                    return (
                      <div
                        key={`${row.id}-${idx}`}
                        className={[
                          'grid grid-cols-[1.4fr_1fr_1fr_1fr_.9fr_1fr_1.1fr] items-center px-5 py-3 text-[13px]',
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
                        ].join(' ')}
                      >
                        <div className="min-w-0 leading-tight text-slate-700">
                          <div className="truncate font-medium">{row.guestName || '-----'}</div>
                          {row.bookingReference ? (
                            <div className="truncate text-[11px] text-slate-500" title={row.bookingReference}>
                              {row.bookingReference}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-slate-600">
                          <div className="font-medium text-slate-700">{row.roomNumber || '-----'}</div>
                          <div className="text-[11px] text-slate-500">{row.roomTypeName || '-----'}</div>
                        </div>
                        <div className="text-slate-600">{formatDateForDisplay(row.checkInDate)}</div>
                        <div className="text-slate-600">{formatDateForDisplay(row.checkOutDate)}</div>
                        <div className="text-slate-600">{row.status || '-----'}</div>
                        <div className="text-slate-600">{paymentLabel}</div>
                        <div className="flex justify-end">
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

                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {totalPages > 1 ? (
                <div className="mt-3 flex h-10 shrink-0 items-center justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {getVisiblePageNumbers(safePage, totalPages).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={[
                        'inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold',
                        safePage === pageNumber ? 'bg-[#0B4EA2] text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
                      ].join(' ')}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
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
              ) : null}
            </div>
          </div>
        </div>
      </Modal>

      <CheckOutProcessPopup
        open={checkOutOpen}
        onClose={() => {
          setCheckOutOpen(false)
          setCheckOutReservationId(null)
        }}
        reservation={checkOutReservation}
        onSuccess={refreshDepartures}
      />
    </>
  )
}
