import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import type { HRPayrollReadDto, PayrollStatus } from '../../../../models/HRMmodels/Payroll';
import {
  clearSelectedPayrollSnapshot,
  fetchHrPayrolls,
  fetchHrPayrollSnapshotById,
  reviewHrPayroll,
} from '../../../../features/HRMfeatures/payroll/hrPayrollSlice';
import { EmployeePayrollDetailsPopup } from './EmployeePayrollDetailsPopup';
import { ReviewPayrollKPICards } from './review/ReviewPayrollKPICards';
import { ReviewPayrollTable } from './review/ReviewPayrollTable';
import { PAYROLL_PAGE_SIZE } from '../payrollUtils';

type Props = {
  month: number;
  year: number;
};

export function ReviewPayrollTab({ month, year }: Props) {
  const dispatch = useAppDispatch();
  const { payrolls, totalPayrollsCount, payrollsPageNumber, status, selectedSnapshot } = useAppSelector((state) => state.hrPayroll);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailsRecord, setDetailsRecord] = useState<HRPayrollReadDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PayrollStatus | ''>('');

  useEffect(() => {
    dispatch(fetchHrPayrolls({
      Month: month,
      Year: year,
      PageNumber: page,
      PageSize: PAYROLL_PAGE_SIZE,
      SearchTerm: searchTerm || undefined,
      Status: statusFilter || undefined,
    }));
  }, [dispatch, month, page, searchTerm, statusFilter, year]);

  useEffect(() => {
    setSelectedIds(new Set());
    setPage(1);
  }, [month, year]);

  useEffect(() => {
    if (detailsRecord) {
      dispatch(clearSelectedPayrollSnapshot());
      dispatch(fetchHrPayrollSnapshotById(detailsRecord.id));
    }
  }, [detailsRecord, dispatch]);

  const totalPages = Math.max(1, Math.ceil(totalPayrollsCount / PAYROLL_PAGE_SIZE));
  const startRecord = totalPayrollsCount === 0 ? 0 : (payrollsPageNumber - 1) * PAYROLL_PAGE_SIZE + 1;
  const endRecord = Math.min(payrollsPageNumber * PAYROLL_PAGE_SIZE, totalPayrollsCount);

  const selectableRecords = useMemo(
    () => payrolls.filter((record) => record.status !== 'Reviewed' && record.status !== 'Processed' && record.status !== 'Paid'),
    [payrolls]
  );

  const refetch = () => {
    dispatch(fetchHrPayrolls({
      Month: month,
      Year: year,
      PageNumber: page,
      PageSize: PAYROLL_PAGE_SIZE,
      SearchTerm: searchTerm || undefined,
      Status: statusFilter || undefined,
    }));
  };

  const handleReview = async (id: string) => {
    const result = await dispatch(reviewHrPayroll(id));
    if (reviewHrPayroll.fulfilled.match(result)) {
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      refetch();
    }
  };

  const handleReviewSelected = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await dispatch(reviewHrPayroll(id));
    }
    setSelectedIds(new Set());
    refetch();
  };

  const toggleSelectAll = () => {
    const allSelected = selectableRecords.length > 0 && selectableRecords.every((record) => selectedIds.has(record.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableRecords.map((record) => record.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mt-6">
      <ReviewPayrollKPICards records={payrolls} totalCount={totalPayrollsCount} />
      <ReviewPayrollTable
        pageRecords={payrolls}
        allRecords={payrolls}
        selectedIds={selectedIds}
        page={page}
        totalPages={totalPages}
        startRecord={startRecord}
        endRecord={endRecord}
        totalRecords={totalPayrollsCount}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        loading={status === 'loading'}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        setPage={setPage}
        toggleSelectAll={toggleSelectAll}
        toggleSelect={toggleSelect}
        handleReview={handleReview}
        handleReviewSelected={handleReviewSelected}
        setDetailsRecord={setDetailsRecord}
      />

      <EmployeePayrollDetailsPopup
        open={detailsRecord !== null}
        onClose={() => setDetailsRecord(null)}
        payroll={detailsRecord}
        snapshot={selectedSnapshot}
        actionLabel="Review"
        actionDisabled={!detailsRecord || detailsRecord.status === 'Reviewed' || detailsRecord.status === 'Processed' || detailsRecord.status === 'Paid'}
        onAction={(id) => handleReview(id)}
      />
    </div>
  );
}
