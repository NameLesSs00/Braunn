import {
  RotateCw,
  CreditCard,
  Wallet,
  ArrowUpRight,
  Layers,
  Download,
  Receipt,
} from 'lucide-react';

interface PurchasingTransactionsHeaderProps {
  totalCount: number;
  totalVolume: number;
  cashVolume: number;
  advanceVolume: number;
  isLoading: boolean;
  onRefresh: () => void;
  onExport?: () => void;
}

export function PurchasingTransactionsHeader({
  totalCount,
  totalVolume,
  cashVolume,
  advanceVolume,
  isLoading,
  onRefresh,
  onExport,
}: PurchasingTransactionsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2] shadow-2xs">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Financial Transactions
              </h1>
              <p className="text-sm text-slate-500">
                Audit journal of cash disbursements, advance allocations, and installment amortizations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh transactions"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#0B4EA2]' : ''}`} />
          </button>

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              <Download className="h-4 w-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Row (Consistent 4-Card Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Transactions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCount.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-medium">recorded events</span>
          </div>
        </div>

        {/* Direct Cash Volume */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs transition-all hover:border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Direct Cash Paid
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">
              ${cashVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-700 font-medium">liquid</span>
          </div>
        </div>

        {/* Advance Deductions */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 shadow-2xs transition-all hover:border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">
              Advance Allocations
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-900">
              ${advanceVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-purple-700 font-medium">settled</span>
          </div>
        </div>

        {/* Total Ledger Volume */}
        <div className="rounded-2xl border border-blue-100 bg-[#EEF4FF]/40 p-4 shadow-2xs transition-all hover:border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0B4EA2]">
              Total Volume (View)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B4EA2] text-white">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B4EA2]">
              ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
