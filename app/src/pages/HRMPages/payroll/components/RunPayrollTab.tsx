import { useState } from 'react';
import { REVIEW_PAYROLL_MOCK_DATA, ReviewPayrollRecord } from '../reviewPayrollMockData';
import { EmployeePayrollDetailsPopup } from './EmployeePayrollDetailsPopup';
import { RunPayrollKPICards } from './runPayroll/RunPayrollKPICards';
import { RunPayrollTable } from './runPayroll/RunPayrollTable';
import { RunPayrollConfirmScreen } from './runPayroll/RunPayrollConfirmScreen';
import { RunPayrollSuccessScreen } from './runPayroll/RunPayrollSuccessScreen';

type View = 'table' | 'confirm' | 'success';

const PAGE_SIZE = 5;

export function RunPayrollTab() {
  const [view, setView] = useState<View>('table');
  const [records, setRecords] = useState(REVIEW_PAYROLL_MOCK_DATA);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailsRecord, setDetailsRecord] = useState<ReviewPayrollRecord | null>(null);

  // Employees selected to run payroll on
  const [runEmployees, setRunEmployees] = useState<ReviewPayrollRecord[]>([]);

  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const pageRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRecord = (page - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAGE_SIZE, records.length);

  // Mark a single record as processed and navigate to confirm screen
  const handleRunPayroll = (id: string) => {
    const emp = records.find((r) => r.id === id);
    if (emp) {
      setRunEmployees([emp]);
      setView('confirm');
    }
  };

  // Run payroll for all selected records
  const handleRunAll = () => {
    const selected = records.filter((r) => selectedIds.has(r.id));
    if (selected.length === 0) return;
    setRunEmployees(selected);
    setView('confirm');
  };

  // After "Process Payroll" is clicked on confirm screen
  const handleProcess = () => {
    setRecords((prev) =>
      prev.map((r) =>
        runEmployees.some((e) => e.id === r.id) ? { ...r, status: 'REVIEWED' } : r
      )
    );
    setSelectedIds(new Set());
    setView('success');
  };

  // Back to table
  const handleBackToTable = () => {
    setView('table');
    setRunEmployees([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageRecords.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const successTotal = runEmployees.reduce((sum, e) => sum + e.netPay, 0);

  if (view === 'confirm') {
    return (
      <RunPayrollConfirmScreen
        employees={runEmployees}
        onBack={handleBackToTable}
        onProcess={handleProcess}
      />
    );
  }

  if (view === 'success') {
    return (
      <RunPayrollSuccessScreen
        employeeCount={runEmployees.length}
        totalAmount={successTotal}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <div className="mt-6">
      <RunPayrollKPICards />
      <RunPayrollTable
        pageRecords={pageRecords}
        allRecords={records}
        selectedIds={selectedIds}
        page={page}
        totalPages={totalPages}
        startRecord={startRecord}
        endRecord={endRecord}
        setPage={setPage}
        toggleSelectAll={toggleSelectAll}
        toggleSelect={toggleSelect}
        onViewDetails={setDetailsRecord}
        onRunPayroll={handleRunPayroll}
        onRunAll={handleRunAll}
      />

      <EmployeePayrollDetailsPopup
        open={detailsRecord !== null}
        onClose={() => setDetailsRecord(null)}
        record={detailsRecord}
        onApprove={(id) => {
          const emp = records.find((r) => r.id === id);
          if (emp) {
            setRunEmployees([emp]);
            setDetailsRecord(null);
            setView('confirm');
          }
        }}
      />
    </div>
  );
}
