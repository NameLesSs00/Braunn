import { Search, X, Calendar } from 'lucide-react';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';

export type StatusFilterOption = 'ALL' | 'Pending' | 'Received';

interface SupplierPurchasesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSupplierId: number | 'ALL';
  onSupplierChange: (supplierId: number | 'ALL') => void;
  selectedStatus: StatusFilterOption;
  onStatusChange: (status: StatusFilterOption) => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  suppliers: Supplier[];
  onClearFilters: () => void;
  isFiltered: boolean;
}

export function SupplierPurchasesFilters({
  searchTerm,
  onSearchChange,
  selectedSupplierId,
  onSupplierChange,
  selectedStatus,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  suppliers,
  onClearFilters,
  isFiltered,
}: SupplierPurchasesFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
      {/* Primary search & quick filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search order #, supplier, or notes..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Supplier Selector */}
        <div className="w-full lg:w-56">
          <select
            value={selectedSupplierId === 'ALL' ? 'ALL' : selectedSupplierId}
            onChange={(e) => {
              const val = e.target.value;
              onSupplierChange(val === 'ALL' ? 'ALL' : Number(val));
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 transition-all focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
          >
            <option value="ALL">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="w-full lg:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as StatusFilterOption)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 transition-all focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
          </select>
        </div>
      </div>

      {/* Secondary filter row: Spacious & Clean Date Range */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#0B4EA2]">
            <Calendar className="h-4 w-4" />
          </div>
          <span>Date Range:</span>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            title="Start Date"
            className="h-10 w-44 sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 cursor-pointer"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            title="End Date"
            className="h-10 w-44 sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 cursor-pointer"
          />
        </div>

        {/* Clear Filters button if applied */}
        {isFiltered && (
          <button
            type="button"
            onClick={onClearFilters}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
