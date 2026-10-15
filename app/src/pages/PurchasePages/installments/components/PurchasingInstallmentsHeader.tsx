import { Calendar, AlertTriangle, Wallet, CheckCircle2 } from 'lucide-react';

interface PurchasingInstallmentsHeaderProps {
  totalCount: number;
  overdueCount: number;
  remainingAmountSum: number;
  paidAmountSum: number;
}

export function PurchasingInstallmentsHeader({
  totalCount,
  overdueCount,
  remainingAmountSum,
  paidAmountSum,
}: PurchasingInstallmentsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2] shadow-2xs">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Installment Payments
              </h1>
              <p className="text-sm text-slate-500">
                Monitor and settle vendor purchase financing schedules and dues
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Installments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Installments
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 font-medium">scheduled</span>
          </div>
        </div>

        {/* Overdue */}
        <div
          className={`rounded-2xl border p-4 shadow-2xs transition-all ${
            overdueCount > 0
              ? 'border-rose-200 bg-rose-50/50 hover:border-rose-300'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                overdueCount > 0 ? 'text-rose-700' : 'text-slate-500'
              }`}
            >
              Overdue Dues
            </span>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                overdueCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                overdueCount > 0 ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {overdueCount}
            </span>
            <span
              className={`text-xs font-medium ${
                overdueCount > 0 ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {overdueCount > 0 ? 'requires attention' : 'on track'}
            </span>
          </div>
        </div>

        {/* Remaining Unpaid Balance */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-2xs transition-all hover:border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Outstanding Dues
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">
              ${remainingAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Paid */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs transition-all hover:border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Total Settled
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">
              ${paidAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
