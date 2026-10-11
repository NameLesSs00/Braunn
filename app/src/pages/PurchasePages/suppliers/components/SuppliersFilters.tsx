import { Search, Filter, X } from 'lucide-react';
import {
  PURCHASING_DEPARTMENTS,
  type PurchasingDepartment,
} from '../../../../models/Purchasemodels/Supplier';
import { DEPARTMENT_STYLES } from './departmentBadge';

export type DepartmentFilterOption = 'ALL' | PurchasingDepartment;
export type StatusFilterOption = 'ALL' | 'Active' | 'Inactive';

interface SuppliersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: DepartmentFilterOption;
  onDepartmentChange: (dept: DepartmentFilterOption) => void;
  selectedStatus: StatusFilterOption;
  onStatusChange: (status: StatusFilterOption) => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export function SuppliersFilters({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  isFiltered,
}: SuppliersFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* Top: Department Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Department:
        </span>

        <button
          type="button"
          onClick={() => onDepartmentChange('ALL')}
          className={`rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-all ${
            selectedDepartment === 'ALL'
              ? 'bg-[#0B4EA2] text-white shadow-xs font-semibold'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Departments
        </button>

        {PURCHASING_DEPARTMENTS.map((dept) => {
          const isSelected = selectedDepartment === dept;
          const info = DEPARTMENT_STYLES[dept];
          return (
            <button
              key={dept}
              type="button"
              onClick={() => onDepartmentChange(dept)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                isSelected
                  ? `${info.badgeClass} ring-2 ring-[#0B4EA2]/30 font-semibold shadow-xs`
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSelected ? info.dotClass : 'bg-slate-400'
                }`}
              />
              {dept}
            </button>
          );
        })}
      </div>

      {/* Bottom: Search bar + Status filter + Clear */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search suppliers by name, phone, email, tax number..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2 text-[14px] text-slate-800 placeholder:text-slate-400 transition-colors focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EEF4FF]"
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

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as StatusFilterOption)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-[#0B4EA2] focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 h-10 rounded-xl border border-dashed border-slate-300 px-3 text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
