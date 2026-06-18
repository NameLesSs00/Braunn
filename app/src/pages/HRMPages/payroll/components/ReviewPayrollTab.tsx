import { useState } from 'react';
import { REVIEW_PAYROLL_MOCK_DATA, ReviewPayrollRecord } from '../reviewPayrollMockData';
import { EmployeePayrollDetailsPopup } from './EmployeePayrollDetailsPopup';
import { ReviewPayrollKPICards } from './review/ReviewPayrollKPICards';
import { ReviewPayrollTable } from './review/ReviewPayrollTable';

const PAGE_SIZE = 5;

export function ReviewPayrollTab() {
  const [records, setRecords] = useState(REVIEW_PAYROLL_MOCK_DATA);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailsRecord, setDetailsRecord] = useState<ReviewPayrollRecord | null>(null);

  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const pageRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startRecord = (page - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAGE_SIZE, records.length);

  const handleApprove = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: 'REVIEWED' } : r));
  };

  const handleApproveSelected = () => {
    setRecords(records.map(r => selectedIds.has(r.id) ? { ...r, status: 'REVIEWED' } : r));
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageRecords.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div className="mt-6">
      <ReviewPayrollKPICards />
      <ReviewPayrollTable 
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
        handleApprove={handleApprove}
        handleApproveSelected={handleApproveSelected}
        setDetailsRecord={setDetailsRecord}
      />

      {/* Details Popup */}
      <EmployeePayrollDetailsPopup 
        open={detailsRecord !== null}
        onClose={() => setDetailsRecord(null)}
        record={detailsRecord}
        onApprove={handleApprove}
      />
    </div>
  );
}
