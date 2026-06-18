import { useEffect, useMemo, useRef, useState } from 'react'

import { Ban, Calendar, ChevronsRight, MoreHorizontal, X } from 'lucide-react'
import { IoSearchSharp } from 'react-icons/io5'

import { IconImage } from '../../../shared/ui/IconImage'
import { Modal } from '../../../shared/ui/Modal'

type ReservationRow = {
  id: string
  guest: string
  room: string
  floor: string
  checkIn: string
  checkOut: string
  guests: number
  status: string
  payment: string
  source: string
}

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchReservationModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [floorFilter, setFloorFilter] = useState('')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all')
  const [checkInFrom, setCheckInFrom] = useState('')
  const [checkInTo, setCheckInTo] = useState('')

  useEffect(() => {
    if (!open) return
    setQuery('')
    setOpenMenuForId(null)
    setStatusFilter('')
    setFloorFilter('')
    setRoomTypeFilter('all')
    setPaymentStatusFilter('all')
    setBookingTypeFilter('all')
    setCheckInFrom('')
    setCheckInTo('')
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

  const rows = useMemo<ReservationRow[]>(
    () =>
      [
        {
          id: '1001',
          guest: 'John Smith',
          room: 'double',
          floor: '2',
          checkIn: '12/18/2025',
          checkOut: '12/22/2025',
          guests: 2,
          status: 'check-in',
          payment: 'deposit paid',
          source: 'direct',
        },
        {
          id: '1002',
          guest: 'Emma Johnson',
          room: 'single',
          floor: '1',
          checkIn: '12/18/2025',
          checkOut: '12/20/2025',
          guests: 1,
          status: 'check-in',
          payment: 'unpaid',
          source: 'booking',
        },
        {
          id: '1003',
          guest: 'Michael Brown',
          room: 'suite',
          floor: '3',
          checkIn: '12/17/2025',
          checkOut: '12/19/2025',
          guests: 3,
          status: 'check-out',
          payment: 'deposit paid',
          source: 'direct',
        },
        {
          id: '1004',
          guest: 'Olivia Davis',
          room: 'double',
          floor: '2',
          checkIn: '12/21/2025',
          checkOut: '12/23/2025',
          guests: 2,
          status: 'check-in',
          payment: 'deposit paid',
          source: 'direct',
        },
        {
          id: '1005',
          guest: 'William Wilson',
          room: 'single',
          floor: '1',
          checkIn: '12/15/2025',
          checkOut: '12/18/2025',
          guests: 1,
          status: 'check-out',
          payment: 'unpaid',
          source: 'booking',
        },
      ],
    [],
  )

  const filteredRows = useMemo(() => {
    const parseUSDate = (value: string): number | null => {
      const trimmed = value.trim()
      const parts = trimmed.split('/')
      if (parts.length !== 3) return null
      const [mm, dd, yyyy] = parts
      const m = Number(mm)
      const d = Number(dd)
      const y = Number(yyyy)
      if (!Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(y)) return null
      if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1) return null
      const date = new Date(y, m - 1, d)
      const t = date.getTime()
      return Number.isFinite(t) ? t : null
    }

    const q = query.trim().toLowerCase()
    let result = rows

    if (q) {
      result = result.filter((r) =>
        [r.guest, r.id, r.room, r.status, r.payment, r.source].some((v) => v.toLowerCase().includes(q)),
      )
    }

    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (floorFilter) {
      result = result.filter((r) => r.floor === floorFilter)
    }

    if (roomTypeFilter !== 'all') {
      result = result.filter((r) => r.room === roomTypeFilter)
    }

    if (paymentStatusFilter !== 'all') {
      result = result.filter((r) => r.payment === paymentStatusFilter)
    }

    if (bookingTypeFilter !== 'all') {
      result = result.filter((r) => r.source === bookingTypeFilter)
    }

    const fromT = parseUSDate(checkInFrom)
    const toT = parseUSDate(checkInTo)
    if (fromT != null || toT != null) {
      result = result.filter((r) => {
        const t = parseUSDate(r.checkIn)
        if (t == null) return false
        if (fromT != null && t < fromT) return false
        if (toT != null && t > toT) return false
        return true
      })
    }

    return result
  }, [bookingTypeFilter, checkInFrom, checkInTo, floorFilter, paymentStatusFilter, query, roomTypeFilter, rows, statusFilter])

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div>
            <div className="text-lg font-semibold text-white">Search Reservation</div>
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

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-slate-700">Status</div>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">select</option>
                  <option value="check-in">check-in</option>
                  <option value="check-out">check-out</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-slate-700">Floor</div>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                >
                  <option value="">select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-slate-700">Room Type</div>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
                  value={roomTypeFilter}
                  onChange={(e) => setRoomTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="single">single</option>
                  <option value="double">double</option>
                  <option value="suite">suite</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-slate-700">Payment Status</div>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="all">All Payment Status</option>
                  <option value="deposit paid">deposit paid</option>
                  <option value="unpaid">unpaid</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-[12px] font-semibold text-slate-700">Booking Type</div>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
                  value={bookingTypeFilter}
                  onChange={(e) => setBookingTypeFilter(e.target.value)}
                >
                  <option value="all">All Source</option>
                  <option value="direct">direct</option>
                  <option value="booking">booking</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-1">
                <div className="text-[12px] font-semibold text-slate-700">Check-in from</div>
                <div className="relative">
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-600 outline-none placeholder:text-slate-400"
                    placeholder="MM/DD/YY"
                    value={checkInFrom}
                    onChange={(e) => setCheckInFrom(e.target.value)}
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <div className="text-[12px] font-semibold text-slate-700">Check-in To</div>
                <div className="relative">
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-600 outline-none placeholder:text-slate-400"
                    placeholder="MM/DD/YY"
                    value={checkInTo}
                    onChange={(e) => setCheckInTo(e.target.value)}
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {filteredRows.length > 0 ? (
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
                          className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-1.5 text-[12px] font-semibold text-white"
                          onClick={() => {}}
                        >
                          <IconImage src="/assets/todays/log-in.png" alt="check in" className="h-3.5 w-3.5" />
                          check in
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
            ) : (
              <div className="rounded-xl bg-[#EAF2FF] px-6 py-20 text-center text-sm text-slate-500">No Result</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
