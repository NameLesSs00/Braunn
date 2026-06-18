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
};

export function ViewIncrementModal({ open, onClose, record }: Props) {
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header - Fixed Blue color, clipped by the rounded wrapper */}
        <div className="bg-[#0B4EA2] px-7 py-5 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-semibold">Increment Details</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-8 pb-6 flex-1 overflow-y-auto">
          <ProfileSection 
            record={record} 
            circleColorClass="bg-[#14b8a6]" // Teal for DR
            badgeBgColorClass="bg-[#ecfdf5]" // Very light green
            badgeTextColorClass="text-[#10b981]" // Emerald
            badgeText="Active"
          />

          <SalaryComparison record={record} />
          
          <IncrementStats record={record} />
          
          <DetailsList record={record} />
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-center">
          <button 
            onClick={onClose}
            className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-[15px] hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
