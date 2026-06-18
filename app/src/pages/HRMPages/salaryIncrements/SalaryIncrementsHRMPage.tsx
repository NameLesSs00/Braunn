import { useState } from 'react';
import { FilterType, SalaryRecord } from './types';
import { mockRecords } from './mockData';
import { SalaryIncrementsFilters } from './components/SalaryIncrementsFilters';
import { SalaryIncrementsTable } from './components/SalaryIncrementsTable';
import { ViewIncrementModal } from './components/modals/ViewIncrementModal';
import { ApproveIncrementModal } from './components/modals/ApproveIncrementModal';
import { HistoryIncrementModal } from './components/modals/HistoryIncrementModal';
import { AddIncrementModal } from './components/modals/AddIncrementModal';

export function SalaryIncrementsHRMPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  
  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);

  // Actions
  const openView = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
  };

  const openAdd = () => {
    // Defaulting to Thomas Miller for the prototype as requested
    setSelectedRecord(mockRecords[0]);
    setAddModalOpen(true);
  };

  const openApprove = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setApproveModalOpen(true);
  };

  const openHistory = (record: SalaryRecord) => {
    setSelectedRecord(record);
    setHistoryModalOpen(true);
  };

  const handleApprove = (id: string) => {
    // Just closing for now as per plan, in real app would mutate state
    setApproveModalOpen(false);
    console.log(`Approved increment for record ${id}`);
  };

  const handleAddSubmit = (data: any) => {
    setAddModalOpen(false);
    console.log(`Submitted new increment`, data);
  };

  // Filtering
  const filteredRecords = mockRecords.filter(record => {
    if (activeFilter === 'All') return true;
    return record.status === activeFilter;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Modals */}
      <ViewIncrementModal 
        open={viewModalOpen} 
        onClose={() => setViewModalOpen(false)} 
        record={selectedRecord} 
      />
      <ApproveIncrementModal 
        open={approveModalOpen} 
        onClose={() => setApproveModalOpen(false)} 
        record={selectedRecord} 
        onApprove={handleApprove}
      />
      <HistoryIncrementModal 
        open={historyModalOpen} 
        onClose={() => setHistoryModalOpen(false)} 
        record={selectedRecord} 
      />
      <AddIncrementModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        record={selectedRecord}
        onSubmit={handleAddSubmit}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Salary Increments</h1>
        <p className="text-slate-500 mt-1">Track salary increases and employee compensation updates.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <SalaryIncrementsFilters 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
          recordCount={filteredRecords.length}
          onAddClick={openAdd}
        />

        <SalaryIncrementsTable 
          records={filteredRecords}
          onView={openView}
          onHistory={openHistory}
          onApprove={openApprove}
        />
      </div>
    </div>
  );
}
