import { ChevronDown, Search } from 'lucide-react'

interface ReportFiltersProps {
  dateFrom: string
  setDateFrom: (v: string) => void
  dateTo: string
  setDateTo: (v: string) => void
  roomType: string
  setRoomType: (v: string) => void
  marketSegment: string
  setMarketSegment: (v: string) => void
}

function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-[11px] font-medium text-slate-500">{label}</label>
      <div className="relative">
        <select
          className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-[13px] text-slate-700 outline-none transition focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
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
  roomType,
  setRoomType,
  marketSegment,
  setMarketSegment,
}: ReportFiltersProps) {
  return (
    <div className="flex items-end gap-4 justify-between w-full rounded-xl border border-slate-200 bg-white p-4">
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

      {/* Date Range End */}
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

      <FilterDropdown
        label="Room Type"
        value={roomType}
        onChange={setRoomType}
        options={['All Room Types', 'Standard', 'Deluxe', 'Suite']}
      />
      <FilterDropdown
        label="Reservation source"
        value={marketSegment}
        onChange={setMarketSegment}
        options={['All Segments', 'Leisure', 'Corporate', 'Group', 'Other']}
      />

      <button
        className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] px-6 text-[13px] font-semibold text-white transition hover:bg-[#093c80] shrink-0"
        onClick={() => {}}
      >
        <Search className="h-3.5 w-3.5" />
        Apply Filters
      </button>
    </div>
  )
}
