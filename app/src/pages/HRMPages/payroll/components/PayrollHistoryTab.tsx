import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Eye, MoreHorizontal, Printer, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import type { PayrollProcessingReadDto } from '../../../../models/HRMmodels/Payroll';
import {
  clearSelectedPayrollProcessing,
  fetchPayrollProcessingById,
  fetchPayrollProcessingRecords,
} from '../../../../features/HRMfeatures/payroll/hrPayrollSlice';
import { displayPaymentMethod, formatMoney, formatPeriod, formatShortDate, PAYROLL_PAGE_SIZE } from '../payrollUtils';
import { PayrollPagination } from './PayrollPagination';
import { PayrollProcessingDetailsModal } from './PayrollProcessingDetailsModal';

type SortKey = keyof Pick<PayrollProcessingReadDto, 'employeeName' | 'payrollNumber' | 'paymentMethod' | 'amount' | 'createdAt'>;

const HISTORY_FETCH_SIZE = 500;

const API_SORT_FIELDS: Record<SortKey, string> = {
  employeeName: 'EmployeeName',
  payrollNumber: 'PayrollNumber',
  paymentMethod: 'PaymentMethod',
  amount: 'Amount',
  createdAt: 'CreatedAt',
};

type Props = {
  month: number;
  year: number;
};

function periodKey(month: number, year: number) {
  return `PAY-${year}-${String(month).padStart(2, '0')}`;
}

function compareRecords(a: PayrollProcessingReadDto, b: PayrollProcessingReadDto, sortKey: SortKey) {
  if (sortKey === 'amount') return (a.amount ?? 0) - (b.amount ?? 0);
  if (sortKey === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  return String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, {
    sensitivity: 'base',
    numeric: true,
  });
}

export function PayrollHistoryTab({ month, year }: Props) {
  const dispatch = useAppDispatch();
  const {
    historyStatus,
    processingDetailStatus,
    processingRecords,
    selectedProcessingRecord,
  } = useAppSelector((state) => state.hrPayroll);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPayrollProcessingRecords({
      PageNumber: 1,
      PageSize: HISTORY_FETCH_SIZE,
      SortBy: API_SORT_FIELDS[sortKey],
      SortDirection: sortAsc ? 'asc' : 'desc',
    }));
  }, [dispatch, sortAsc, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [month, searchTerm, year]);

  const visibleRecords = useMemo(() => {
    const selectedPeriod = periodKey(month, year).toLowerCase();
    const query = searchTerm.trim().toLowerCase();

    return processingRecords
      .filter((record) => {
        const matchesPeriod = record.payrollNumber.toLowerCase().includes(selectedPeriod);
        if (!matchesPeriod) return false;
        if (!query) return true;

        const searchable = [
          record.employeeName,
          record.payrollNumber,
          displayPaymentMethod(record.paymentMethod),
          formatShortDate(record.createdAt),
          String(record.amount ?? ''),
        ].join(' ').toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => {
        const result = compareRecords(a, b, sortKey);
        return sortAsc ? result : -result;
      });
  }, [month, processingRecords, searchTerm, sortAsc, sortKey, year]);

  const totalVisibleCount = visibleRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalVisibleCount / PAYROLL_PAGE_SIZE));
  const pageRecords = visibleRecords.slice((page - 1) * PAYROLL_PAGE_SIZE, page * PAYROLL_PAGE_SIZE);
  const startRecord = totalVisibleCount === 0 ? 0 : (page - 1) * PAYROLL_PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAYROLL_PAGE_SIZE, totalVisibleCount);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPage(1);
  };

  const handleViewDetails = (record: PayrollProcessingReadDto) => {
    dispatch(clearSelectedPayrollProcessing());
    setDetailsOpen(true);
    dispatch(fetchPayrollProcessingById(record.id));
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    dispatch(clearSelectedPayrollProcessing());
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3 opacity-30" />;

  return (
    <div className="mt-6">
      <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-7 py-5 border-b border-slate-100">
          <span className="text-[14px] font-semibold text-slate-700">
            {totalVisibleCount} {formatPeriod(month, year)} payment records
          </span>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search payment history..."
              className="h-10 w-72 rounded-xl border border-slate-200 pl-10 pr-4 text-[13px] text-slate-600 outline-none focus:border-[#0B4EA2]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-left cursor-pointer select-none" onClick={() => handleSort('employeeName')}>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Employee <SortIcon col="employeeName" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left cursor-pointer select-none" onClick={() => handleSort('payrollNumber')}>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Payroll <SortIcon col="payrollNumber" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Pay Date <SortIcon col="createdAt" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left cursor-pointer select-none" onClick={() => handleSort('paymentMethod')}>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Method <SortIcon col="paymentMethod" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left cursor-pointer select-none" onClick={() => handleSort('amount')}>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Amount <SortIcon col="amount" />
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {historyStatus === 'loading' && processingRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[14px] text-slate-500">
                    Loading payment history...
                  </td>
                </tr>
              ) : pageRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[14px] text-slate-500">
                    No processed payroll payments found for {formatPeriod(month, year)}.
                  </td>
                </tr>
              ) : (
                pageRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-semibold text-slate-800">{record.employeeName}</span>
                    </td>
                    <td className="px-4 py-4 text-[13px] font-semibold text-slate-700">{record.payrollNumber}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-600">{formatShortDate(record.createdAt)}</td>
                    <td className="px-4 py-4 text-[13px] text-slate-600">{displayPaymentMethod(record.paymentMethod)}</td>
                    <td className="px-4 py-4 text-[14px] font-bold text-slate-800">{formatMoney(record.amount)}</td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Processed
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(record)}
                          className="transition-colors hover:text-[#0B4EA2]"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" className="transition-colors hover:text-[#0B4EA2]" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        <button type="button" className="transition-colors hover:text-[#0B4EA2]" title="Print">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button type="button" className="transition-colors hover:text-[#0B4EA2]" title="More">
                          <MoreHorizontal className="h-4 w-4" />
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
          totalRecords={totalVisibleCount}
          label="records"
        />
      </div>

      <PayrollProcessingDetailsModal
        open={detailsOpen}
        onClose={handleCloseDetails}
        record={selectedProcessingRecord}
        status={processingDetailStatus}
      />
    </div>
  );
}
