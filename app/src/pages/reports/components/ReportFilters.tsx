import { ChevronDown, Search } from 'lucide-react'
import type { RoomType } from '../../../models/RoomType'

interface ReportFiltersProps {
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  roomTypeId: string
  setRoomTypeId: (v: string) => void
  reservationSource: string
  setReservationSource: (v: string) => void
  roomTypes: RoomType[]
  roomTypesLoading?: boolean
  onApply: () => void
}

const RESERVATION_SOURCES = [
  'All Sources',
  'Direct',
  'Online',
  'Travel Agent',
  'Corporate',
  'Walk-in',
  'Other',
]

function FilterDropdown({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-[11px] font-medium text-slate-500">{label}</label>
      <div className="relative">
        <select
          className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[13px] text-slate-700 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 disabled:opacity-50 disabled:cursor-not-allowed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
      </div>
    </div>
  )
}

export function ReportFilters({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  roomTypeId,
  setRoomTypeId,
  reservationSource,
  setReservationSource,
  roomTypes,
  roomTypesLoading,
  onApply,
}: ReportFiltersProps) {
  const roomTypeOptions = [
    { value: '', label: 'All Room Types' },
    ...roomTypes.map((rt) => ({ value: rt.id, label: rt.name })),
  ]

  const sourceOptions = RESERVATION_SOURCES.map((s) => ({ value: s === 'All Sources' ? '' : s, label: s }))

  return (
    <div className="flex items-end gap-4 justify-between w-full rounded-xl border border-slate-200 bg-white p-4">
      {/* Start Date */}
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-[11px] font-medium text-slate-500">Start Date</label>
        <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700">
          <input
            type="date"
            className="bg-transparent outline-none text-[13px] text-slate-700 w-full"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
      </div>

      {/* End Date */}
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-[11px] font-medium text-slate-500">End Date</label>
        <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700">
          <input
            type="date"
            className="bg-transparent outline-none text-[13px] text-slate-700 w-full"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Room Type — UUID-based, populated from API */}
      <FilterDropdown
        label="Room Type"
        value={roomTypeId}
        onChange={setRoomTypeId}
        options={roomTypeOptions}
        disabled={roomTypesLoading}
      />

      {/* Reservation Source */}
      <FilterDropdown
        label="Reservation Source"
        value={reservationSource}
        onChange={setReservationSource}
        options={sourceOptions}
      />

      <button
        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] px-6 text-[13px] font-semibold text-white transition hover:bg-[#093c80] shrink-0"
        onClick={onApply}
      >
        <Search className="h-3.5 w-3.5" />
        Apply Filters
      </button>
    </div>
  )
}
