import { Package, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';

interface MainInventoryStockHeaderProps {
  totalCount: number;
  activeCount: number;
  lowStockCount: number;
  totalValuation: number;
}

export function MainInventoryStockHeader({
  totalCount,
  activeCount,
  lowStockCount,
  totalValuation,
}: MainInventoryStockHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2] shadow-2xs">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Central Inventory Stock
              </h1>
              <p className="text-sm text-slate-500">
                Real-time stock balance, storage valuation, and material catalog
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Items */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total SKUs
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">{totalCount}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Catalog materials</span>
        </div>

        {/* Active Items */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active In Stock
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{activeCount}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Active items</span>
        </div>

        {/* Low / Zero Stock */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Low / Depleted
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{lowStockCount}</p>
          <span className="text-xs text-slate-400 mt-0.5 block">Need replenishment</span>
        </div>

        {/* Total Valuation */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Valuation
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-700">
            {totalValuation > 0
              ? Number(totalValuation).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '0.00'}
          </p>
          <span className="text-xs text-slate-400 mt-0.5 block">Estimated asset worth</span>
        </div>
      </div>
    </div>
  );
}
