import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import type { ShiftReadDto } from '../../../../models/HRMmodels/Shift';
import { assignShift } from '../../../../features/HRMfeatures/shiftAssignments/shiftAssignmentsSlice';
import { fetchHrShifts } from '../../../../features/HRMfeatures/shifts/hrShiftsSlice';
import { fetchDepartments } from '../../../../features/HRMfeatures/departments/departmentsSlice';
import { resolveMediaUrl } from '../../../../shared/utils/resolveMediaUrl';

type Props = {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedEmployees: HREmployeeReadDto[];
};

export function AssignEmployeePopup({ open, onClose, onBack, selectedEmployees }: Props) {
  const dispatch = useAppDispatch();
  const { shifts } = useAppSelector(state => state.hrShifts);
  const { departments } = useAppSelector(state => state.departments);
  const [employees, setEmployees] = useState<HREmployeeReadDto[]>(selectedEmployees);
  const [shiftId, setShiftId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  // Fetch shifts and departments when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchHrShifts(undefined));
      dispatch(fetchDepartments(undefined));
    }
  }, [open, dispatch]);

  // Sync employees when prop changes (step transition)
  useEffect(() => {
    if (open && selectedEmployees.length > 0) {
      setEmployees(selectedEmployees);
    }
  }, [open, selectedEmployees]);

  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClose = () => {
    setEmployees([]);
    setShiftId('');
    setDepartmentId('');
    onClose();
  };

  const handleAssign = () => {
    if (!shiftId || employees.length === 0 || !dateFrom || !dateTo) return;
    const selectedDept = departments.find(d => d.id === departmentId);
    dispatch(assignShift({
      employeeIds: employees.map(e => e.id),
      shiftId,
      from: new Date(dateFrom).toISOString(),
      to: new Date(dateTo).toISOString(),
      reason: selectedDept ? `Assigned to ${selectedDept.name}` : 'Assigned via UI'
    })).then(() => {
      handleClose();
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const selectedShift = shifts.find((s: ShiftReadDto) => s.id === shiftId);
  const shiftName = selectedShift?.name || 'Unknown Shift';
  const shiftTimeLabel = selectedShift ? `${selectedShift.startTime} - ${selectedShift.endTime}` : '--';
  const selectedDept = departments.find(d => d.id === departmentId);

  const getAvatarContent = (emp: HREmployeeReadDto) => {
    const initial = emp.fullName?.charAt(0)?.toUpperCase() ?? '?';
    return (
      <div className="relative h-9 w-9 shrink-0">
        <div className="absolute inset-0 grid place-items-center rounded-full text-[11px] font-bold text-white bg-[#0B4EA2]">
          {initial}
        </div>
        {emp.imageUrl && (
          <img
            src={resolveMediaUrl(emp.imageUrl)}
            alt={emp.fullName}
            className="absolute inset-0 h-9 w-9 rounded-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="flex w-[680px] max-w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <h2 className="text-xl font-semibold text-white">Assign employee</h2>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-8 py-7 space-y-5" style={{ maxHeight: '75vh' }}>

          {/* Shift */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-600">
              <span className="text-slate-400">⏰</span> Shift
            </label>
            <div className="relative">
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2]"
              >
                {shifts.map((s: ShiftReadDto) => <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-600">
              <span className="text-slate-400">🏢</span> Department
            </label>
            <div className="relative">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[14px] text-slate-700 outline-none focus:border-[#0B4EA2]"
              >
                <option value="">No specific department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
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

          {/* Selected Employees Card */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-[15px] font-bold text-slate-800">
                Selected Employees ({employees.length})
              </span>
            </div>

            {/* Employee Table */}
            <table className="w-full">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  {['Employee', 'Position', 'Shift Time', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[12px] font-bold text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-t border-slate-100">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {getAvatarContent(emp)}
                        <div>
                          <div className="text-[13px] font-bold text-[#0B4EA2]">{emp.fullName}</div>
                          <div className="text-[11px] text-slate-400">{emp.employeeCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-600">{emp.positionName}</td>
                    <td className="px-5 py-3 text-[13px] text-slate-600">{shiftTimeLabel}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => removeEmployee(emp.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-400 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Bar */}
            <div className="grid grid-cols-4 border-t border-slate-200 bg-[#F8FAFC] px-6 py-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</div>
                <div className="mt-1 text-[13px] font-bold text-slate-800">{selectedDept?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift</div>
                <div className="mt-1 text-[13px] font-bold text-slate-800">{shiftName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</div>
                <div className="mt-1 text-[13px] font-bold text-slate-800">{shiftTimeLabel}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</div>
                <div className="mt-1 text-[13px] font-bold text-slate-800">{formatDate(dateFrom)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 border-t border-slate-200 px-8 py-5">
          <button
            type="button"
            onClick={onBack}
            className="h-12 w-40 rounded-xl border border-slate-300 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="h-12 w-48 rounded-xl bg-[#0B4EA2] text-[14px] font-bold text-white transition-colors hover:bg-[#093d82]"
          >
            Assign to Shift
          </button>
        </div>
      </div>
    </Modal>
  );
}
