import { useState } from 'react';
import { Eye, Download, Printer, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { PAYROLL_HISTORY_RECORDS, PayrollRecord } from '../payrollHistoryMockData';
import { PayrollPagination } from './PayrollPagination';

const PAGE_SIZE = 10;

type SortKey = keyof Pick<PayrollRecord, 'name' | 'department' | 'payPeriod' | 'basicSalary' | 'netSalary' | 'status'>;


export function PayrollHistoryTab() {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const totalPages = Math.ceil(PAYROLL_HISTORY_RECORDS.length / PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...PAYROLL_HISTORY_RECORDS].sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortAsc ? av - bv : bv - av;
    }
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const pageRecords = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRecord = (page - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAGE_SIZE, PAYROLL_HISTORY_RECORDS.length);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3 opacity-30" />;

  return (
    <div className="mt-6">
      <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
        {/* Record Count */}
        <div className="px-7 py-5 border-b border-slate-100">
          <span className="text-[14px] font-semibold text-slate-700">
            {PAYROLL_HISTORY_RECORDS.length} payroll records
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {/* Employee */}
                <th
                  className="px-6 py-4 text-left cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    EMPLOYEE <SortIcon col="name" />
                  </div>
                </th>
                {/* Department */}
                <th
                  className="px-4 py-4 text-left cursor-pointer select-none"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    DEPARTMENT <SortIcon col="department" />
                  </div>
                </th>
                {/* Pay Period */}
                <th
                  className="px-4 py-4 text-left cursor-pointer select-none"
                  onClick={() => handleSort('payPeriod')}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    PAY PERIOD <SortIcon col="payPeriod" />
                  </div>
                </th>
                {/* Basic Salary */}
                <th
                  className="px-4 py-4 text-left cursor-pointer select-none"
                  onClick={() => handleSort('basicSalary')}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    BASIC SALARY <SortIcon col="basicSalary" />
                  </div>
                </th>
                {/* Bonuses */}
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  BONUSES
                </th>
                {/* Deductions */}
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  DEDUCTIONS
                </th>
                {/* Net Salary */}
                <th
                  className="px-4 py-4 text-left cursor-pointer select-none"
                  onClick={() => handleSort('netSalary')}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    NET SALARY <SortIcon col="netSalary" />
                  </div>
                </th>
                {/* Status */}
                <th
                  className="px-4 py-4 text-left cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    STATUS <SortIcon col="status" />
                  </div>
                </th>
                {/* Actions */}
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {pageRecords.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                >
                  {/* Employee */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: rec.color }}
                      >
                        {rec.initials}
                      </div>
                      <span className="text-[14px] font-semibold text-slate-800">{rec.name}</span>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-4">
                    <div className="text-[13px] font-semibold text-slate-700">{rec.department}</div>
                    <div className="text-[11px] text-slate-400">{rec.role}</div>
                  </td>

                  {/* Pay Period */}
                  <td className="px-4 py-4 text-[13px] text-slate-600">{rec.payPeriod}</td>

                  {/* Basic Salary */}
                  <td className="px-4 py-4 text-[14px] font-bold text-slate-800">
                    ${rec.basicSalary.toLocaleString()}
                  </td>

                  {/* Bonus */}
                  <td className="px-4 py-4 text-[14px] font-bold text-emerald-500">
                    +${rec.bonus.toLocaleString()}
                  </td>

                  {/* Deduction */}
                  <td className="px-4 py-4 text-[14px] font-bold text-red-500">
                    -${rec.deduction.toLocaleString()}
                  </td>

                  {/* Net Salary */}
                  <td className="px-4 py-4 text-[14px] font-bold text-slate-800">
                    ${rec.netSalary.toLocaleString()}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${rec.status === 'Paid' ? 'text-emerald-600' : 'text-yellow-600'}`}>
                      <span className={`h-2 w-2 rounded-full ${rec.status === 'Paid' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                      {rec.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3 text-slate-400">
                      <button type="button" className="transition-colors hover:text-[#0B4EA2]">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" className="transition-colors hover:text-[#0B4EA2]">
                        <Download className="h-4 w-4" />
                      </button>
                      <button type="button" className="transition-colors hover:text-[#0B4EA2]">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button type="button" className="transition-colors hover:text-[#0B4EA2]">
                        <MoreHorizontal className="h-4 w-4" />
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
          totalRecords={PAYROLL_HISTORY_RECORDS.length} 
          label="records" 
        />
      </div>
    </div>
  );
}
