import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Search, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchPmsReservations } from '../../features/pms/pmsSlice'
import { assignRoom } from '../../features/ops/opsSlice'
import type { PmsReservation } from '../../models/PmsReservation'

type AllocationStatusFilter = 'All status' | 'Allocated' | 'Not Allocated'
type ReservationStatusFilter = 'All status' | 'Confirmed' | 'Cancelled' | 'Checked in' | 'Checked out'
type FloorFilter = 'All Floor' | '1' | '2' | '3' | '4' | '5'
type RoomTypeFilter = 'All Types' | 'Single' | 'Double' | 'Triple' | 'Suite' | 'Deluxe'

function formatDateForDisplay(isoDate: string): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function getDifferenceInDays(date1: string, date2: string): number {
  if (!date1 || !date2) return 0
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function GuestDot({ name }: { name: string }) {
  const letter = (name.trim()[0] ?? 'G').toUpperCase()
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
      {letter}
    </span>
  )
}

export function RoomAllocationPage() {
  const dispatch = useAppDispatch()
  const pmsReservations = useAppSelector((s) => s.pms.reservations)

  const [query, setQuery] = useState('')
  const [allocationStatus, setAllocationStatus] = useState<AllocationStatusFilter>('All status')
  const [floor, setFloor] = useState<FloorFilter>('All Floor')
  const [roomType, setRoomType] = useState<RoomTypeFilter>('All Types')
  const [arrivalDate, setArrivalDate] = useState('')
  const [reservationStatus, setReservationStatus] = useState<ReservationStatusFilter>('All status')

  const [roomInputs, setRoomInputs] = useState<Record<string, string>>({})
  const [allocatingIds, setAllocatingIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (pmsReservations) {
      const initialInputs: Record<string, string> = {}
      pmsReservations.forEach((r) => {
        if (r.roomNumber) {
          initialInputs[r.id] = r.roomNumber
        }
      })
      setRoomInputs(initialInputs)
    }
  }, [pmsReservations])

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const computedDateRange = useMemo(() => {
    if (arrivalDate) {
      const d = new Date(arrivalDate)
      d.setMonth(d.getMonth() + 1)
      return {
        startDate: arrivalDate,
        endDate: d.toISOString().split('T')[0],
      }
    } else {
      const d = new Date()
      return {
        startDate: today,
        endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0],
      }
    }
  }, [arrivalDate, today])

  useEffect(() => {
    void dispatch(
      fetchPmsReservations({
        startDate: computedDateRange.startDate,
        endDate: computedDateRange.endDate,
      })
    )
  }, [dispatch, computedDateRange])

  const filteredRows = useMemo(() => {
    let result = [...pmsReservations]
    const q = query.trim().toLowerCase()

    if (q) {
      result = result.filter((r) =>
        [r.guestName, r.id].some((v) => (v ?? '').toLowerCase().includes(q))
      )
    }

    if (allocationStatus !== 'All status') {
      result = result.filter((r) => {
        const isAllocated = !!r.roomNumber
        return allocationStatus === 'Allocated' ? isAllocated : !isAllocated
      })
    }

    if (reservationStatus !== 'All status') {
      const targetStatus =
        reservationStatus === 'Checked in'
          ? 'CheckedIn'
          : reservationStatus === 'Checked out'
          ? 'CheckedOut'
          : reservationStatus
      result = result.filter((r) => r.status === targetStatus)
    }

    if (arrivalDate) {
      result = result.filter((r) => r.checkInDate.startsWith(arrivalDate))
    }

    if (floor !== 'All Floor') {
      result = result.filter((r) => r.roomNumber && r.roomNumber.trim().startsWith(floor))
    }

    if (roomType !== 'All Types') {
      result = result.filter((r) =>
        r.roomTypeName?.toLowerCase().includes(roomType.toLowerCase())
      )
    }

    return result
  }, [pmsReservations, query, allocationStatus, reservationStatus, arrivalDate, floor, roomType])

  const selectClass =
    'h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10'

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[260px] flex-1">
          <input
            className="h-11 w-full rounded-full border border-slate-200 bg-[#F3F5FF] px-5 pr-11 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
            placeholder="Search by Guest Name ,Phone No,Res ID,Group Name.."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm font-semibold text-slate-700">{filteredRows.length} results</div>
          <button
            type="button"
            className="h-11 rounded-xl border-2 border-[#0B4EA2] bg-white px-6 text-sm font-semibold text-[#0B4EA2] transition-colors hover:bg-slate-50"
          >
            Allocate All
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Allocation Status</div>
          <div className="relative">
            <select
              className={selectClass}
              value={allocationStatus}
              onChange={(e) => setAllocationStatus(e.target.value as AllocationStatusFilter)}
            >
              <option>All status</option>
              <option>Allocated</option>
              <option>Not Allocated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Floor</div>
          <div className="relative">
            <select
              className={selectClass}
              value={floor}
              onChange={(e) => setFloor(e.target.value as FloorFilter)}
            >
              <option>All Floor</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Room Type</div>
          <div className="relative">
            <select
              className={selectClass}
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomTypeFilter)}
            >
              <option>All Types</option>
              <option>Single</option>
              <option>Double</option>
              <option>Triple</option>
              <option>Suite</option>
              <option>Deluxe</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Arrival Date</div>
          <div className="relative">
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Reservation Status</div>
          <div className="relative">
            <select
              className={selectClass}
              value={reservationStatus}
              onChange={(e) => setReservationStatus(e.target.value as ReservationStatusFilter)}
            >
              <option>All status</option>
              <option>Confirmed</option>
              <option>Cancelled</option>
              <option>Checked in</option>
              <option>Checked out</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[0.9fr_1.3fr_0.6fr_0.9fr_0.9fr_0.6fr_0.8fr_1fr_1.2fr] bg-[#EAF2FF] px-5 py-3 text-[12px] font-bold text-slate-700">
          <div>Res.Id</div>
          <div>Guest</div>
          <div>Nights</div>
          <div>Arrival Date</div>
          <div>Departure Date</div>
          <div>Guests</div>
          <div>Status</div>
          <div>Allocation</div>
          <div className="text-right">Action</div>
        </div>

        {filteredRows.map((r, idx) => {
          const isAllocated = !!r.roomNumber
          const allocationText = isAllocated ? 'Allocated' : 'Not Allocated'
          const nights = getDifferenceInDays(r.checkInDate, r.checkOutDate)
          return (
            <div
              key={`${r.id}-${idx}`}
              className={[
                'grid grid-cols-[0.9fr_1.3fr_0.6fr_0.9fr_0.9fr_0.6fr_0.8fr_1fr_1.2fr] items-center px-5 py-3 text-[13px]',
                idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
              ].join(' ')}
            >
              <div className="font-medium text-slate-700">{r.id}</div>
              <div className="flex items-center gap-2 text-slate-700">
                <span className="truncate">{r.guestName}</span>
                <GuestDot name={r.guestName} />
              </div>
              <div className="text-slate-600">{nights}</div>
              <div className="text-slate-600">{formatDateForDisplay(r.checkInDate)}</div>
              <div className="text-slate-600">{formatDateForDisplay(r.checkOutDate)}</div>
              <div className="text-slate-600">—</div>
              <div className="text-slate-600">{r.status}</div>
              <div className="text-slate-600 flex items-center gap-1.5">
                {isAllocated && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Allocated" />
                )}
                <input
                  type="text"
                  placeholder="Room No."
                  className={[
                    "h-8 w-20 rounded-lg border px-2 text-[12px] font-semibold outline-none transition-all",
                    isAllocated 
                      ? "border-emerald-100 bg-emerald-50/50 text-emerald-700 focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" 
                      : "border-slate-200 bg-white text-slate-700 focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
                  ].join(" ")}
                  value={roomInputs[r.id] ?? ''}
                  onChange={(e) => setRoomInputs({ ...roomInputs, [r.id]: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-1.5 h-8 w-max whitespace-nowrap rounded-lg bg-[#0B4EA2] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0a3f85] disabled:bg-slate-300 disabled:cursor-not-allowed"
                  disabled={allocatingIds[r.id] || !(roomInputs[r.id] ?? '')}
                  onClick={async () => {
                    const roomNo = roomInputs[r.id] ?? ''
                    setAllocatingIds((prev) => ({ ...prev, [r.id]: true }))
                    try {
                      await dispatch(
                        assignRoom({
                          reservationId: r.id,
                          roomNumber: roomNo,
                        })
                      ).unwrap()
                      
                      // Refresh reservations list
                      await dispatch(
                        fetchPmsReservations({
                          startDate: computedDateRange.startDate,
                          endDate: computedDateRange.endDate,
                        })
                      ).unwrap()
                    } catch (error) {
                      console.error('Room allocation failed:', error)
                      alert('Failed to allocate room: ' + error)
                    } finally {
                      setAllocatingIds((prev) => ({ ...prev, [r.id]: false }))
                    }
                  }}
                >
                  {allocatingIds[r.id] ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      Allocating...
                    </>
                  ) : (
                    'Allocate Room'
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
