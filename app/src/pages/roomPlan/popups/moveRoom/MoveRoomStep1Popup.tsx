import { CalendarDays, ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Modal } from '../../../../shared/ui/Modal'
import type { RoomPlanBlock, RoomPlanRoom } from '../../roomPlanMock'

// ---------- types ----------

type MovementReason = 'client_request' | 'another_reason' | ''
type MoveConfig = 'remaining_stay' | 'specific_dates'

export type MoveRoomStep1Data = {
  movementReason: MovementReason
  anotherReasonText: string
  moveConfig: MoveConfig
  startDate: string
  endDate: string
  floor: string
  roomType: string
  roomView: string
  availableOnly: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  onContinue: (data: MoveRoomStep1Data) => void
  room?: RoomPlanRoom
  block?: RoomPlanBlock
}

// ---------- helpers ----------

function titleCase(v: string) {
  return v
    .trim()
    .split(/[\s_]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function formatDate(iso?: string) {
  if (!iso) return '-'
  const [yyyy, mm, dd] = iso.split('-')
  if (!yyyy || !mm || !dd) return '-'
  return `${mm}/${dd}/${yyyy.slice(2)}`
}

function rateByRoomType(type: RoomPlanRoom['type']) {
  if (type === 'single') return 120
  if (type === 'double') return 160
  if (type === 'suite') return 220
  return 180
}

// ---------- sub-components ----------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-[12px] font-semibold text-slate-800">{value}</span>
    </div>
  )
}

interface SelectDropdownProps {
  options: { label: string; value: string }[]
  value: string
  placeholder: string
  onChange: (v: string) => void
}

function SelectDropdown({ options, value, placeholder, onChange }: SelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-[12px] text-slate-700 hover:border-[#0B4EA2] focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`flex w-full px-3 py-2 text-left text-[12px] hover:bg-slate-50 ${
                value === opt.value ? 'font-semibold text-[#0B4EA2]' : 'text-slate-700'
              }`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- main component ----------

const MOVEMENT_REASON_OPTIONS = [
  { value: 'client_request', label: 'Client request' },
  { value: 'another_reason', label: 'Another reason' },
]

const FLOOR_OPTIONS = [
  { value: '1', label: 'Floor 1' },
  { value: '2', label: 'Floor 2' },
  { value: '3', label: 'Floor 3' },
  { value: '4', label: 'Floor 4' },
]

const ROOM_TYPE_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'suite', label: 'Suite' },
  { value: 'deluxe', label: 'Deluxe' },
]

const ROOM_VIEW_OPTIONS = [
  { value: 'garden_view', label: 'Garden view' },
  { value: 'sea_view', label: 'Sea view' },
  { value: 'city_view', label: 'City view' },
]

export function MoveRoomStep1Popup({ open, onClose, onContinue, room, block }: Props) {
  const [movementReason, setMovementReason] = useState<MovementReason>('')
  const [anotherReasonText, setAnotherReasonText] = useState('')
  const [moveConfig, setMoveConfig] = useState<MoveConfig>('remaining_stay')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [floor, setFloor] = useState('')
  const [roomType, setRoomType] = useState('')
  const [roomView, setRoomView] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  // reset on open
  useEffect(() => {
    if (!open) return
    setMovementReason('')
    setAnotherReasonText('')
    setMoveConfig('remaining_stay')
    setStartDate('')
    setEndDate('')
    setFloor('1')
    setRoomType('')
    setRoomView('')
    setAvailableOnly(false)
  }, [open])

  const checkoutLabel = block?.end ? formatDate(block.end) : ''

  const handleContinue = () => {
    onContinue({
      movementReason,
      anotherReasonText,
      moveConfig,
      startDate,
      endDate,
      floor,
      roomType,
      roomView,
      availableOnly,
    })
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll closeOnBackdrop={false}>
      <div className="flex w-[94vw] max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 bg-[#0B4EA2] px-6 py-4">
          <div>
            <div className="text-sm font-bold text-white">Room Move</div>
            <div className="mt-0.5 text-[11px] text-white/75">
              Select a new room and configure the move details
            </div>
          </div>
          <button
            type="button"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/15"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto px-6 py-5">
          <div className="space-y-5">

            {/* ── Reservation Details card ── */}
            <div className="rounded-xl border border-slate-200 bg-[#EAF2FF] p-4">
              <div className="mb-3 text-[12px] font-semibold text-slate-700">Reservation Details</div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <DetailRow
                  label="Guest Name"
                  value={block?.title ?? '-'}
                />
                <DetailRow
                  label="Room Type"
                  value={room ? `${room.number} ${titleCase(room.type)}` : '-'}
                />
                <DetailRow
                  label="Check-in Date"
                  value={formatDate(block?.start)}
                />
                <DetailRow
                  label="Room view"
                  value="Garden view"
                />
                <DetailRow
                  label="Check-out Date"
                  value={formatDate(block?.end)}
                />
                <DetailRow
                  label="Number of Guests"
                  value="adult : 1"
                />
                <DetailRow
                  label="Total Amount"
                  value={room ? `$${(rateByRoomType(room.type) * 2).toFixed(2)}` : '-'}
                />
                <DetailRow
                  label="Rate plan"
                  value="Breakfast"
                />
                <DetailRow
                  label="Booking source"
                  value={room ? titleCase(room.bookingType) : '-'}
                />
                <DetailRow
                  label="Companions"
                  value="No companion"
                />
              </div>
            </div>

            {/* ── Movement Reason ── */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-slate-700">
                Movement Reason
                <span className="ml-0.5 text-rose-500">*</span>
              </label>
              <SelectDropdown
                options={MOVEMENT_REASON_OPTIONS}
                value={movementReason}
                placeholder="Select"
                onChange={(v) => setMovementReason(v as MovementReason)}
              />

              {movementReason === 'another_reason' && (
                <textarea
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 placeholder:text-slate-400 focus:border-[#0B4EA2] focus:outline-none"
                  rows={3}
                  placeholder="Please describe the reason for movement…"
                  value={anotherReasonText}
                  onChange={(e) => setAnotherReasonText(e.target.value)}
                />
              )}
            </div>

            {/* ── Move Configuration ── */}
            <div className="space-y-2">
              <div className="text-[12px] font-semibold text-slate-700">Move Configuration</div>

              {/* Option 1 – Remaining Stay */}
              <button
                type="button"
                className={[
                  'w-full rounded-xl border-2 p-3 text-left transition-colors',
                  moveConfig === 'remaining_stay'
                    ? 'border-[#0B4EA2] bg-[#EAF2FF]'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
                onClick={() => setMoveConfig('remaining_stay')}
              >
                <span className="text-[12px] font-semibold text-slate-800">Move for Remaining Stay</span>
                <span className="ml-2 text-[11px] text-slate-500">
                  Guest will be moved to the new room from now until checkout
                  {checkoutLabel ? ` (${checkoutLabel})` : ''}
                </span>
              </button>

              {/* Option 2 – Specific Dates */}
              <button
                type="button"
                className={[
                  'w-full rounded-xl border-2 p-3 text-left transition-colors',
                  moveConfig === 'specific_dates'
                    ? 'border-[#0B4EA2] bg-[#EAF2FF]'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
                onClick={() => setMoveConfig('specific_dates')}
              >
                <span className="text-[12px] font-semibold text-slate-800">Move for Specific Dates</span>
                <span className="ml-2 text-[11px] text-slate-500">
                  Choose custom check-in and check-out dates for the new room
                </span>
              </button>

              {/* Date pickers – only when specific dates selected */}
              {moveConfig === 'specific_dates' && (
                <div className="mt-3 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-[#EAF2FF] p-4">
                  {/* Start date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Start date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[12px] text-slate-700 focus:border-[#0B4EA2] focus:outline-none"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="MM/DD/YY"
                      />
                    </div>
                  </div>

                  {/* End date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">End date</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[12px] text-slate-700 focus:border-[#0B4EA2] focus:outline-none"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="MM/DD/YY"
                        min={startDate || undefined}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Filter Rooms ── */}
            <div className="space-y-3">
              <div className="text-[12px] font-semibold text-slate-700">Filter Rooms</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Floor</label>
                  <SelectDropdown
                    options={FLOOR_OPTIONS}
                    value={floor}
                    placeholder="select"
                    onChange={setFloor}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Room Type</label>
                  <SelectDropdown
                    options={ROOM_TYPE_OPTIONS}
                    value={roomType}
                    placeholder="select"
                    onChange={setRoomType}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Room view</label>
                  <SelectDropdown
                    options={ROOM_VIEW_OPTIONS}
                    value={roomView}
                    placeholder="select"
                    onChange={setRoomView}
                  />
                </div>
              </div>

              {/* Available only checkbox */}
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#0B4EA2]"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                />
                <span className="text-[12px] text-slate-600">Available only</span>
              </label>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            className="h-10 w-32 rounded-xl border border-[#0B4EA2] text-sm font-semibold text-[#0B4EA2] hover:bg-[#EAF2FF]"
            onClick={onClose}
          >
            cancel
          </button>
          <button
            type="button"
            className="h-10 w-36 rounded-xl bg-[#0B4EA2] text-sm font-semibold text-white hover:bg-[#0a3f8a] disabled:opacity-40"
            disabled={!movementReason}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  )
}
