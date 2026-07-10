import { useEffect, useMemo, useState } from 'react'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'

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

type Props = {
  open: boolean
  onClose: () => void
}

export function CheckInTodayModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const pmsCheckIns = useAppSelector((s) => s.pms.checkInsByDate)

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

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
    setPage(1)
  }, [open])

  useEffect(() => {
    setPage(1)
  }, [query])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let result = pmsCheckIns.filter((reservation) => {
      const status = (reservation.status ?? '').replace(/[\s_-]/g, '').toLowerCase()
      return status !== 'checkedin'
    })

    if (q) {
      result = result.filter((r) => 
        [r.guestFullName, r.reservationId, r.roomTypeName].some((v) => (v ?? '').toLowerCase().includes(q))
      )
    }

    return result
  }, [pmsCheckIns, query])

  const PAGE_SIZE = 8
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, safePage])

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex h-[calc(100vh-4rem)] w-[92vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <CheckInProcessPopup
          open={checkInOpen}
          onClose={() => {
            setCheckInOpen(false)
            setCheckInReservationId(null)
          }}
          reservationId={checkInReservationId}
          onSuccess={() => {
            const currentToday = new Date().toISOString().split('T')[0]
            void dispatch(fetchPmsCheckInsByDate(currentToday))
          }}
        />

        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5 flex-shrink-0">
          <div>
            <div className="text-lg font-semibold text-white">Check In Today</div>
            <div className="text-sm text-white/70 mt-0.5">{filteredRows.length} arrivals</div>
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

        <div className="shrink-0 px-8 pb-4 pt-6">
          <div className="relative w-full max-w-xl">
            <input
              className="h-11 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search by Guest Name, ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 opacity-70">
              <IconImage src={IoSearchSharp} alt="Search" className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex min-h-0 flex-1 px-8 pb-2">
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_.9fr_1fr_1.2fr] rounded-t-2xl bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700">
                <div>Guest</div>
                <div>Room</div>
                <div>Check-in</div>
                <div>Check-out</div>
                <div>Status</div>
                <div>Payment</div>
                <div className="text-center">Action</div>
              </div>

            <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
              {rows.length === 0 ? (
                <div className="flex h-full items-center justify-center py-16 text-center text-sm text-slate-500">No arrivals found</div>
              ) : (
                rows.map((row: PmsCheckInByDate, idx) => {
                  const paymentLabel = row.remainingBalance === 0 ? 'Fully Paid' : 'Unpaid'

                  return (
                    <div
                      key={row.reservationId}
                      className={[
                        'grid grid-cols-[1.5fr_1fr_1fr_1fr_.9fr_1fr_1.2fr] items-center px-6 py-3 text-[12px] text-slate-700',
                        idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-slate-800">{row.guestFullName}</div>
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
                      <div>{row.status}</div>
                      <div>{paymentLabel}</div>

                      <div className="flex items-center justify-center">
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

                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex h-12 shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-8">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
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
                  safePage === p
                    ? 'bg-[#0B4EA2] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
                ].join(' ')}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
