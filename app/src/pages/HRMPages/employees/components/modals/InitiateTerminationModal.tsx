import { useState } from 'react';
import { Modal } from '../../../../../shared/ui/Modal';
import { IoClose } from 'react-icons/io5';
import { AlertTriangle } from 'lucide-react';
import { Employee } from '../EmployeesTable';

type Props = {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSubmit: (data: any) => void;
};

const TERMINATION_TYPES = [
  'Resignation',
  'End of Contract',
  'Retirement',
  'Dismissal'
];

export function InitiateTerminationModal({ open, onClose, employee, onSubmit }: Props) {
  const [terminationType, setTerminationType] = useState('Resignation');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  if (!employee) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0B4EA2] px-7 py-5 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-semibold">Initiate Termination</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-8 pb-6 flex-1 overflow-y-auto">
          {/* Warning Banner */}
          <div className="bg-[#FEF2F2] border border-red-100 rounded-xl p-5 mb-8 flex gap-4 items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[14px] text-red-700 leading-relaxed font-medium">
              This will initiate the termination process for <span className="font-bold">{employee.fullName}</span>. 
              The request will require HR and Finance approval.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-3">Termination Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {TERMINATION_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setTerminationType(type)}
                    className={`py-3 px-4 rounded-xl text-[14px] font-semibold transition-colors border ${
                      terminationType === type
                        ? 'border-red-400 text-red-500 bg-red-50/30'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">Termination Date *</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-slate-700 mb-2">Reason / Notes *</label>
              <textarea 
                placeholder="Provide detailed reason for termination..." 
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
            className="py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-[15px] hover:bg-slate-50 transition-colors"
          >
            cancel
          </button>
          <button 
            onClick={() => onSubmit({ type: terminationType, date, reason })}
            disabled={!date || !reason}
            className="py-3.5 rounded-xl bg-[#0B4EA2] text-white font-semibold text-[15px] hover:bg-[#0a428a] transition-colors shadow-sm disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
}
