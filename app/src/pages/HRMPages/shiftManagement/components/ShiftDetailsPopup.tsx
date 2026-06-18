import { X } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { Shift } from '../types';
import { getDeptColor } from '../deptColors';
import { useAppSelector } from '../../../../store/hooks';
import { resolveMediaUrl } from '../../../../shared/utils/resolveMediaUrl';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';

type Props = {
  open: boolean;
  onClose: () => void;
  shift: Shift | null;
};

export function ShiftDetailsPopup({ open, onClose, shift }: Props) {
  const { employees } = useAppSelector((state: any) => state.hrEmployees);
  
  // Build a fast lookup map: employeeId -> HREmployeeReadDto
  const empMap = new Map<string, HREmployeeReadDto>(
    (employees || []).map((e: HREmployeeReadDto) => [e.id, e])
  );

  if (!shift) return null;

  const color = getDeptColor(shift.department);
  const assignedEmployees = shift.assignedEmployees || [];

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: color }}>
          <div>
            <h2 className="text-[16px] font-semibold text-white">Shift Details</h2>
            <p className="text-[12px] text-white/70 mt-0.5">{shift.department}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shift Info Card */}
        <div className="px-6 pt-5 pb-2">
          <div className="rounded-xl p-4 text-white shadow-sm flex items-center justify-between" style={{ backgroundColor: color }}>
            <div>
              <div className="text-[16px] font-bold">{shift.type}</div>
              <div className="mt-1 text-[13px] opacity-80">
                {shift.startTime} – {shift.endTime}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-black opacity-90">{assignedEmployees.length}</div>
              <div className="text-[11px] opacity-70 font-medium">assigned</div>
            </div>
          </div>
        </div>

        {/* Assigned Employees */}
        <div className="px-6 pb-6">
          <div className="mb-3 mt-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
            Assigned Employees
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {assignedEmployees.length > 0 ? (
              assignedEmployees.map((emp) => {
                const fullEmp = empMap.get(emp.id);
                const imageUrl = fullEmp?.imageUrl ? resolveMediaUrl(fullEmp.imageUrl) : null;
                const department = fullEmp?.departmentName || shift.department;
                const position = fullEmp?.positionName || '';

                return (
                  <div key={emp.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 hover:bg-slate-100 transition-colors">
                    {/* Avatar — photo if available, initials otherwise */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={emp.name}
                        className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white ${imageUrl ? 'hidden' : ''}`}
                      style={{ backgroundColor: color }}
                    >
                      {emp.initials}
                    </div>

                    {/* Name + department/position */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-slate-800 truncate">{emp.name}</div>
                      {position && (
                        <div className="text-[12px] text-slate-500 truncate">{position}</div>
                      )}
                    </div>

                    {/* Department pill */}
                    <div
                      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                      style={{ backgroundColor: color + 'CC' }}
                    >
                      {department}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <div className="text-3xl mb-2">👤</div>
                <div className="text-[13px] font-medium">No employees assigned</div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl border-2 border-slate-200 py-3 text-[14px] font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
