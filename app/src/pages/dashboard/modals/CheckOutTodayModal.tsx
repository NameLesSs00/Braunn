import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, X } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchPmsInHouseReservations } from '../../../features/pms/pmsSlice'
import type { PmsInHouseReservation, PmsReservation } from '../../../models/PmsReservation'
import { CheckOutProcessPopup } from '../../reservations/checkout/CheckOutProcessPopup'
import { MoveRoomPopup } from '../../reservations/pupops/MoveRoomPopup'

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

function toPmsReservation(row: PmsInHouseReservation): PmsReservation {
  return {
    id: row.reservationId,
    guestName: row.guestFullName,
    roomNumber: row.roomNumber,
    roomTypeName: row.roomTypeName,
    checkInDate: row.checkInDate,
    checkOutDate: row.checkOutDate,
    status: row.status,
    totalAmount: row.remainingBalance,
    paidAmount: 0,
    channelName: null,
    remainingAmount: row.remainingBalance,
  }
}

export function CheckOutTodayModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const inHouseReservations = useAppSelector((s) => s.pms.inHouseReservations)

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [checkOutReservationId, setCheckOutReservationId] = useState<string | null>(null)
  const [moveRoomOpen, setMoveRoomOpen] = useState(false)
  const [moveRoomReservationId, setMoveRoomReservationId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const pageSize = 8

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setPage(1)
    setOpenMenuForId(null)
    void dispatch(fetchPmsInHouseReservations())
  }, [dispatch, open])

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

    return inHouseReservations
      .filter((r) => r.checkOutDate?.slice(0, 10) === today)
      .filter((r) => r.status === 'CheckedIn')
      .filter((r) => {
        if (!q) return true
        return [r.guestFullName, r.reservationId, r.roomNumber, r.roomTypeName].some((value) =>
          (value ?? '').toLowerCase().includes(q),
        )
      })
  }, [inHouseReservations, query, today])

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
    const found = inHouseReservations.find((r) => r.reservationId === checkOutReservationId)
    return found ? toPmsReservation(found) : null
  }, [checkOutReservationId, inHouseReservations])

  const refreshDepartures = () => {
    void dispatch(fetchPmsInHouseReservations())
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
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
                    <h3 className="text-[15px] font-semibold text-slate-700">No departures found for today</h3>
                    <p className="mt-1 text-sm text-slate-500">Checked-in reservations with today as checkout date will appear here.</p>
                  </div>
                ) : (
                  rows.map((row, idx) => {
                    const paymentLabel = row.remainingBalance > 0 ? 'Unpaid' : 'Fully Paid'

                    return (
                      <div
                        key={`${row.reservationId}-${idx}`}
                        className={[
                          'grid grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_0.85fr_0.95fr_0.8fr_0.75fr] items-center px-5 py-3 text-[13px]',
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <span className="truncate">{row.guestFullName || '-----'}</span>
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
                          <button
                            type="button"
                            className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-md bg-rose-600 px-3 text-[12px] font-semibold leading-none text-white"
                            onClick={() => {
                              setCheckOutReservationId(row.reservationId)
                              setCheckOutOpen(true)
                            }}
                          >
                            check out
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              className="inline-flex h-7 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                              aria-label="More"
                              onClick={() => setOpenMenuForId((prev) => (prev === row.reservationId ? null : row.reservationId))}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {openMenuForId === row.reservationId ? (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-9 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                              >
                                <button
                                  type="button"
                                  className="flex w-full cursor-not-allowed items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-400"
                                  disabled
                                >
                                  Cancel Reservation
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full cursor-not-allowed items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-400"
                                  disabled
                                >
                                  Early Check out
                                </button>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                                  onClick={() => {
                                    setOpenMenuForId(null)
                                    setMoveRoomReservationId(row.reservationId)
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

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
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

      <MoveRoomPopup
        open={moveRoomOpen}
        onClose={() => {
          setMoveRoomOpen(false)
          setMoveRoomReservationId(null)
        }}
        reservationId={moveRoomReservationId}
      />

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
