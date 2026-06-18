import { Modal } from '../../../../../shared/ui/Modal';
import { IoClose } from 'react-icons/io5';
import { SalaryRecord } from '../../types';

type Props = {
  open: boolean;
  onClose: () => void;
  record: SalaryRecord | null;
  onSubmit: (data: any) => void;
};

export function AddIncrementModal({ open, onClose, record, onSubmit }: Props) {
  if (!record) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0B4EA2] px-7 py-5 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-semibold">Add Salary Increment</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-8 pb-6 flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0B4EA2] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {record.employee.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-[15px]">{record.employee}</h3>
                <p className="text-[13px] text-slate-500">{record.role} · {record.department}</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[13px] text-slate-400 font-medium mb-1">Current Salary</p>
               <p className="text-[17px] font-bold text-[#0B4EA2]">{record.newSalary}/yr</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">Current Salary</label>
              <input 
                type="text" 
                value={record.newSalary} 
                disabled 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-500 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">New Salary (Annual) *</label>
              <input 
                type="text" 
                placeholder="e.g. 75000" 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-800 focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">Effective Date *</label>
              <input 
                type="date" 
                defaultValue="2026-06-01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">Next Review Date</label>
              <input 
                type="date" 
                defaultValue="2026-06-01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">Reason for Increment *</label>
              <textarea 
                placeholder="Annual review, promotion, retention offer, market adjustment..." 
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-800 focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 grid grid-cols-2 gap-4 pt-2">
          <button 
            onClick={onClose}
            className="py-3.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-[15px] hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSubmit({})}
            className="py-3.5 rounded-xl bg-[#0B4EA2] text-white font-semibold text-[15px] hover:bg-[#0a428a] transition-colors shadow-sm"
          >
            Submit for Approval
          </button>
        </div>
      </div>
    </Modal>
  );
}
