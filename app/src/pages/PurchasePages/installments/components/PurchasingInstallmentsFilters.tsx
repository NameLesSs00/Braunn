import { Search, X, AlertTriangle, Clock, Calendar } from 'lucide-react';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';

interface PurchasingInstallmentsFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedSupplierId: number | 'ALL';
  onSupplierChange: (id: number | 'ALL') => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  dueFrom: string;
  onDueFromChange: (val: string) => void;
  dueTo: string;
  onDueToChange: (val: string) => void;
  showOnlyOverdue: boolean;
  onShowOnlyOverdueChange: (val: boolean) => void;
  showOnlyUnpaid: boolean;
  onShowOnlyUnpaidChange: (val: boolean) => void;
  suppliers: Supplier[];
  onClearFilters: () => void;
  isFiltered: boolean;
}

export function PurchasingInstallmentsFilters({
  searchTerm,
  onSearchChange,
  selectedSupplierId,
  onSupplierChange,
  selectedStatus,
  onStatusChange,
  dueFrom,
  onDueFromChange,
  dueTo,
  onDueToChange,
  showOnlyOverdue,
  onShowOnlyOverdueChange,
  showOnlyUnpaid,
  onShowOnlyUnpaidChange,
  suppliers,
  onClearFilters,
  isFiltered,
}: PurchasingInstallmentsFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
      {/* Primary search & quick filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by vendor, plan ID, installment ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Supplier Dropdown */}
        <div className="w-full lg:w-56">
          <select
            value={selectedSupplierId}
            onChange={(e) =>
              onSupplierChange(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
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
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="PartiallyPaid">Partially Paid</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Secondary filter row: Dates and Quick Toggles */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#0B4EA2]">
            <Calendar className="h-4 w-4" />
          </div>
          <span>Due Range:</span>
        </div>

        {/* Due From */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</span>
          <input
            type="date"
            value={dueFrom}
            onChange={(e) => onDueFromChange(e.target.value)}
            title="Start Due Date"
            className="h-10 w-44 sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 cursor-pointer"
          />
        </div>

        {/* Due To */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">To</span>
          <input
            type="date"
            value={dueTo}
            onChange={(e) => onDueToChange(e.target.value)}
            title="End Due Date"
            className="h-10 w-44 sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 cursor-pointer"
          />
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden lg:block" />

        {/* Show Only Overdue Toggle */}
        <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 hover:bg-rose-100/60 transition-colors shadow-2xs">
          <input
            type="checkbox"
            checked={showOnlyOverdue}
            onChange={(e) => onShowOnlyOverdueChange(e.target.checked)}
            className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
          />
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          <span>Only Overdue</span>
        </label>

        {/* Show Only Unpaid Toggle */}
        <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs">
          <input
            type="checkbox"
            checked={showOnlyUnpaid}
            onChange={(e) => onShowOnlyUnpaidChange(e.target.checked)}
            className="rounded border-slate-300 text-[#0B4EA2] focus:ring-[#0B4EA2] h-4 w-4"
          />
          <Clock className="h-4 w-4 text-slate-500" />
          <span>Only Unpaid</span>
        </label>

        {/* Reset button */}
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
