import { useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { ReviewPayrollRecord } from '../../reviewPayrollMockData';

type Props = {
  employees: ReviewPayrollRecord[];
};

export function RunPayrollConfirmLeft({ employees }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const total = employees.reduce((sum, e) => sum + e.netPay, 0);

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-[15px] font-bold text-slate-800">Employees Included in Payroll</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B4EA2] text-[12px] font-bold text-white">
            {employees.length}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Search */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or department..."
                className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] text-slate-600 outline-none focus:border-[#0B4EA2]"
              />
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] border-b border-slate-100 px-4 py-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">EMPLOYEE</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">DEPARTMENT</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-right">NET PAY</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">METHOD</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center">STATUS</span>
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center border-b border-slate-50 px-4 py-3 hover:bg-slate-50/50 transition-colors"
              >
                {/* Employee */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: emp.color }}
                  >
                    {emp.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800 leading-tight">{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.role}</div>
                  </div>
                </div>

                {/* Department */}
                <div className="text-[13px] text-slate-600">{emp.department}</div>

                {/* Net Pay */}
                <div className="text-[14px] font-bold text-slate-800 text-right">${emp.netPay.toLocaleString()}</div>

                {/* Method */}
                <div className="text-center">
                  <span className="text-[12px] text-slate-500">Bank Transfer</span>
                </div>

                {/* Status */}
                <div className="text-center">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 tracking-wide">
                    Reviewed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer total */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
        <span className="text-[13px] font-semibold text-slate-500">
          {filtered.length} of {employees.length} employees shown
        </span>
        <span className="text-[15px] font-bold text-slate-900">
          Total: ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
