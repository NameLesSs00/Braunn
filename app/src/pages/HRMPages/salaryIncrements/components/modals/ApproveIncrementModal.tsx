import { Modal } from '../../../../../shared/ui/Modal';
import { IoClose } from 'react-icons/io5';
import { SalaryRecord } from '../../types';
import { ProfileSection } from './shared/ProfileSection';
import { SalaryComparison } from './shared/SalaryComparison';
import { IncrementStats } from './shared/IncrementStats';
import { DetailsList } from './shared/DetailsList';

type Props = {
  open: boolean;
  onClose: () => void;
  record: SalaryRecord | null;
  onApprove: (id: string) => void;
};

export function ApproveIncrementModal({ open, onClose, record, onApprove }: Props) {
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0B4EA2] px-7 py-5 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-semibold">Increment Details</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-8 pb-6 flex-1 overflow-y-auto">
          <ProfileSection 
            record={record} 
            circleColorClass="bg-[#6366f1]" // Indigo for RD
            badgeBgColorClass="bg-[#fffbeb]" // Amber-50
            badgeTextColorClass="text-[#d97706]" // Amber-600
            badgeText="Pending"
          />

          <SalaryComparison record={record} />
          
          <IncrementStats record={record} />
          
          <DetailsList record={record} />
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 grid grid-cols-2 gap-4">
          <button 
            onClick={onClose}
            className="py-3.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-[15px] hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onApprove(record.id)}
            className="py-3.5 rounded-xl bg-[#0B4EA2] text-white font-semibold text-[15px] hover:bg-[#0a428a] transition-colors shadow-sm"
          >
            Approval
          </button>
        </div>
      </div>
    </Modal>
  );
}
