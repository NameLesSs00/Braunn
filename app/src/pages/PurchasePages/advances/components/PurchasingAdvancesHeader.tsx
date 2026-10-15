import { Plus, Wallet, CreditCard, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface PurchasingAdvancesHeaderProps {
  totalCount: number;
  activeCount: number;
  totalAmountSum: number;
  remainingAmountSum: number;
  onAddClick: () => void;
}

export function PurchasingAdvancesHeader({
  totalCount,
  activeCount,
  totalAmountSum,
  remainingAmountSum,
  onAddClick,
}: PurchasingAdvancesHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2] shadow-2xs">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Purchasing Advances
              </h1>
              <p className="text-sm text-slate-500">
                Issue down-payments and manage outstanding cash advances for vendors
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Advance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Advances */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Advances
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 font-medium">recorded</span>
          </div>
        </div>

        {/* Active Advances */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs transition-all hover:border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Active Advances
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">{activeCount}</span>
            <span className="text-xs text-emerald-700 font-medium">available for use</span>
          </div>
        </div>

        {/* Total Volume */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Issued
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#0B4EA2]">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B4EA2]">
              ${totalAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="rounded-2xl border border-blue-100 bg-[#EEF4FF]/40 p-4 shadow-2xs transition-all hover:border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0B4EA2]">
              Unconsumed Balance
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B4EA2] text-white">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B4EA2]">
              ${remainingAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
