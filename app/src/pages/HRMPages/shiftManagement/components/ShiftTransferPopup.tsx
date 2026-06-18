import { useState, useEffect } from 'react';
import { X, ChevronDown, Sun, Sunrise, Moon } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import { useAppSelector } from '../../../../store/hooks';

type Props = {
  open: boolean;
  onClose: () => void;
  // If provided, it's an employee-specific transfer (hides date/dept)
  employee: HREmployeeReadDto | null;
};

const DEPARTMENTS = [
  'Housekeeping', 'Front Desk', 'Food & Beverage',
  'Maintenance', 'Security', 'Kitchen', 'Spa & Wellness',
  'Events', 'Management', 'Finance',
];

const REASONS = ['Rotation', 'Coverage', 'Employee Request', 'Manager Override'];

export function ShiftTransferPopup({ open, onClose, employee }: Props) {
  const { employees: allEmployees } = useAppSelector((state: any) => state.hrEmployees);
  const [date, setDate] = useState('2024-05-25');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [transferTo, setTransferTo] = useState<string>('Morning');
  const [reason, setReason] = useState<string>('Rotation');

  // Initialize selected employee if passed via prop
  useEffect(() => {
    if (open) {
      if (employee) {
        setSelectedEmpId(employee.id);
      } else {
        setSelectedEmpId('');
      }
      // Reset defaults
      setTransferTo('Morning');
      setReason('Rotation');
    }
  }, [open, employee]);

  const handleClose = () => {
    onClose();
  };

  const selectedEmployeeObj = (allEmployees as HREmployeeReadDto[] || []).find((e) => e.id === selectedEmpId);

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="flex w-[680px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <h2 className="text-xl font-semibold text-white">Shift Transfer</h2>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-8 py-7 space-y-6" style={{ maxHeight: '75vh' }}>
          
          {/* General Transfer Fields (Hidden if employee-specific transfer) */}
          {!employee && (
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-600">
                  <span className="text-slate-400">📅</span> Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2] [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-600">
                  <span className="text-slate-400">🏢</span> Department
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2]"
                  >
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <label className="mb-2 block text-[15px] font-bold text-slate-700">Employee</label>
            <div className="relative">
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2]"
              >
                <option value="" disabled>Select employee</option>
                 {(allEmployees as HREmployeeReadDto[] || []).map((e) => (
                  <option key={e.id} value={e.id}>{e.fullName}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            {selectedEmployeeObj && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white bg-[#0B4EA2]"
                  >
                    {selectedEmployeeObj.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-slate-900">{selectedEmployeeObj.fullName}</div>
                    <div className="text-[13px] text-slate-500">
                      {selectedEmployeeObj.departmentName} · {selectedEmployeeObj.positionName}
                    </div>
                  </div>
                </div>
                <div className="rounded-full bg-blue-100 px-4 py-1.5 text-[12px] font-bold text-blue-600">
                  {selectedEmployeeObj.status}
                </div>
              </div>
            )}
          </div>

          {/* Transfer To */}
          <div>
            <label className="mb-3 block text-[15px] font-bold text-slate-700">Transfer To</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTransferTo('Morning')}
                className={`flex flex-col rounded-2xl border-2 p-5 text-left transition-colors ${
                  transferTo === 'Morning' ? 'border-[#0B4EA2] bg-blue-50/30' : 'border-slate-200 hover:border-[#0B4EA2]'
                }`}
              >
                <Sun className="h-6 w-6 text-yellow-500 mb-2" />
                <span className="text-[14px] font-bold text-slate-800">Morning</span>
                <span className="text-[12px] text-slate-400 mt-1">A</span>
              </button>
              <button
                type="button"
                onClick={() => setTransferTo('Evening')}
                className={`flex flex-col rounded-2xl border-2 p-5 text-left transition-colors ${
                  transferTo === 'Evening' ? 'border-[#0B4EA2] bg-blue-50/30' : 'border-slate-200 hover:border-[#0B4EA2]'
                }`}
              >
                <Sunrise className="h-6 w-6 text-orange-500 mb-2" />
                <span className="text-[14px] font-bold text-slate-800">Evening</span>
              </button>
              <button
                type="button"
                onClick={() => setTransferTo('Night')}
                className={`flex flex-col rounded-2xl border-2 p-5 text-left transition-colors ${
                  transferTo === 'Night' ? 'border-[#0B4EA2] bg-blue-50/30' : 'border-slate-200 hover:border-[#0B4EA2]'
                }`}
              >
                <Moon className="h-6 w-6 text-indigo-500 mb-2" />
                <span className="text-[14px] font-bold text-slate-800">Night</span>
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-3 block text-[15px] font-bold text-slate-700">Reason</label>
            <div className="grid grid-cols-2 gap-3">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-xl border-2 py-3 text-[14px] font-semibold transition-colors ${
                    reason === r
                      ? 'border-[#0B4EA2] bg-blue-50/50 text-[#0B4EA2]'
                      : 'border-slate-200 text-slate-600 hover:border-[#0B4EA2]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 border-t border-slate-200 px-8 py-6">
          <button
            type="button"
            onClick={handleClose}
            className="h-12 w-40 rounded-xl border border-slate-300 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={!selectedEmpId}
            className={`h-12 w-48 rounded-xl text-[14px] font-bold transition-all ${
              selectedEmpId
                ? 'bg-[#0B4EA2] text-white hover:bg-[#093d82]'
                : 'bg-slate-300 text-white cursor-not-allowed'
            }`}
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    </Modal>
  );
}
