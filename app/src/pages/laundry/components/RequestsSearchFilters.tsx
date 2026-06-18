import { IoSearchOutline } from 'react-icons/io5'
import { MdKeyboardArrowDown } from 'react-icons/md'

type Props = {
  search: string
  onSearchChange: (v: string) => void
  status: string
  onStatusChange: (v: string) => void
  serviceType: string
  onServiceTypeChange: (v: string) => void
  dateFrom: string
  onDateFromChange: (v: string) => void
  dateTo: string
  onDateToChange: (v: string) => void
}

const statusOptions = ['All status', 'Pending', 'In Progress', 'Ready for Delivery', 'Completed']
const serviceTypeOptions = ['All Type', 'Laundry Wash', 'Shirt Ironing', 'Pants Ironing', 'Towel Laundry']

function SelectFilter({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  label: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-slate-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-[13px] text-slate-700 shadow-sm focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
        >
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
        <MdKeyboardArrowDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}

function DateFilter({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-slate-500">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-[13px] text-slate-700 shadow-sm focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
        />
      </div>
    </div>
  )
}

export function RequestsSearchFilters({
  search, onSearchChange,
  status, onStatusChange,
  serviceType, onServiceTypeChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
}: Props) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <IoSearchOutline className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Room Number, guest name, request number"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-[13px] text-slate-700 shadow-sm focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
        />
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-4 gap-4">
        <SelectFilter label="Status" value={status} onChange={onStatusChange} options={statusOptions} />
        <SelectFilter label="Service Type" value={serviceType} onChange={onServiceTypeChange} options={serviceTypeOptions} />
        <DateFilter label="Date From" value={dateFrom} onChange={onDateFromChange} />
        <DateFilter label="Date To" value={dateTo} onChange={onDateToChange} />
      </div>
    </div>
  )
}
