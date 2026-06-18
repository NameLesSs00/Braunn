import { Search, ChevronDown, Download, PlayCircle } from 'lucide-react';
import { REVIEW_PAYROLL_MOCK_DATA, ReviewPayrollRecord } from '../../reviewPayrollMockData';
import { PayrollPagination } from '../PayrollPagination';

type Props = {
  pageRecords: ReviewPayrollRecord[];
  allRecords: ReviewPayrollRecord[];
  selectedIds: Set<string>;
  page: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
  setPage: (page: number) => void;
  toggleSelectAll: () => void;
  toggleSelect: (id: string) => void;
  onViewDetails: (record: ReviewPayrollRecord) => void;
  onRunPayroll: (id: string) => void;
  onRunAll: () => void;
};

export function RunPayrollTable({
  pageRecords,
  allRecords,
  selectedIds,
  page,
  totalPages,
  startRecord,
  endRecord,
  setPage,
  toggleSelectAll,
  toggleSelect,
  onViewDetails,
  onRunPayroll,
  onRunAll,
}: Props) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              className="h-10 w-60 rounded-xl border border-slate-200 pl-10 pr-4 text-[13px] text-slate-600 outline-none focus:border-[#0B4EA2]"
            />
          </div>
          <div className="relative">
            <select className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-9 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#0B4EA2]">
              <option>All Department</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          <div className="relative">
            <select className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-9 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#0B4EA2]">
              <option>All Status</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={onRunAll}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0a428a] transition-colors disabled:opacity-50"
          >
            <PlayCircle className="h-4 w-4" /> Run Payroll
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={pageRecords.length > 0 && selectedIds.size === pageRecords.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 accent-[#0B4EA2]"
                />
              </th>
              <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">EMPLOYEE</th>
              <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">DEPARTMENT</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">BASIC<br/>SALARY</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">ALLOWANCES</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">DEDUCTIONS</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">GROSS<br/>PAY</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">NET PAY</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">STATUS</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {pageRecords.map((rec) => (
              <tr key={rec.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rec.id)}
                    onChange={() => toggleSelect(rec.id)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#0B4EA2]"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid h-10 w-10 place-items-center rounded-xl text-[12px] font-bold text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: rec.color }}
                    >
                      {rec.initials}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-900">{rec.name}</div>
                      <div className="text-[11px] text-slate-400">{rec.empId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[14px] text-slate-600">{rec.department}</td>
                <td className="px-4 py-4 text-center text-[14px] text-slate-600">{rec.basicSalary.toLocaleString()}$</td>
                <td className="px-4 py-4 text-center text-[14px] text-slate-600">{rec.allowances.toLocaleString()}$</td>
                <td className="px-4 py-4 text-center text-[14px] font-medium text-red-500">{rec.deductions.toLocaleString()}$</td>
                <td className="px-4 py-4 text-center text-[14px] text-slate-600">{rec.grossPay.toLocaleString()}$</td>
                <td className="px-4 py-4 text-center text-[15px] font-bold text-slate-900">{rec.netPay.toLocaleString()}$</td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 tracking-wide">
                    REVIEWED
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails(rec)}
                      className="rounded-lg bg-[#0B4EA2] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#0a428a] transition-colors whitespace-nowrap"
                    >
                      View details
                    </button>
                    <button
                      onClick={() => onRunPayroll(rec.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#16a34a] transition-colors whitespace-nowrap"
                    >
                      <PlayCircle className="h-3.5 w-3.5" /> Run payroll
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PayrollPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        startRecord={startRecord}
        endRecord={endRecord}
        totalRecords={allRecords.length}
        label="employees"
      />
    </div>
  );
}
