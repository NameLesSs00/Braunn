import { useEffect, useMemo, useRef, useState } from 'react'

import { Ban, ChevronsRight, MoreHorizontal, X } from 'lucide-react'

import { IconImage } from '../../../shared/ui/IconImage'
import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchPmsCheckInsByDate } from '../../../features/pms/pmsSlice'
import type { PmsCheckInByDate } from '../../../models/PmsReservation'
import { CheckInProcessPopup } from '../../reservations/pupops/CheckInProcessPopup'
import { IoSearchSharp } from "react-icons/io5";
import { FiLogIn } from "react-icons/fi";

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

type Props = {
  open: boolean
  onClose: () => void
}

export function CheckInTodayModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const pmsCheckIns = useAppSelector((s) => s.pms.checkInsByDate)

  const [query, setQuery] = useState('')
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkInReservationId, setCheckInReservationId] = useState<string | null>(null)


  useEffect(() => {
    if (open) {
      const currentToday = new Date().toISOString().split('T')[0]
      void dispatch(fetchPmsCheckInsByDate(currentToday))
    }
  }, [dispatch, open])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setOpenMenuForId(null)
  }, [open])

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
    let result = [...pmsCheckIns]

    if (q) {
      result = result.filter((r) => 
        [r.guestFullName, r.reservationId, r.roomTypeName].some((v) => (v ?? '').toLowerCase().includes(q))
      )
    }

    return result
  }, [pmsCheckIns, query])

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <CheckInProcessPopup
          open={checkInOpen}
          onClose={() => {
            setCheckInOpen(false)
            setCheckInReservationId(null)
          }}
          reservationId={checkInReservationId}
        />

        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div>
            <div className="text-lg font-semibold text-white">check in Today</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 px-8 py-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full max-w-xl">
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

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[1.4fr_.8fr_1fr_1fr_.7fr_.9fr_1fr_.8fr_1.2fr] bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
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

              <div className="divide-y divide-slate-100">
                {filteredRows.map((row: PmsCheckInByDate, idx) => {
                  const paymentLabel = row.remainingBalance === 0 ? 'Fully Paid' : 'Unpaid'

                  return (
                    <div
                      key={row.reservationId}
                      className={[
                        'grid grid-cols-[1.4fr_.8fr_1fr_1fr_.7fr_.9fr_1fr_.8fr_1.2fr] items-center px-6 py-3 text-[12px] text-slate-700',
                        idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-slate-800">{row.guestFullName}</div>
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          {initials(row.guestFullName)}
                        </div>
                      </div>
                      <div>
                        {row.roomNumber && row.roomNumber !== 'Pending' ? (
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
                      <div>{row.status}</div>
                      <div>{paymentLabel}</div>
                      <div>—</div>

                      <div className="relative flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-semibold text-white"
                          onClick={() => {
                            setCheckInReservationId(row.reservationId)
                            setCheckInOpen(true)
                          }}
                        >
                          <IconImage src={FiLogIn} alt="check in" className="h-3.5 w-3.5" />
                          check in
                        </button>

                        <button
                          type="button"
                          className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
                          aria-label="More"
                          onClick={() => setOpenMenuForId((prev) => (prev === row.reservationId ? null : row.reservationId))}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openMenuForId === row.reservationId ? (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-10 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                          >
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                              onClick={() => setOpenMenuForId(null)}
                            >
                              <Ban className="h-4 w-4 text-slate-500" />
                              cancel Reservation
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                              onClick={() => setOpenMenuForId(null)}
                            >
                              <ChevronsRight className="h-4 w-4 text-slate-500" />
                              Early Check out
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                              onClick={() => setOpenMenuForId(null)}
                            >
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
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
        </div>
      </div>
    </Modal>
  )
}
