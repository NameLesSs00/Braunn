import {
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Ban,
} from 'lucide-react';

interface PurchasingTransfersHeaderProps {
  totalCount: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  onCreateTransfer: () => void;
}

export function PurchasingTransfersHeader({
  totalCount,
  confirmedCount,
  pendingCount,
  cancelledCount,
  onCreateTransfer,
}: PurchasingTransfersHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2] shadow-2xs">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Main Inventory Transfers
              </h1>
              <p className="text-sm text-slate-500">
                Distribute raw materials & inventory from Central Warehouse to restaurant kitchens & departments
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={onCreateTransfer}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#093d80] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Transfers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Transfers
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500">orders logged</span>
          </div>
        </div>

        {/* Confirmed / Settled */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Confirmed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">{confirmedCount}</span>
            <span className="text-xs font-medium text-emerald-600">stock delivered</span>
          </div>
        </div>

        {/* Pending / Awaiting Confirmation */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Pending Action
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-800">{pendingCount}</span>
            <span className="text-xs font-medium text-amber-600">requires confirm</span>
          </div>
        </div>

        {/* Cancelled Transfers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cancelled
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Ban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">{cancelledCount}</span>
            <span className="text-xs text-slate-400">voided transfers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
