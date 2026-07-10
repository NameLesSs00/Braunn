import { useEffect, useMemo, useRef, useState } from 'react'

import { ChevronLeft, ChevronRight, Calendar, AlertCircle, Download } from 'lucide-react'
import { IoSearchSharp } from 'react-icons/io5'

import { IconImage } from '../../shared/ui/IconImage'

import { RoomPlanDetailsPopup } from './popups/RoomPlanDetailsPopup'
import { RoomPlanEmptyCellPopup } from './popups/RoomPlanEmptyCellPopup'
import { RoomPlanServiceBlockPopup } from './popups/RoomPlanServiceBlockPopup'
import { ReservationDetailsPopup } from '../reservations/pupops/ReservationDetailsPopup'

import {
  type RoomPlanBlock,
  type RoomPlanRoom,
  type RoomStatus,
  type RoomType,
} from './roomPlanMock'

import { useNewReservationModal } from '../../widgets/layout/DashboardLayout/NewReservationModalContext'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchRoomTypes } from '../../features/roomTypes/roomTypesSlice'
import { fetchRoomPlan } from '../../features/roomPlan/roomPlanSlice'
import type { RoomPlanBookingType, RoomPlanRoomStatus } from '../../models/RoomPlan'

type SelectOption<T extends string> = {
  value: T
  label: string
}

function addDays(d: Date, days: number) {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

function startOfDay(d: Date) {
  const next = new Date(d)
  next.setHours(0, 0, 0, 0)
  return next
}

function isoDate(d: Date) {
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function parseIsoDate(value: string) {
  const trimmed = value.trim()
  const [yyyy, mm, dd] = trimmed.split('-')
  if (!yyyy || !mm || !dd) return null
  const y = Number(yyyy)
  const m = Number(mm)
  const d = Number(dd)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  const date = new Date(y, m - 1, d)
  const t = date.getTime()
  return Number.isFinite(t) ? date : null
}

function dayLabel(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function dayNumber(d: Date) {
  return d.getDate()
}

function monthTitle(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function toUiRoomStatus(currentStatus?: string | null, housekeepingStatus?: string | null): RoomStatus {
  const status = `${currentStatus ?? ''} ${housekeepingStatus ?? ''}`.replace(/[\s_-]/g, '').toLowerCase()
  if (status.includes('maintenance')) return 'maintained'
  if (status.includes('cleaning')) return 'cleaning'
  if (status.includes('dirty')) return 'dirty'
  if (status.includes('checkedin') || status.includes('occupied')) return 'checked_in'
  if (status.includes('confirmed') || status.includes('reserved')) return 'confirmed'
  return 'available'
}

function toInclusiveBlockEnd(start: string, checkout: string) {
  const checkoutDate = parseIsoDate(checkout)
  if (!checkoutDate) return start
  const inclusiveEnd = isoDate(addDays(checkoutDate, -1))
  return inclusiveEnd < start ? start : inclusiveEnd
}

function RoomStatusDot({ status }: { status: RoomStatus }) {
  const colorClassName: Record<RoomStatus, string> = {
    confirmed: 'bg-[#F5A524]',
    checked_in: 'bg-[#22C55E]',
    available: 'bg-white border border-slate-300',
    cleaning: 'bg-[#8B8FA6]',
    maintained: 'bg-[#FF6B6B]',
    dirty: 'bg-pink-500',
  }

  return (
    <span
      className={['inline-block h-3 w-3 rounded', colorClassName[status]].join(' ')}
      title={status.replace('_', ' ')}
    />
  )
}

function SelectControl<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: SelectOption<T>[]
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-medium text-slate-700">{label}</div>
      <div className="relative">
        <select
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-600 outline-none focus:border-[#0B4EA2]"
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
      </div>
    </label>
  )
}

function DateControl({
  label,
  value,
  onChange,
  minDate,
  maxDate,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  minDate?: string
  maxDate?: string
}) {
  const showLabel = Boolean(label.trim())
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const selectedDate = useMemo(() => parseIsoDate(value), [value])
  const monthBase = useMemo(() => {
    const d = selectedDate ?? new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }, [selectedDate])
  const [month, setMonth] = useState(() => monthBase)

  useEffect(() => {
    setMonth(monthBase)
  }, [monthBase])

  useEffect(() => {
    if (!open) return

    const onMouseDown = (e: MouseEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }

    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const monthTitleText = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDayOffset = month.getDay()
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const formattedValue = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    : ''

  return (
    <div ref={rootRef} className="block">
      <div
        className={[
          'mb-2 text-[12px] font-medium text-slate-700',
          showLabel ? '' : 'select-none text-transparent',
        ].join(' ')}
      >
        {showLabel ? label : 'Date'}
      </div>
      <div className="relative">
        <button
          type="button"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-left text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open calendar"
        >
          {formattedValue || <span className="text-slate-400">MM/DD/YY</span>}
        </button>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
          <Calendar className="h-4 w-4" />
        </span>

        {open ? (
          <div className="absolute right-0 top-full z-50 mt-2 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-center text-[11px] font-semibold text-[#0B4EA2]">
              Maximum room-plan range: 10 days
            </div>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                aria-label="Previous month"
                onClick={() => {
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="text-sm font-semibold text-slate-800">{monthTitleText}</div>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                aria-label="Next month"
                onClick={() => {
                  setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="py-1 font-medium text-slate-400">
                  {d}
                </div>
              ))}

              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1
                const d = new Date(month.getFullYear(), month.getMonth(), day)
                const iso = isoDate(d)
                const active = value === iso
                const disabled = Boolean((minDate && iso < minDate) || (maxDate && iso > maxDate))
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    className={[
                      'h-9 w-9 rounded-xl text-sm font-semibold transition-colors',
                      disabled
                        ? 'cursor-not-allowed bg-slate-50 text-slate-300'
                        : active
                          ? 'bg-[#0B4EA2] text-white'
                          : 'text-slate-700 hover:bg-slate-100',
                    ].join(' ')}
                    onClick={() => {
                      onChange(iso)
                      setOpen(false)
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function dayIndexWithinRange(rangeStart: Date, dayIso: string) {
  const d = parseIsoDate(dayIso)
  if (!d) return null
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(rangeStart).getTime()) / 86400000)
  return diff
}

function blockTheme(type: RoomPlanBlock['type'], roomStatus?: RoomStatus) {
  if (type === 'cleaning') {
    return {
      bg: 'bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-700',
      icons: null as null | { primary: string; secondary: string },
    }
  }

  if (type === 'maintenance') {
    return {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      icons: null as null | { primary: string; secondary: string },
    }
  }

  return {
    bg:
      roomStatus === 'confirmed'
        ? 'bg-amber-50'
        : roomStatus === 'maintained'
          ? 'bg-rose-50'
          : roomStatus === 'cleaning'
            ? 'bg-slate-100'
            : 'bg-emerald-50',
    border:
      roomStatus === 'confirmed'
        ? 'border-amber-300'
        : roomStatus === 'maintained'
          ? 'border-rose-300'
          : roomStatus === 'cleaning'
            ? 'border-slate-300'
            : 'border-emerald-300',
    text: roomStatus === 'maintained' ? 'text-rose-700' : 'text-slate-800',
    icons: { primary: 'text-[#F5A524]', secondary: 'text-[#0B4EA2]' },
  }
}


export function RoomPlanPage() {
  const { openNewReservation } = useNewReservationModal()

  const dispatch = useAppDispatch()
  const roomTypes = useAppSelector((s) => s.roomTypes.items)
  const roomPlanData = useAppSelector((s) => s.roomPlan.data)
  const roomPlanStatus = useAppSelector((s) => s.roomPlan.status)
  const roomPlanError = useAppSelector((s) => s.roomPlan.error)

  useEffect(() => {
    void dispatch(fetchRoomTypes())
  }, [dispatch])

  const [search, setSearch] = useState('')
  const [roomType, setRoomType] = useState<'all' | string>('all')
  const [roomStatus, setRoomStatus] = useState<'all' | RoomPlanRoomStatus>('all')
  const [floor, setFloor] = useState<'all' | string>('all')
  const [bookingType, setBookingType] = useState<'all' | RoomPlanBookingType>('all')

  const [fromDateIso, setFromDateIso] = useState(() => isoDate(new Date()))
  const [toDateIso, setToDateIso] = useState(() => isoDate(addDays(new Date(), 6)))

  const fromDate = useMemo(() => parseIsoDate(fromDateIso) ?? new Date(), [fromDateIso])
  const toDate = useMemo(() => parseIsoDate(toDateIso) ?? addDays(fromDate, 6), [toDateIso, fromDate])

  const rangeStart = useMemo(() => startOfDay(fromDate), [fromDate])
  const rangeEnd = useMemo(() => startOfDay(toDate), [toDate])
  const dayCount = useMemo(() => {
    const diff = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000)
    return clamp(diff + 1, 1, 10)
  }, [rangeEnd, rangeStart])

  const rangeDays = useMemo(() => Array.from({ length: dayCount }).map((_, i) => addDays(rangeStart, i)), [dayCount, rangeStart])

  const [roomPopupOpen, setRoomPopupOpen] = useState(false)
  const [roomPopupRoomId, setRoomPopupRoomId] = useState<string | null>(null)
  const [roomPopupBlockId, setRoomPopupBlockId] = useState<string | null>(null)
  const [roomPopupMode, setRoomPopupMode] = useState<'check_in' | 'check_out'>('check_in')

  const [reservationDetailsOpen, setReservationDetailsOpen] = useState(false)
  const [reservationDetailsId, setReservationDetailsId] = useState<string | null>(null)
  const [reservationDetailsStatus, setReservationDetailsStatus] = useState<string | null>(null)

  const [emptyPopupOpen, setEmptyPopupOpen] = useState(false)
  const [emptyPopupRoomId, setEmptyPopupRoomId] = useState<string | null>(null)
  const [emptyPopupDateIso, setEmptyPopupDateIso] = useState<string | null>(null)
  const [emptyPopupEndDateIso, setEmptyPopupEndDateIso] = useState<string | null>(null)

  const [servicePopupOpen, setServicePopupOpen] = useState(false)
  const [servicePopupRoomId, setServicePopupRoomId] = useState<string | null>(null)
  const [servicePopupBlockId, setServicePopupBlockId] = useState<string | null>(null)
  const [servicePopupDateIso, setServicePopupDateIso] = useState<string | null>(null)

  const [selection, setSelection] = useState<{ roomId: string; start: string; end: string; isValid: boolean } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    const request = dispatch(fetchRoomPlan({
      from: fromDateIso,
      to: toDateIso,
      roomTypeId: roomType === 'all' ? undefined : roomType,
      floor: floor === 'all' ? undefined : floor,
      roomStatus: roomStatus === 'all' ? undefined : roomStatus,
      bookingType: bookingType === 'all' ? undefined : bookingType,
    }))
    return () => request.abort()
  }, [bookingType, dispatch, floor, fromDateIso, roomStatus, roomType, toDateIso])

  const refreshRoomPlan = () => {
    void dispatch(fetchRoomPlan({
      from: fromDateIso,
      to: toDateIso,
      roomTypeId: roomType === 'all' ? undefined : roomType,
      floor: floor === 'all' ? undefined : floor,
      roomStatus: roomStatus === 'all' ? undefined : roomStatus,
      bookingType: bookingType === 'all' ? undefined : bookingType,
    }))
  }

  const allRooms = useMemo<RoomPlanRoom[]>(() => (roomPlanData?.rooms ?? []).map((room) => ({
    id: room.roomId,
    number: room.roomNumber ?? '-----',
    type: (room.roomTypeName?.toLowerCase() ?? 'unknown') as RoomType,
    status: toUiRoomStatus(room.currentRoomStatus, room.housekeepingStatus),
    currentRoomStatus: room.currentRoomStatus,
    floor: room.floor ?? '-----',
    bookingType: bookingType === 'all' ? '' : bookingType,
    housekeeping: (room.housekeepingStatus ?? '').toLowerCase() === 'dirty' ? 'dirty' : 'clean',
    view: 'city_view',
  })), [bookingType, roomPlanData])

  const blocks = useMemo<RoomPlanBlock[]>(() => (roomPlanData?.rooms ?? []).flatMap((room) =>
    (room.blocks ?? []).map((block) => {
      const matchingDay = room.days?.find((day) => day.reservationId === block.reservationId)
      return {
        id: block.reservationRoomId || block.reservationId,
        reservationId: block.reservationId,
        reservationStatus: matchingDay?.reservationStatus ?? block.status,
        paymentStatus: matchingDay?.paymentStatus ?? null,
        roomId: room.roomId,
        type: 'reservation',
        title: block.guestName || block.displayText || 'Reservation',
        subtitle: `${block.checkInDate} - ${block.checkOutDate}`,
        checkInDate: block.checkInDate,
        checkOutDate: block.checkOutDate,
        start: block.startDate,
        end: toInclusiveBlockEnd(block.startDate, block.endDate),
      }
    })
  ), [roomPlanData])

  const roomById = useMemo(() => {
    const m = new Map<string, (typeof allRooms)[number]>()
    for (const r of allRooms) m.set(r.id, r)
    return m
  }, [allRooms])

  const blockById = useMemo(() => {
    const m = new Map<string, RoomPlanBlock>()
    for (const b of blocks) m.set(b.id, b)
    return m
  }, [blocks])

  const popupRoom = roomPopupRoomId ? roomById.get(roomPopupRoomId) : undefined
  const popupBlock = roomPopupBlockId ? blockById.get(roomPopupBlockId) : undefined

  const emptyRoom = emptyPopupRoomId ? roomById.get(emptyPopupRoomId) : undefined
  const emptyDate = useMemo(() => {
    const d = emptyPopupDateIso ? parseIsoDate(emptyPopupDateIso) : null
    return d ?? fromDate
  }, [emptyPopupDateIso, fromDate])

  const emptyEndDate = useMemo(() => {
    const d = emptyPopupEndDateIso ? parseIsoDate(emptyPopupEndDateIso) : null
    return d ?? undefined
  }, [emptyPopupEndDateIso])

  const serviceRoom = servicePopupRoomId ? roomById.get(servicePopupRoomId) : undefined
  const serviceBlock = servicePopupBlockId ? blockById.get(servicePopupBlockId) : undefined
  const serviceDate = useMemo(() => {
    const d = servicePopupDateIso ? parseIsoDate(servicePopupDateIso) : null
    return d ?? fromDate
  }, [fromDate, servicePopupDateIso])

  const openRoomPopup = (roomId: string, blockId: string, mode: 'check_in' | 'check_out') => {
    setRoomPopupRoomId(roomId)
    setRoomPopupBlockId(blockId)
    setRoomPopupMode(mode)
    setRoomPopupOpen(true)
  }

  const openEmptyPopup = (roomId: string, isoDay: string, endIsoDay?: string) => {
    setEmptyPopupRoomId(roomId)
    setEmptyPopupDateIso(isoDay)
    setEmptyPopupEndDateIso(endIsoDay ?? null)
    setEmptyPopupOpen(true)
  }

  const openServicePopup = (roomId: string, blockId: string, isoDay: string) => {
    setServicePopupRoomId(roomId)
    setServicePopupBlockId(blockId)
    setServicePopupDateIso(isoDay)
    setServicePopupOpen(true)
  }

  const roomTypeOptions = useMemo<SelectOption<'all' | string>[]>(() => [
    { value: 'all', label: 'All types' },
    ...roomTypes.map((type) => ({ value: type.id, label: type.name })),
  ], [roomTypes])

  const roomStatusOptions: SelectOption<'all' | RoomPlanRoomStatus>[] = [
    { value: 'all', label: 'All status' },
    { value: 'Available', label: 'Available' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'CheckedIn', label: 'Checked In' },
    { value: 'Dirty', label: 'Dirty' },
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Maintenance', label: 'Maintenance' },
  ]

  const bookingTypeOptions: SelectOption<'all' | RoomPlanBookingType>[] = [
    { value: 'all', label: 'All type' },
    { value: 'Direct', label: 'Direct' },
    { value: 'OTA', label: 'OTA' },
    { value: 'Corporate', label: 'Corporate' },
  ]

  const floorOptions: SelectOption<'all' | string>[] = [
    { value: 'all', label: 'All floors' },
    ...['1', '2', '3', '4', '5'].map((value) => ({ value, label: `Floor ${value}` })),
  ]

  const filteredRooms = useMemo(() => {
    let result = allRooms

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter((r) => r.number.toLowerCase().includes(q))
    }

    return result
  }, [allRooms, search])

  const blocksByRoomId = useMemo(() => {
    const m = new Map<string, RoomPlanBlock[]>()
    for (const b of blocks) {
      const list = m.get(b.roomId) ?? []
      list.push(b)
      m.set(b.roomId, list)
    }
    return m
  }, [blocks])

  const onPrevWeek = () => {
    setFromDateIso(isoDate(addDays(rangeStart, -7)))
    setToDateIso(isoDate(addDays(rangeEnd, -7)))
  }

  const onNextWeek = () => {
    setFromDateIso(isoDate(addDays(rangeStart, 7)))
    setToDateIso(isoDate(addDays(rangeEnd, 7)))
  }

  const isSelectionInvalid = (roomId: string, startIso: string, endIso: string) => {
    const roomBlocks = blocksByRoomId.get(roomId) ?? []
    const [s, e] = startIso < endIso ? [startIso, endIso] : [endIso, startIso]

    return roomBlocks.some((b) => {
      // Overlap if max(start1, start2) <= min(end1, end2)
      const overlapStart = s > b.start ? s : b.start
      const overlapEnd = e < b.end ? e : b.end
      return overlapStart <= overlapEnd
    })
  }

  const handlePointerDown = (roomId: string, isoDay: string) => {
    const invalid = isSelectionInvalid(roomId, isoDay, isoDay)
    setSelection({ roomId, start: isoDay, end: isoDay, isValid: !invalid })
    setIsSelecting(true)
  }

  const handlePointerEnter = (roomId: string, isoDay: string) => {
    if (isSelecting && selection && selection.roomId === roomId) {
      const invalid = isSelectionInvalid(roomId, selection.start, isoDay)
      setSelection({ ...selection, end: isoDay, isValid: !invalid })
    }
  }

  useEffect(() => {
    const handlePointerUp = () => {
      if (isSelecting && selection?.isValid) {
        const [s, e] = selection.start < selection.end ? [selection.start, selection.end] : [selection.end, selection.start]
        openEmptyPopup(selection.roomId, s, e)
      }
      setSelection(null)
      setIsSelecting(false)
    }

    const handlePointerCancel = () => {
      setSelection(null)
      setIsSelecting(false)
    }

    if (isSelecting) {
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerCancel)
    }
    return () => {
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
    }
  }, [isSelecting, selection])

  const selectionRange = useMemo(() => {
    if (!selection) return null
    const [s, e] = selection.start < selection.end ? [selection.start, selection.end] : [selection.end, selection.start]
    return { start: s, end: e, isValid: selection.isValid }
  }, [selection])

  const isDaySelected = (roomId: string, isoDay: string) => {
    if (!selection || selection.roomId !== roomId || !selectionRange) return false
    return isoDay >= selectionRange.start && isoDay <= selectionRange.end
  }

  return (
    <div className="space-y-6 select-none">
      <RoomPlanDetailsPopup
        open={roomPopupOpen}
        onClose={() => {
          setRoomPopupOpen(false)
          setRoomPopupRoomId(null)
          setRoomPopupBlockId(null)
        }}
        onViewReservation={() => {
          if (!popupBlock?.reservationId) return
          setRoomPopupOpen(false)
          setReservationDetailsId(popupBlock.reservationId)
          setReservationDetailsStatus(popupBlock.reservationStatus ?? null)
          setReservationDetailsOpen(true)
        }}
        room={popupRoom}
        block={popupBlock}
        focusDate={fromDate}
        mode={roomPopupMode}
        onRefresh={refreshRoomPlan}
      />

      <ReservationDetailsPopup
        open={reservationDetailsOpen}
        onClose={() => {
          setReservationDetailsOpen(false)
          setReservationDetailsId(null)
          setReservationDetailsStatus(null)
        }}
        reservationId={reservationDetailsId}
        reservationStatus={reservationDetailsStatus}
      />

      <RoomPlanEmptyCellPopup
        open={emptyPopupOpen}
        onClose={() => {
          setEmptyPopupOpen(false)
          setEmptyPopupRoomId(null)
          setEmptyPopupDateIso(null)
          setEmptyPopupEndDateIso(null)
        }}
        room={emptyRoom}
        date={emptyDate}
        endDate={emptyEndDate}
        onAddReservation={() => openNewReservation()}
      />

      <RoomPlanServiceBlockPopup
        open={servicePopupOpen}
        onClose={() => {
          setServicePopupOpen(false)
          setServicePopupRoomId(null)
          setServicePopupBlockId(null)
          setServicePopupDateIso(null)
        }}
        room={serviceRoom}
        block={serviceBlock}
        date={serviceDate}
      />
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative w-full max-w-xl">
            <input
              className="h-12 w-full rounded-full bg-[#F3F5FF] px-6 pr-12 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search by room number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconImage
              src={IoSearchSharp}
              alt="Search"
              className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
            />
          </div>

          <div className="text-sm font-semibold text-slate-600">
            Showing {filteredRooms.length} rooms of {allRooms.length}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <SelectControl label="Room Type" value={roomType} onChange={setRoomType} options={roomTypeOptions} />
          <SelectControl label="Room Status" value={roomStatus} onChange={setRoomStatus} options={roomStatusOptions} />
          <SelectControl label="Floor" value={floor} onChange={setFloor} options={floorOptions} />
          <SelectControl label="Booking Type" value={bookingType} onChange={setBookingType} options={bookingTypeOptions} />
          <DateControl
            label="From"
            value={fromDateIso}
            onChange={(next) => {
              const nextFrom = parseIsoDate(next)
              const currentTo = parseIsoDate(toDateIso)
              setFromDateIso(next)
              if (nextFrom && currentTo && startOfDay(currentTo).getTime() < startOfDay(nextFrom).getTime()) {
                setToDateIso(next)
              } else if (nextFrom && currentTo && startOfDay(currentTo).getTime() > addDays(startOfDay(nextFrom), 9).getTime()) {
                setToDateIso(isoDate(addDays(nextFrom, 9)))
              }
            }}
          />
          <DateControl
            label="To"
            value={toDateIso}
            minDate={fromDateIso}
            maxDate={isoDate(addDays(fromDate, 9))}
            onChange={(next) => {
              const currentFrom = parseIsoDate(fromDateIso)
              const nextTo = parseIsoDate(next)
              if (currentFrom && nextTo && startOfDay(nextTo).getTime() < startOfDay(currentFrom).getTime()) {
                setToDateIso(next)
                setFromDateIso(next)
              } else if (currentFrom && nextTo && startOfDay(nextTo).getTime() > addDays(startOfDay(currentFrom), 9).getTime()) {
                setToDateIso(isoDate(addDays(currentFrom, 9)))
              } else {
                setToDateIso(next)
              }
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-5 text-[12px] font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <RoomStatusDot status="confirmed" />
              Confirmed
            </div>
            <div className="flex items-center gap-2">
              <RoomStatusDot status="checked_in" />
              Occupied
            </div>
            <div className="flex items-center gap-2">
              <RoomStatusDot status="available" />
              Available
            </div>
            <div className="flex items-center gap-2">
              <RoomStatusDot status="cleaning" />
              Cleaning
            </div>
            <div className="flex items-center gap-2">
              <RoomStatusDot status="dirty" />
              Dirty
            </div>
            <div className="flex items-center gap-2">
              <RoomStatusDot status="maintained" />
              Maintenance
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* ── Period & Room-Type Summary Row ─────────────────────────────── */}
      {(() => {
        const fmtDate = (d: Date) =>
          d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })

        const cleanCount = filteredRooms.filter((r) => r.housekeeping === 'clean').length
        const dirtyCount = filteredRooms.filter((r) => r.housekeeping === 'dirty').length

        const maintenanceCount = filteredRooms.filter((r) => r.status === 'maintained').length
        const cleaningCount = filteredRooms.filter((r) => r.status === 'cleaning').length

        const roomOpsMeta: Array<{ key: string; label: string; count: number; color: string; bg: string; dot: string }> = [
          { key: 'clean', label: 'Clean', count: cleanCount, color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-600' },
          { key: 'dirty', label: 'Dirty', count: dirtyCount, color: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-600' },
          { key: 'maintenance', label: 'Maintenance', count: maintenanceCount, color: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500' },
          { key: 'cleaning', label: 'Cleaning', count: cleaningCount, color: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-500' },
        ]

        const activeFilters: string[] = []
        if (roomType !== 'all') {
          activeFilters.push(`Room Type: ${roomTypes.find((type) => type.id === roomType)?.name ?? roomType}`)
        }
        if (roomStatus !== 'all') activeFilters.push(`Status: ${roomStatus}`)
        if (floor !== 'all') activeFilters.push(`Floor: ${floor}`)
        if (bookingType !== 'all') activeFilters.push(`Booking: ${bookingType}`)
        if (search.trim()) activeFilters.push(`Search: "${search.trim()}"`)

        return (
          <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 shadow-sm border border-amber-100/70">
            <div className="flex w-full flex-wrap items-center justify-between gap-6">

              {/* Period block */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/70">
                  <Calendar className="h-5 w-5 text-amber-800" />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-amber-700/70">Period</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-slate-900">{fmtDate(fromDate)}</span>
                    <span className="text-amber-600 text-xs">→</span>
                    <span className="text-sm font-bold text-slate-900">{fmtDate(toDate)}</span>
                    <span className="inline-flex items-center rounded-full bg-amber-100/70 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                      {dayCount} {dayCount === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden h-10 w-px bg-amber-200/70 md:block" />

              {/* Room operational counts */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700/70 mr-1">Rooms</span>
                {roomOpsMeta.map(({ key, label, color, bg, dot, count }) => (
                  <div
                    key={key}
                    className={`flex items-center gap-1.5 rounded-full ${bg} px-3 py-1`}
                  >
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <span className={`text-[12px] font-semibold ${color}`}>{label}</span>
                    <span className={`text-[12px] font-bold ${color}`}>{count}</span>
                  </div>
                ))}
                {/* Total pill */}
                <div className="flex items-center gap-1.5 rounded-full bg-amber-100/70 px-3 py-1">
                  <span className="text-[12px] font-bold text-amber-900">Total: {filteredRooms.length}</span>
                </div>
              </div>

              {/* Active filter tags */}
              {activeFilters.length > 0 && (
                <>
                  <div className="hidden h-10 w-px bg-amber-200/70 md:block" />
                  <div className="flex flex-wrap items-center gap-2 max-w-full">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700/70 mr-1">Filters</span>
                    {activeFilters.map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-[11px] font-medium text-amber-900"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        )
      })()}

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="sticky top-0 z-30 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between px-6 py-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Previous"
              onClick={onPrevWeek}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-sm font-semibold text-slate-800">{monthTitle(rangeStart)}</div>

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Next"
              onClick={onNextWeek}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-[160px_1fr] border-y border-slate-200">
            <div className="border-r border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">Room</div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))` }}>
              {rangeDays.map((d) => {
                const iso = isoDate(d)
                const isFocus = iso === isoDate(new Date())
                return (
                  <div key={iso} className="border-r border-slate-100 px-2 py-2 text-center">
                    <div className="text-[12px] font-semibold text-slate-600">{dayLabel(d)}</div>
                    <div
                      className={[
                        'mx-auto mt-2 grid h-9 w-9 place-items-center rounded-xl text-sm font-semibold',
                        isFocus ? 'bg-[#0B4EA2] text-white' : 'text-slate-700',
                      ].join(' ')}
                    >
                      {dayNumber(d)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          {roomPlanStatus === 'loading' ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
              <p className="mt-3 text-sm font-medium text-slate-500">Loading room plan...</p>
            </div>
          ) : roomPlanStatus === 'failed' ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-rose-600">Unable to load the room plan</p>
              <p className="mt-1 text-xs text-slate-500">{roomPlanError}</p>
            </div>
          ) : filteredRooms.length > 0 ? (
            <div>
              {filteredRooms.map((room, idx) => {
                const roomBlocks = blocksByRoomId.get(room.id) ?? []

                return (
                    <div
                    key={room.id}
                    className={[
                      'grid grid-cols-[160px_1fr]',
                      idx % 2 === 1 ? 'bg-[#FBFDFF]' : 'bg-white',
                    ].join(' ')}
                  >
                    <div className="border-r border-slate-100 px-4 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-slate-800">Room {room.number}</div>
                            <RoomStatusDot status={room.status} />
                          </div>
                          <div className="mt-1 text-[12px] text-slate-500">{room.type}</div>
                        </div>
                      </div>

                    </div>

                    <div className="relative grid" style={{ gridTemplateColumns: `repeat(${dayCount}, minmax(0, 1fr))` }}>
                      {rangeDays.map((d) => {
                        const iso = isoDate(d)
                        const selected = isDaySelected(room.id, iso)

                        return (
                          <div
                            key={iso}
                            className={[
                              'relative min-h-[52px] border-r border-slate-100 border-b border-slate-100 cursor-pointer transition-colors',
                              selected ? (selectionRange?.isValid ? 'bg-[#0B4EA2]/10' : 'bg-rose-500/10') : 'hover:bg-slate-50/50',
                            ].join(' ')}
                            onPointerDown={() => handlePointerDown(room.id, iso)}
                            onPointerEnter={() => handlePointerEnter(room.id, iso)}
                          >
                            {selected && (
                              <div
                                className={[
                                  'absolute inset-0 z-0 bg-[#0B4EA2]/20 ring-1 ring-inset',
                                  selectionRange?.isValid ? 'ring-[#0B4EA2]/30' : 'bg-rose-500/20 ring-rose-500/30',
                                ].join(' ')}
                              />
                            )}
                          </div>
                        )
                      })}

                      {roomBlocks.map((b) => {
                        const startIdxRaw = dayIndexWithinRange(rangeStart, b.start)
                        const endIdxRaw = dayIndexWithinRange(rangeStart, b.end)
                        if (startIdxRaw == null || endIdxRaw == null) return null

                        if (endIdxRaw < 0 || startIdxRaw > dayCount - 1) return null

                        const startIdx = clamp(startIdxRaw, 0, dayCount - 1)
                        const endIdx = clamp(endIdxRaw, 0, dayCount - 1)
                        const span = Math.max(1, endIdx - startIdx + 1)
                        const singleDay = span === 1

                        const theme = blockTheme(b.type, room.status)
                        const isServiceBlock = b.type === 'maintenance' || b.type === 'cleaning'

                        return (
                          <div
                            key={b.id}
                            className={[
                              'group absolute top-1 z-10 h-[44px] overflow-hidden rounded-lg border px-3 py-1',
                              theme.icons ? 'pr-10' : '',
                              singleDay ? 'py-2' : '',
                              theme.bg,
                              theme.border,
                              theme.text,
                              isServiceBlock ? 'cursor-pointer' : '',
                            ].join(' ')}
                            style={{
                              left: `calc(${startIdx} * (100% / ${dayCount}) + 8px)`,
                              width: `calc(${span} * (100% / ${dayCount}) - 16px)`,
                            }}
                            onClick={
                              isServiceBlock
                                ? () => {
                                    openServicePopup(room.id, b.id, b.start)
                                  }
                                : undefined
                            }
                          >
                            {theme.icons ? (
                              <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                                <button
                                  type="button"
                                  className={[
                                    'grid h-6 w-6 place-items-center rounded-full bg-white/70 hover:bg-white',
                                  ].join(' ')}
                                  aria-label="Block action 1"
                                  onClick={() => openRoomPopup(room.id, b.id, 'check_in')}
                                >
                                  <AlertCircle className="h-4 w-4 text-[#D28B00]" />
                                </button>
                                <button
                                  type="button"
                                  className={[
                                    'grid h-6 w-6 place-items-center rounded-full bg-white/70 hover:bg-white',
                                  ].join(' ')}
                                  aria-label="Block action 2"
                                  onClick={() => openRoomPopup(room.id, b.id, 'check_out')}
                                >
                                  <IconImage
                                    src="/assets/RoomPlan/roomplane2.png"
                                    alt="action"
                                    className="h-3.5 w-3.5"
                                  />
                                </button>
                              </div>
                            ) : null}
                            <div className="truncate text-[12px] font-semibold">{b.title}</div>
                            <div className="mt-0.5 flex items-center overflow-hidden">
                              <div className={['truncate text-[10px] opacity-70', singleDay ? 'pr-1' : ''].join(' ')}>
                                <span className="font-bold capitalize">{room.status.replace('_', ' ')}</span>
                                {b.subtitle ? ` • ${b.subtitle}` : ''}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-sm text-slate-500">No rooms match the current filters</div>
          )}
        </div>
      </div>
    </div>
  )
}
