import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import type { HRPayrollReadDto, PaymentMethod } from '../../../../models/HRMmodels/Payroll';
import {
  clearLastPayrollProcessResult,
  clearSelectedPayrollSnapshot,
  fetchHrPayrolls,
  fetchHrPayrollSnapshotById,
  fetchPayrollProcessingRecords,
  processHrPayrolls,
} from '../../../../features/HRMfeatures/payroll/hrPayrollSlice';
import { EmployeePayrollDetailsPopup } from './EmployeePayrollDetailsPopup';
import { RunPayrollConfirmScreen } from './runPayroll/RunPayrollConfirmScreen';
import { RunPayrollKPICards } from './runPayroll/RunPayrollKPICards';
import { RunPayrollSuccessScreen } from './runPayroll/RunPayrollSuccessScreen';
import { RunPayrollTable } from './runPayroll/RunPayrollTable';
import { PAYROLL_PAGE_SIZE } from '../payrollUtils';

type View = 'table' | 'confirm' | 'success';

type Props = {
  month: number;
  year: number;
};

export function RunPayrollTab({ month, year }: Props) {
  const dispatch = useAppDispatch();
  const {
    lastProcessResult,
    payrolls,
    processStatus,
    processingRecords,
    selectedSnapshot,
  } = useAppSelector((state) => state.hrPayroll);
  const { employees } = useAppSelector((state) => state.hrEmployees);
  const [view, setView] = useState<View>('table');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailsRecord, setDetailsRecord] = useState<HRPayrollReadDto | null>(null);
  const [runEmployees, setRunEmployees] = useState<HRPayrollReadDto[]>([]);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethod | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchHrPayrolls({ Month: month, Year: year, PageNumber: 1, PageSize: 100, Status: 'Reviewed' }));
    dispatch(fetchPayrollProcessingRecords({ PageNumber: 1, PageSize: 200 }));
  }, [dispatch, month, year]);

  useEffect(() => {
    setView('table');
    setSelectedIds(new Set());
    setRunEmployees([]);
    setLastPaymentMethod(undefined);
    setPage(1);
    dispatch(clearLastPayrollProcessResult());
  }, [dispatch, month, year]);

  useEffect(() => {
    if (detailsRecord) {
      dispatch(clearSelectedPayrollSnapshot());
      dispatch(fetchHrPayrollSnapshotById(detailsRecord.id));
    }
  }, [detailsRecord, dispatch]);

  const activeEmployeeIds = useMemo(
    () => new Set(employees.filter((employee) => employee.status === 'Active').map((employee) => employee.id)),
    [employees]
  );

  const processedPayrollIds = useMemo(
    () => new Set(processingRecords.map((record) => record.payrollId)),
    [processingRecords]
  );

  const eligibleRecords = useMemo(() => {
    return payrolls.filter((record) => {
      const isActiveEmployee = activeEmployeeIds.size === 0 || activeEmployeeIds.has(record.employeeId);
      const matchesSearch = !searchTerm || record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      return record.status === 'Reviewed' && isActiveEmployee && !processedPayrollIds.has(record.id) && matchesSearch;
    });
  }, [activeEmployeeIds, payrolls, processedPayrollIds, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(eligibleRecords.length / PAYROLL_PAGE_SIZE));
  const pageRecords = eligibleRecords.slice((page - 1) * PAYROLL_PAGE_SIZE, page * PAYROLL_PAGE_SIZE);
  const startRecord = eligibleRecords.length === 0 ? 0 : (page - 1) * PAYROLL_PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAYROLL_PAGE_SIZE, eligibleRecords.length);
  const processing = processStatus === 'loading';

  const handleRunPayroll = (id: string) => {
    const employee = eligibleRecords.find((record) => record.id === id);
    if (!employee) return;
    setRunEmployees([employee]);
    setView('confirm');
  };

  const handleRunAll = () => {
    const selected = eligibleRecords.filter((record) => selectedIds.has(record.id));
    if (selected.length === 0) return;
    setRunEmployees(selected);
    setView('confirm');
  };

  const handleProcess = async (paymentMethod: PaymentMethod) => {
    const payrollIds = runEmployees.map((employee) => employee.id);
    if (payrollIds.length === 0) return;

    setLastPaymentMethod(paymentMethod);
    const result = await dispatch(processHrPayrolls({ payrollIds, paymentMethod }));
    if (processHrPayrolls.fulfilled.match(result)) {
      setSelectedIds(new Set());
      setView('success');
      dispatch(fetchHrPayrolls({ Month: month, Year: year, PageNumber: 1, PageSize: 100, Status: 'Reviewed' }));
      dispatch(fetchPayrollProcessingRecords({ PageNumber: 1, PageSize: 200 }));
    }
  };

  const handleBackToTable = () => {
    setView('table');
    setRunEmployees([]);
  };

  const toggleSelectAll = () => {
    const allSelected = pageRecords.length > 0 && pageRecords.every((record) => selectedIds.has(record.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageRecords.map((record) => record.id)));
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

  if (view === 'confirm') {
    return (
      <RunPayrollConfirmScreen
        employees={runEmployees}
        onBack={handleBackToTable}
        onProcess={handleProcess}
        processing={processing}
      />
    );
  }

  if (view === 'success') {
    const processedTotal = lastProcessResult?.payrolls.reduce((sum, payroll) => sum + (payroll.totalAmount ?? 0), 0);

    return (
      <RunPayrollSuccessScreen
        employeeCount={lastProcessResult?.processedCount ?? runEmployees.length}
        totalAmount={processedTotal ?? runEmployees.reduce((sum, employee) => sum + employee.netSalary, 0)}
        paymentMethod={lastPaymentMethod}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <div className="mt-6">
      <RunPayrollKPICards records={payrolls} eligibleCount={eligibleRecords.length} />
      <RunPayrollTable
        pageRecords={pageRecords}
        allRecords={eligibleRecords}
        selectedIds={selectedIds}
        page={page}
        totalPages={totalPages}
        startRecord={startRecord}
        endRecord={endRecord}
        searchTerm={searchTerm}
        processing={processing}
        setPage={setPage}
        setSearchTerm={setSearchTerm}
        toggleSelectAll={toggleSelectAll}
        toggleSelect={toggleSelect}
        onViewDetails={setDetailsRecord}
        onRunPayroll={handleRunPayroll}
        onRunAll={handleRunAll}
      />

      <EmployeePayrollDetailsPopup
        open={detailsRecord !== null}
        onClose={() => setDetailsRecord(null)}
        payroll={detailsRecord}
        snapshot={selectedSnapshot}
        actionLabel="Run Payroll"
        actionDisabled={!detailsRecord || detailsRecord.status !== 'Reviewed' || processedPayrollIds.has(detailsRecord.id)}
        onAction={(id) => handleRunPayroll(id)}
      />
    </div>
  );
}
