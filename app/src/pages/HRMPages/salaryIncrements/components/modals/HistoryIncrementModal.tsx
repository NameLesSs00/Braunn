import { Modal } from '../../../../../shared/ui/Modal';
import { IoClose } from 'react-icons/io5';
import { SalaryRecord } from '../../types';

type Props = {
  open: boolean;
  onClose: () => void;
  record: SalaryRecord | null;
};

export function HistoryIncrementModal({ open, onClose, record }: Props) {
  if (!record) return null;

  // Mocked history data mimicking the design
  const historyList = [
    {
      id: 1,
      oldSalary: '$82,000',
      newSalary: '$90,000',
      reason: 'Promotion to General Manager',
      incrementAmount: '+$8,000',
      incrementPercent: '+9.76%',
      date: '2024-01-01',
      type: 'increase',
    },
    {
      id: 2,
      oldSalary: '$90,000',
      newSalary: '$90,000',
      reason: 'Salary freeze — restructuring period',
      incrementAmount: 'No change',
      incrementPercent: '',
      date: '2025-01-01',
      type: 'neutral',
    },
    {
      id: 3,
      oldSalary: '$90,000',
      newSalary: '$95,000',
      reason: 'Annual review — Exceptional rating',
      incrementAmount: '+$5,000',
      incrementPercent: '+5.56%',
      date: '2026-01-01',
      type: 'increase',
    },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0B4EA2] px-7 py-5 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-semibold">Salary History — {record.employee}</h2>
          <button onClick={onClose} className="text-white hover:text-white/80 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          {/* Profile Section specific to History */}
          <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#0B4EA2] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {record.employee.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{record.employee}</h3>
                <p className="text-[13px] text-slate-500">{record.role} · {record.department}</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[13px] text-slate-400 font-medium mb-1">Current Salary</p>
               <p className="text-[17px] font-bold text-[#0B4EA2]">{record.newSalary}/yr</p>
            </div>
          </div>

          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Increment History</h4>

          <div className="space-y-4">
            {historyList.map((item) => (
              <div key={item.id} className="border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm shadow-slate-50">
                <div className="flex items-start gap-4">
                  <div className="mt-2.5">
                    <div className={`w-2 h-2 rounded-full ${item.type === 'increase' ? 'bg-[#10b981]' : 'bg-slate-400'}`}></div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800 text-[15px] mb-1">
                      {item.oldSalary} <span className="font-medium text-slate-400 mx-1">→</span> {item.newSalary}
                    </h5>
                    <p className="text-[13px] text-slate-500">{item.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-[13px] mb-1 ${item.type === 'increase' ? 'text-[#10b981]' : 'text-slate-400'}`}>
                    {item.incrementAmount} {item.incrementPercent && `(${item.incrementPercent})`}
                  </p>
                  <p className="text-[12px] text-slate-400 font-medium">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
