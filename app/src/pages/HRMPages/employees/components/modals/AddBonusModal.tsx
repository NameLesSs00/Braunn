import { useState } from 'react';
import { Modal } from '../../../../../shared/ui/Modal';
import { IoClose } from 'react-icons/io5';
import { Employee } from '../EmployeesTable';
import type { BonusDeductionCreateDto } from '../../../../../models/HRMmodels/BonusesAndDeductions';

type Props = {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (data: BonusDeductionCreateDto) => void;
};

export function AddBonusModal({ open, onClose, employee, onSubmit }: Props) {
  const [amount, setAmount] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');

  if (!employee) return null;

  const handleSubmit = () => {
    if (!amount || !effectiveDate) return;
    
    onSubmit({
      employeeId: employee.id,
      amount: Number(amount),
      effectiveDate: new Date(effectiveDate).toISOString(),
      reason: reason || 'Bonus'
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[500px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0B4EA2] px-7 py-5 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-semibold">Add New Bonus</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-8 pb-6 flex-1 overflow-y-auto">
          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">Employee</label>
              <input 
                type="text" 
                value={employee.fullName} 
                disabled 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-500 cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">AMOUNT</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-800 focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">EFFECTIVE DATE</label>
              <input 
                type="datetime-local" 
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">REASON/NOTES</label>
              <textarea 
                placeholder="Describe the reason for this bonus..." 
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
            onClick={handleSubmit}
            className="py-3.5 rounded-xl bg-[#0B4EA2] text-white font-semibold text-[15px] hover:bg-[#0a428a] transition-colors shadow-sm"
          >
            Save Bonus
          </button>
        </div>
      </div>
    </Modal>
  );
}
