import { ChevronDown, Download, PlayCircle, Search } from 'lucide-react';
import type { HRPayrollReadDto } from '../../../../../models/HRMmodels/Payroll';
import { formatMoney, formatPeriod, getGrossPay, getInitials } from '../../payrollUtils';
import { PayrollPagination } from '../PayrollPagination';

type Props = {
  pageRecords: HRPayrollReadDto[];
  allRecords: HRPayrollReadDto[];
  selectedIds: Set<string>;
  page: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
  searchTerm: string;
  processing: boolean;
  setPage: (page: number) => void;
  setSearchTerm: (value: string) => void;
  toggleSelectAll: () => void;
  toggleSelect: (id: string) => void;
  onViewDetails: (record: HRPayrollReadDto) => void;
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
  searchTerm,
  processing,
  setPage,
  setSearchTerm,
  toggleSelectAll,
  toggleSelect,
  onViewDetails,
  onRunPayroll,
  onRunAll,
}: Props) {
  const allPageSelected = pageRecords.length > 0 && pageRecords.every((record) => selectedIds.has(record.id));

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search employee..."
              className="h-10 w-60 rounded-xl border border-slate-200 pl-10 pr-4 text-[13px] text-slate-600 outline-none focus:border-[#0B4EA2]"
            />
          </div>
          <div className="relative">
            <select
              value="Reviewed"
              disabled
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-9 text-[13px] font-semibold text-slate-600 outline-none"
            >
              <option>Reviewed only</option>
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
            disabled={selectedIds.size === 0 || processing}
            className="flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0a428a] transition-colors disabled:opacity-50"
          >
            <PlayCircle className="h-4 w-4" /> Run Payroll
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 accent-[#0B4EA2]"
                />
              </th>
              <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Employee</th>
              <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pay Period</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Basic Salary</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Bonuses</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Deductions</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Gross Pay</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Net Pay</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-10 text-center text-[14px] text-slate-500">
                  No reviewed payroll records are ready for processing.
                </td>
              </tr>
            ) : (
              pageRecords.map((rec) => (
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
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B4EA2] text-[12px] font-bold text-white shadow-sm flex-shrink-0">
                        {getInitials(rec.employeeName)}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-slate-900">{rec.employeeName}</div>
                        <div className="text-[11px] text-slate-400">Ready for payment</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[14px] text-slate-600">{formatPeriod(rec.month, rec.year)}</td>
                  <td className="px-4 py-4 text-center text-[14px] text-slate-600">{formatMoney(rec.basicSalary)}</td>
                  <td className="px-4 py-4 text-center text-[14px] text-emerald-600">{formatMoney(rec.totalBonuses)}</td>
                  <td className="px-4 py-4 text-center text-[14px] font-medium text-red-500">{formatMoney(rec.totalDeductions)}</td>
                  <td className="px-4 py-4 text-center text-[14px] text-slate-600">{formatMoney(getGrossPay(rec))}</td>
                  <td className="px-4 py-4 text-center text-[15px] font-bold text-slate-900">{formatMoney(rec.netSalary)}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 tracking-wide">
                      Reviewed
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
                        disabled={processing}
                        className="flex items-center gap-1.5 rounded-lg bg-[#22c55e] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#16a34a] transition-colors whitespace-nowrap disabled:opacity-50"
                      >
                        <PlayCircle className="h-3.5 w-3.5" /> Run payroll
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
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
