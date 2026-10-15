import { Search, RotateCcw, Filter, AlertTriangle } from 'lucide-react';

interface MainInventoryStockFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedPurchaseType: string;
  onPurchaseTypeChange: (value: string) => void;
  lowStockOnly: boolean;
  onLowStockToggle: () => void;
  activeFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  onActiveFilterChange: (val: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onReset: () => void;
  isFiltered: boolean;
}

export function MainInventoryStockFilters({
  searchTerm,
  onSearchChange,
  selectedPurchaseType,
  onPurchaseTypeChange,
  lowStockOnly,
  onLowStockToggle,
  activeFilter,
  onActiveFilterChange,
  onReset,
  isFiltered,
}: MainInventoryStockFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search material by name or SKU..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 outline-none transition-all"
          />
        </div>

        {/* Right side filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department / PurchaseType Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 rounded-xl px-2.5 py-1.5 border border-slate-200/80">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedPurchaseType}
              onChange={(e) => onPurchaseTypeChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Room">Room (Housekeeping)</option>
            </select>
          </div>

          {/* Active Status Pill */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onActiveFilterChange('ALL')}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onActiveFilterChange('ACTIVE')}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                activeFilter === 'ACTIVE'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => onActiveFilterChange('INACTIVE')}
              className={`rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                activeFilter === 'INACTIVE'
                  ? 'bg-white text-slate-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Low Stock Only Toggle */}
          <button
            type="button"
            onClick={onLowStockToggle}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              lowStockOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${lowStockOnly ? 'text-white' : 'text-amber-500'}`} />
            <span>Low Stock</span>
          </button>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
