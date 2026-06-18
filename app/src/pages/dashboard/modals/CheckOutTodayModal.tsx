import { useEffect, useMemo, useRef, useState } from 'react'

import { Ban, ChevronsRight, MoreHorizontal, X } from 'lucide-react'
import { IoSearchSharp } from "react-icons/io5";
import { CgLogOut } from "react-icons/cg";

import { IconImage } from '../../../shared/ui/IconImage'
import { Modal } from '../../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { fetchPmsReservations } from '../../../features/pms/pmsSlice'

type CheckOutReservationRow = {
  id: string
  guest: string
  room: string
  checkIn: string
  checkOut: string
  guests: number
  status: string
  payment: string
  source: string
}

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

export function CheckOutTodayModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const pmsReservations = useAppSelector((s) => s.pms.reservations)

  const [query, setQuery] = useState('')
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setOpenMenuForId(null)

    // Fetch reservations for the last 30 days to catch check-outs today
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    
    void dispatch(fetchPmsReservations({ startDate, endDate: today }))
  }, [open, dispatch, today])

  useEffect(() => {
    if (!openMenuForId) return

    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpenMenuForId(null)
    }

    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [openMenuForId])

  const rows = useMemo<CheckOutReservationRow[]>(() => {
    return pmsReservations
      .filter((r) => r.checkOutDate && r.checkOutDate.startsWith(today))
      .map((r) => ({
        id: r.id,
        guest: r.guestName,
        room: r.roomNumber ? `${r.roomTypeName} (${r.roomNumber})` : r.roomTypeName,
        checkIn: formatDateForDisplay(r.checkInDate),
        checkOut: formatDateForDisplay(r.checkOutDate),
        guests: 0,
        status: r.status,
        payment: r.paidAmount >= r.totalAmount ? 'Fully paid' : r.paidAmount > 0 ? 'deposit paid' : 'Unpaid',
        source: r.channelName || 'direct',
      }))
  }, [pmsReservations, today])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => [r.guest, r.id].some((v) => v.toLowerCase().includes(q)))
  }, [query, rows])

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div>
            <div className="text-lg font-semibold text-white">check out Today</div>
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
                {filteredRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className={[
                      'grid grid-cols-[1.4fr_.8fr_1fr_1fr_.7fr_.9fr_1fr_.8fr_1.2fr] items-center px-6 py-3 text-[12px] text-slate-700',
                      idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white',
                    ].join(' ')}
                  >
                    <div className="font-medium text-slate-800">{row.guest}</div>
                    <div>{row.room}</div>
                    <div>{row.checkIn}</div>
                    <div>{row.checkOut}</div>
                    <div>{row.guests}</div>
                    <div>{row.status}</div>
                    <div>{row.payment}</div>
                    <div>{row.source}</div>

                    <div className="relative flex items-center justify-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md bg-rose-600 px-3 py-1.5 text-[12px] font-semibold text-white"
                        onClick={() => {
                          // TODO: wire real check-out action
                        }}
                      >
                        <IconImage src={CgLogOut} alt="check out" className="h-3.5 w-3.5" />
                        check out
                      </button>

                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100"
                        aria-label="More"
                        onClick={() => setOpenMenuForId((prev) => (prev === row.id ? null : row.id))}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenuForId === row.id ? (
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
