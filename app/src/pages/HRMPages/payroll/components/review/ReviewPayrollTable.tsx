import { CheckCircle2, ChevronDown, Download, Loader2, Search } from 'lucide-react';
import type { HRPayrollReadDto, PayrollStatus } from '../../../../../models/HRMmodels/Payroll';
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
  totalRecords: number;
  searchTerm: string;
  statusFilter: PayrollStatus | '';
  loading: boolean;
  setSearchTerm: (value: string) => void;
  setStatusFilter: (value: PayrollStatus | '') => void;
  setPage: (page: number) => void;
  toggleSelectAll: () => void;
  toggleSelect: (id: string) => void;
  handleReview: (id: string) => void;
  handleReviewSelected: () => void;
  setDetailsRecord: (record: HRPayrollReadDto) => void;
};

function StatusBadge({ status }: { status: string }) {
  const isReviewed = status === 'Reviewed';
  const isProcessed = status === 'Processed' || status === 'Paid';
  const classes = isProcessed
    ? 'bg-blue-100 text-blue-700'
    : isReviewed
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-yellow-100 text-yellow-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${classes}`}>
      {status}
    </span>
  );
}

export function ReviewPayrollTable({
  pageRecords,
  allRecords,
  selectedIds,
  page,
  totalPages,
  startRecord,
  endRecord,
  totalRecords,
  searchTerm,
  statusFilter,
  loading,
  setSearchTerm,
  setStatusFilter,
  setPage,
  toggleSelectAll,
  toggleSelect,
  handleReview,
  handleReviewSelected,
  setDetailsRecord
}: Props) {
  const selectableRecords = pageRecords.filter((record) => record.status !== 'Reviewed' && record.status !== 'Processed' && record.status !== 'Paid');
  const allPageSelected = selectableRecords.length > 0 && selectableRecords.every((record) => selectedIds.has(record.id));

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
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
              className="h-10 w-64 rounded-xl border border-slate-200 pl-10 pr-4 text-[13px] text-slate-600 outline-none focus:border-[#0B4EA2]"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as PayrollStatus | '');
                setPage(1);
              }}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-9 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#0B4EA2]"
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Processed">Processed</option>
              <option value="Paid">Paid</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={handleReviewSelected}
            disabled={selectedIds.size === 0 || loading}
            className="flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0a428a] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Review Payroll
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
                  className="h-4 w-4 rounded border-slate-300 text-[#0B4EA2] focus:ring-[#0B4EA2]"
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
            {loading && pageRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-10 text-center text-[14px] text-slate-500">
                  Loading payroll...
                </td>
              </tr>
            ) : pageRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-10 text-center text-[14px] text-slate-500">
                  No payroll records found for this period.
                </td>
              </tr>
            ) : (
              pageRecords.map((rec, index) => {
                const isLocked = rec.status === 'Reviewed' || rec.status === 'Processed' || rec.status === 'Paid';
                return (
                  <tr key={rec.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        disabled={isLocked}
                        checked={selectedIds.has(rec.id)}
                        onChange={() => toggleSelect(rec.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#0B4EA2] focus:ring-[#0B4EA2] disabled:opacity-40"
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0B4EA2] text-[12px] font-bold text-white shadow-sm">
                          {getInitials(rec.employeeName)}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-slate-900">{rec.employeeName}</div>
                          <div className="text-[11px] text-slate-400">Payroll row {startRecord + index}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[14px] text-slate-600">{formatPeriod(rec.month, rec.year)}</td>
                    <td className="px-4 py-5 text-center text-[14px] text-slate-600">{formatMoney(rec.basicSalary)}</td>
                    <td className="px-4 py-5 text-center text-[14px] text-emerald-600">{formatMoney(rec.totalBonuses)}</td>
                    <td className="px-4 py-5 text-center text-[14px] font-medium text-red-500">{formatMoney(rec.totalDeductions)}</td>
                    <td className="px-4 py-5 text-center text-[14px] text-slate-600">{formatMoney(getGrossPay(rec))}</td>
                    <td className="px-4 py-5 text-center text-[15px] font-bold text-slate-900">{formatMoney(rec.netSalary)}</td>
                    <td className="px-4 py-5 text-center"><StatusBadge status={rec.status} /></td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setDetailsRecord(rec)}
                          className="rounded-lg bg-[#0B4EA2] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#0a428a] transition-colors"
                        >
                          View details
                        </button>
                        <button
                          onClick={() => handleReview(rec.id)}
                          disabled={isLocked || loading}
                          className="rounded-lg bg-emerald-500 px-4 py-2 text-[12px] font-bold text-white hover:bg-emerald-600 transition-colors disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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
        totalRecords={totalRecords || allRecords.length}
        label="employees"
      />
    </div>
  );
}
