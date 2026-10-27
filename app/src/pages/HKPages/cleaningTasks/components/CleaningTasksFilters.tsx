import { FiSearch, FiRefreshCw, FiUser } from 'react-icons/fi';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';

export function CleaningTasksHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[#1a365d]">Room Cleaning Management</h1>
      <p className="mt-1 text-sm text-slate-500">
        Track active reception room assignments, update cleaning progress, and review completion records.
      </p>
    </div>
  );
}

interface CleaningTasksFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedEmployeeId: string;
  onEmployeeChange: (id: string) => void;
  employees: HREmployeeReadDto[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function CleaningTasksFilters({
  searchQuery,
  onSearchChange,
  selectedEmployeeId,
  onEmployeeChange,
  employees,
  onRefresh,
  isRefreshing,
}: CleaningTasksFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Room Number or Notes..."
          className="bg-slate-50/50 w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-sm placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Employee Filter */}
        <div className="relative min-w-[200px] flex-1 md:flex-initial">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <FiUser className="w-4 h-4" />
          </div>
          <select
            value={selectedEmployeeId}
            onChange={(e) => onEmployeeChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-sm text-slate-700 font-medium cursor-pointer"
          >
            <option value="">All Assigned Staff</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName || emp.id}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters (if active) */}
        {(searchQuery || selectedEmployeeId) && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onEmployeeChange('');
            }}
            className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0a4bbd]' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
