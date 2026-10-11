import { Plus, Users, CheckCircle2 } from 'lucide-react';

interface SuppliersHeaderProps {
  totalCount: number;
  activeCount: number;
  onAddClick: () => void;
}

export function SuppliersHeader({ totalCount, activeCount, onAddClick }: SuppliersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Suppliers</h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-semibold text-[#0B4EA2]">
              <Users className="h-3.5 w-3.5" />
              {totalCount} Total
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {activeCount} Active
            </span>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Manage vendor contacts, tax details, and department assignments for purchasing.
        </p>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-[#093d80] active:scale-[0.98] shrink-0"
      >
        <Plus className="h-4 w-4" />
        <span>Add Supplier</span>
      </button>
    </div>
  );
}
