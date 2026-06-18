import { X, Download, PlayCircle, XCircle } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { ReviewPayrollRecord } from '../reviewPayrollMockData';
import { DetailsProfileHeader } from './details/DetailsProfileHeader';
import { DetailsSalaryEquation } from './details/DetailsSalaryEquation';
import { DetailsBreakdownGrid } from './details/DetailsBreakdownGrid';

type Props = {
  open: boolean;
  onClose: () => void;
  record: ReviewPayrollRecord | null;
  onApprove: (id: string) => void;
};

export function EmployeePayrollDetailsPopup({ open, onClose, record, onApprove }: Props) {
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[90vh] w-[900px] flex-col overflow-hidden rounded-[20px] bg-[#F8FAFC] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <h2 className="text-[20px] font-bold text-[#1a365d]">Employee Payroll Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <DetailsProfileHeader record={record} />
          <DetailsSalaryEquation record={record} />
          <DetailsBreakdownGrid record={record} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[14px] font-bold text-slate-700 transition-colors hover:bg-slate-50">
            <Download className="h-4 w-4" /> Download Payslip
          </button>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 rounded-xl border border-red-500 px-8 py-2.5 text-[14px] font-bold text-red-500 transition-colors hover:bg-red-50">
              <XCircle className="h-4 w-4" /> Reject
            </button>
            <button 
              onClick={() => {
                onApprove(record.id);
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-8 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#0a428a]"
            >
              <PlayCircle className="h-4 w-4" /> Run Payroll
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
