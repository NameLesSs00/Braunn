import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchRoomAllocationReservations } from '../../features/pms/pmsSlice'
import { routes } from '../../shared/lib/routes'

type AllocationStatusFilter = 'All status' | 'Allocated' | 'Not Allocated'
type FloorFilter = 'All Floor' | '1' | '2' | '3' | '4' | '5'
type RoomTypeFilter = 'All Types' | 'Single' | 'Double' | 'Triple' | 'Suite' | 'Deluxe'
type SourceFilter = 'All Sources' | string

const roomAllocationFiltersStorageKey = 'room-allocation-page-filters'

interface RoomAllocationFilters {
  query: string
  allocationStatus: AllocationStatusFilter
  floor: FloorFilter
  roomType: RoomTypeFilter
  source: SourceFilter
  arrivalDate: string
  departureDate: string
}

function getSavedRoomAllocationFilters(defaults: RoomAllocationFilters): RoomAllocationFilters {
  try {
    const saved = sessionStorage.getItem(roomAllocationFiltersStorageKey)
    if (!saved) return defaults

    const filters = { ...defaults, ...JSON.parse(saved) }
    return filters
  } catch {
    return defaults
  }
}

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

function normalizeSource(value?: string | null) {
  return (value || '').replace(/[\s_-]/g, '').toLowerCase()
}

function getReservationSourceLabel(reservation: { bookingSource?: string | null; sourceType?: string | null; channelName?: string | null; reservationType?: string | null }) {
  return reservation.bookingSource || reservation.sourceType || reservation.channelName || reservation.reservationType || '-----'
}

export function RoomAllocationPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const pmsReservations = useAppSelector((s) => s.pms.roomAllocationRows)
  const roomAllocationLoading = useAppSelector((s) => s.pms.roomAllocationStatus === 'loading')

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const defaultEndDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  }, [])
  const initialFilters = useMemo(() => getSavedRoomAllocationFilters({
    query: '',
    allocationStatus: 'All status',
    floor: 'All Floor',
    roomType: 'All Types',
    source: 'All Sources',
    arrivalDate: today,
    departureDate: defaultEndDate,
  }), [defaultEndDate, today])

  const [query, setQuery] = useState(initialFilters.query)
  const [allocationStatus, setAllocationStatus] = useState<AllocationStatusFilter>(initialFilters.allocationStatus)
  const [floor, setFloor] = useState<FloorFilter>(initialFilters.floor)
  const [roomType, setRoomType] = useState<RoomTypeFilter>(initialFilters.roomType)
  const [source, setSource] = useState<SourceFilter>(initialFilters.source)
  const [arrivalDate, setArrivalDate] = useState(initialFilters.arrivalDate)
  const [departureDate, setDepartureDate] = useState(initialFilters.departureDate)

  useEffect(() => {
    const filters: RoomAllocationFilters = {
      query,
      allocationStatus,
      floor,
      roomType,
      source,
      arrivalDate,
      departureDate,
    }

    sessionStorage.setItem(roomAllocationFiltersStorageKey, JSON.stringify(filters))
  }, [query, allocationStatus, floor, roomType, source, arrivalDate, departureDate])

  const computedDateRange = useMemo(() => ({
    startDate: arrivalDate || today,
    endDate: departureDate || defaultEndDate,
  }), [arrivalDate, departureDate, today, defaultEndDate])

  useEffect(() => {
    const request = dispatch(
      fetchRoomAllocationReservations({
        startDate: computedDateRange.startDate,
        endDate: computedDateRange.endDate,
      })
    )
    return () => request.abort()
  }, [dispatch, computedDateRange])

  const activeRows = useMemo(() => {
    return pmsReservations.filter((reservation) => {
      const status = (reservation.status ?? '').replace(/[\s_-]/g, '').toLowerCase()
      return status !== 'checkedout' && status !== 'checkedin'
    })
  }, [pmsReservations])

  const sourceOptions = useMemo(() => {
    return Array.from(new Set(
      activeRows
        .map((reservation) => getReservationSourceLabel(reservation))
        .filter((value) => value && value !== '-----')
    )).sort((a, b) => a.localeCompare(b))
  }, [activeRows])

  const filteredRows = useMemo(() => {
    let result = activeRows
    const q = query.trim().toLowerCase()

    if (q) {
      result = result.filter((r) =>
        [r.guestName, r.id, getReservationSourceLabel(r)].some((v) => (v ?? '').toLowerCase().includes(q))
      )
    }

    if (allocationStatus !== 'All status') {
      result = result.filter((r) => {
        const isAllocated = !!r.roomNumber
        return allocationStatus === 'Allocated' ? isAllocated : !isAllocated
      })
    }

    if (arrivalDate) {
      result = result.filter((r) => r.checkInDate.slice(0, 10) >= arrivalDate)
    }

    if (departureDate) {
      result = result.filter((r) => r.checkOutDate.slice(0, 10) <= departureDate)
    }

    if (floor !== 'All Floor') {
      result = result.filter((r) => r.roomNumber && r.roomNumber.trim().startsWith(floor))
    }

    if (roomType !== 'All Types') {
      result = result.filter((r) =>
        r.roomTypeName?.toLowerCase().includes(roomType.toLowerCase())
      )
    }

    if (source !== 'All Sources') {
      result = result.filter((r) => normalizeSource(getReservationSourceLabel(r)) === normalizeSource(source))
    }

    return result
  }, [activeRows, query, allocationStatus, arrivalDate, departureDate, floor, roomType, source])

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

        <button
          type="button"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#0B4EA2] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#093d81] active:scale-[0.98]"
          onClick={() => navigate(routes.roomAllocationGroup)}
        >
          Allocate All
        </button>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm font-semibold text-slate-700">{filteredRows.length} results</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
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
          <div className="text-[12px] font-semibold text-slate-700">Source</div>
          <div className="relative">
            <select
              className={selectClass}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option>All Sources</option>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Arrival Date</div>
          <div className="relative">
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[12px] font-semibold text-slate-700">Departure Date</div>
          <div className="relative">
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={departureDate}
              min={arrivalDate}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
        <div className="grid grid-cols-[1.5fr_0.7fr_1.1fr_1.1fr_0.8fr_1fr_1fr_1.2fr] bg-[#EAF2FF] px-5 py-3 text-[12px] font-bold text-slate-700">
          <div>Guest</div>
          <div>Nights</div>
          <div>Arrival Date</div>
          <div>Departure Date</div>
          <div>Status</div>
          <div>Allocation</div>
          <div>Source</div>
          <div className="text-right">Action</div>
        </div>

        <div className="min-h-[360px] flex flex-col">
          {roomAllocationLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading room allocations...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-700">No rooms found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            filteredRows.map((r, idx) => {
              const isAllocated = !!r.roomNumber
              const nights = getDifferenceInDays(r.checkInDate, r.checkOutDate)
              return (
                <div
                  key={`${r.id}-${idx}`}
                  className={[
                    'grid grid-cols-[1.5fr_0.7fr_1.1fr_1.1fr_0.8fr_1fr_1fr_1.2fr] items-center px-5 py-3 text-[13px]',
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#F4F9FF]',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="truncate">{r.guestName}</span>
                  </div>
                  <div className="text-slate-600">{nights}</div>
                  <div className="text-slate-600">{formatDateForDisplay(r.checkInDate)}</div>
                  <div className="text-slate-600">{formatDateForDisplay(r.checkOutDate)}</div>
                  <div className="text-slate-600">{r.status}</div>
                  <div className="text-slate-600 flex items-center gap-1.5 font-medium">
                    {isAllocated ? (
                      <>
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-emerald-700">Allocated</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
                        <span>Not Allocated</span>
                      </>
                    )}
                  </div>
                  <div className="truncate text-slate-600">{getReservationSourceLabel(r)}</div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-1.5 h-8 w-28 whitespace-nowrap rounded-lg bg-[#0B4EA2] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#0a3f85]"
                      onClick={() => {
                        navigate(`/room-allocation/${r.id}`)
                      }}
                    >
                      Allocate Room
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
