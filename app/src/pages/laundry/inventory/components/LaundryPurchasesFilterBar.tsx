import { Calendar, Filter, RotateCcw, Search, X } from 'lucide-react'
import type { LaundryPurchaseStatus } from '../../../../models/Laundrymodels/LaundryPurchase'

interface LaundryPurchasesFilterBarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  status: LaundryPurchaseStatus | 'All'
  onStatusChange: (val: LaundryPurchaseStatus | 'All') => void
  fromDate: string
  onFromDateChange: (val: string) => void
  toDate: string
  onToDateChange: (val: string) => void
  onReset: () => void
}

export function LaundryPurchasesFilterBar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onReset,
}: LaundryPurchasesFilterBarProps) {
  const isFiltered =
    Boolean(searchTerm) ||
    status !== 'All' ||
    Boolean(fromDate) ||
    Boolean(toDate)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by item name or requisition ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#0B4EA2] focus:bg-white focus:ring-2 focus:ring-[#0B4EA2]/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-2xs hover:border-slate-300">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-normal">Status:</span>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as LaundryPurchaseStatus | 'All')}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Viewed">Viewed</option>
              <option value="Approved">Approved</option>
              <option value="Ordered">Ordered</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date From */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-2xs hover:border-slate-300 focus-within:border-[#0B4EA2] focus-within:ring-2 focus-within:ring-[#0B4EA2]/20">
            <Calendar className="h-4 w-4 text-[#0B4EA2] shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-36 sm:w-40 bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer"
              title="From Date"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-2xs hover:border-slate-300 focus-within:border-[#0B4EA2] focus-within:ring-2 focus-within:ring-[#0B4EA2]/20">
            <Calendar className="h-4 w-4 text-[#0B4EA2] shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-36 sm:w-40 bg-transparent text-sm font-medium text-slate-800 outline-none cursor-pointer"
              title="To Date"
            />
          </div>

          {/* Reset button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
