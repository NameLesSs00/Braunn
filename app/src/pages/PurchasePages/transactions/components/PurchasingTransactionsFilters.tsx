import { Search, X, Calendar } from 'lucide-react';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';

interface PurchasingTransactionsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  suppliers: Supplier[];
  selectedSupplierId: number | 'ALL';
  onSupplierChange: (id: number | 'ALL') => void;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  selectedTransactionType: string;
  onTransactionTypeChange: (type: string) => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  minAmount: string;
  onMinAmountChange: (val: string) => void;
  maxAmount: string;
  onMaxAmountChange: (val: string) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export function PurchasingTransactionsFilters({
  searchTerm,
  onSearchChange,
  suppliers,
  selectedSupplierId,
  onSupplierChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  selectedTransactionType,
  onTransactionTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  onReset,
  isFiltered,
}: PurchasingTransactionsFiltersProps) {
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
            placeholder="Search transaction #, reference #, or notes..."
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
                {s.name || `Supplier #${s.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Dropdown */}
        <div className="w-full lg:w-44">
          <select
            value={selectedPaymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="BankTransfer">Bank Transfer</option>
            <option value="Advance">Advance Allocation</option>
            <option value="Check">Check / Cheque</option>
          </select>
        </div>

        {/* Transaction Type Dropdown */}
        <div className="w-full lg:w-44">
          <select
            value={selectedTransactionType}
            onChange={(e) => onTransactionTypeChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-700 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="Payment">Direct Payment</option>
            <option value="CashPayment">Cash Payment</option>
            <option value="AdvancePayment">Advance Allocation</option>
            <option value="InstallmentPayment">Installment Settle</option>
            <option value="MixedPayment">Mixed Payment</option>
          </select>
        </div>
      </div>

      {/* Secondary filter row: Dates and Amount range */}
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

        <div className="h-4 w-px bg-slate-200 mx-1 hidden lg:block" />

        {/* Min Amount */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Min $</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
            className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
          />
        </div>

        {/* Max Amount */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Max $</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Any"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
            className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
          />
        </div>

        {/* Reset button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
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
