import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Calendar } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import type { ShiftReadDto } from '../../../../models/HRMmodels/Shift';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { updateShiftAssignment, fetchShiftAssignments } from '../../../../features/HRMfeatures/shiftAssignments/shiftAssignmentsSlice';
import { fetchHrShifts } from '../../../../features/HRMfeatures/shifts/hrShiftsSlice';

type Props = {
  open: boolean;
  onClose: () => void;
  employee: HREmployeeReadDto | null;
};

const REASONS = ['Rotation', 'Coverage', 'Employee Request', 'Manager Override'];

export function ShiftTransferPopup({ open, onClose, employee }: Props) {
  const dispatch = useAppDispatch();
  const { shifts = [], status: shiftStatus } = useAppSelector((state: any) => state.hrShifts);
  const { items: assignments } = useAppSelector((state: any) => state.shiftAssignments);

  const [shiftId, setShiftId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reason, setReason] = useState<string>('');

  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  // Initialize and reset when opened
  useEffect(() => {
    if (open) {
      if (shiftStatus === 'idle') {
        dispatch(fetchHrShifts({ PageNumber: 1, PageSize: 100 }));
      }
      if (employee) {
        const currentAssignment = assignments.find((a: any) => a.employeeId === employee.id);
        if (currentAssignment) {
          setShiftId(currentAssignment.shiftId || '');
          // Extract just the YYYY-MM-DD part for the date inputs
          setDateFrom(currentAssignment.from ? currentAssignment.from.substring(0, 10) : '');
          setDateTo(currentAssignment.to ? currentAssignment.to.substring(0, 10) : '');
        } else {
          setShiftId('');
          setDateFrom('');
          setDateTo('');
        }
      } else {
        setShiftId('');
        setDateFrom('');
        setDateTo('');
      }
      setReason('');
    }
  }, [open, dispatch, shiftStatus, employee, assignments]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    if (!employee || !shiftId || !dateFrom || !dateTo || !reason) return;
    
    // Find the employee's current assignment to update
    const currentAssignment = assignments.find((a: any) => a.employeeId === employee.id);
    if (!currentAssignment) {
      console.warn("No existing assignment found to transfer.");
      return;
    }

    dispatch(updateShiftAssignment({
      id: currentAssignment.id,
      payload: {
        shiftId,
        from: new Date(dateFrom).toISOString(),
        to: new Date(dateTo).toISOString(),
        reason
      }
    })).unwrap().then(() => {
      dispatch(fetchShiftAssignments({ PageNumber: 1, PageSize: 100 }));
      handleClose();
    });
  };

  if (!employee) return null;

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
          
          {/* Employee Card */}
          <div>
            <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4 border border-slate-200">
              <div className="flex items-center gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[14px] font-bold text-white bg-[#0B4EA2]"
                >
                  {employee.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-slate-900">{employee.fullName}</div>
                  <div className="text-[13px] text-slate-500">
                    {employee.departmentName} · {employee.positionName}
                  </div>
                </div>
              </div>
              <div className="rounded-full bg-blue-100 px-4 py-1.5 text-[12px] font-bold text-blue-600">
                {employee.status}
              </div>
            </div>
          </div>

          {/* Transfer To (Shift Selection) */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-600">
              <span className="text-slate-400">⏰</span> Transfer To Shift
            </label>
            <div className="relative">
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2]"
              >
                <option value="" disabled>Select a shift</option>
                {shifts.map((s: ShiftReadDto) => <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date from
              </label>
              <div className="relative">
                <input
                  ref={dateFromRef}
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2] transition-colors [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <button
                  type="button"
                  onClick={() => dateFromRef.current?.showPicker()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#0B4EA2] transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date to
              </label>
              <div className="relative">
                <input
                  ref={dateToRef}
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2] transition-colors [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <button
                  type="button"
                  onClick={() => dateToRef.current?.showPicker()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#0B4EA2] transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-3 block text-[13px] font-bold text-slate-600">Reason</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-xl border py-2 text-[13px] font-semibold transition-colors ${
                    reason === r
                      ? 'border-[#0B4EA2] bg-blue-50/50 text-[#0B4EA2]'
                      : 'border-slate-200 text-slate-600 hover:border-[#0B4EA2]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type a custom reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2]"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 border-t border-slate-200 px-8 py-6">
          <button
            type="button"
            onClick={handleClose}
            className="h-12 w-40 rounded-xl border border-slate-300 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!shiftId || !dateFrom || !dateTo || !reason}
            className={`h-12 w-48 rounded-xl text-[14px] font-bold transition-all ${
              (!shiftId || !dateFrom || !dateTo || !reason)
                ? 'bg-slate-300 text-white cursor-not-allowed'
                : 'bg-[#0B4EA2] text-white hover:bg-[#093d82]'
            }`}
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    </Modal>
  );
}
