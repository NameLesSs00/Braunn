import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { Shift } from '../types';
import { getDeptColor } from '../deptColors';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { deleteShiftAssignment, fetchShiftAssignments } from '../../../../features/HRMfeatures/shiftAssignments/shiftAssignmentsSlice';
import { resolveMediaUrl } from '../../../../shared/utils/resolveMediaUrl';
import type { HREmployeeReadDto } from '../../../../models/HRMmodels/HREmployee';
import { showPromiseToast } from '../../../../shared/ui/toastFeedback';

type Props = {
  open: boolean;
  onClose: () => void;
  shift: Shift | null;
};

export function ShiftDetailsPopup({ open, onClose, shift }: Props) {
  const { employees } = useAppSelector((state: any) => state.hrEmployees);
  const dispatch = useAppDispatch();
  const [removingAssignmentId, setRemovingAssignmentId] = useState<string | null>(null);

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!assignmentId) return;

    setRemovingAssignmentId(assignmentId);
    try {
      await showPromiseToast(
        dispatch(deleteShiftAssignment(assignmentId)).unwrap(),
        {
          loading: 'Removing employee from shift...',
          success: 'Employee removed from shift successfully',
          error: 'Failed to remove employee from shift',
        },
      );
      dispatch(fetchShiftAssignments({ PageNumber: 1, PageSize: 100 }));
    } catch {
      // The toast already shows the API error; keep the details modal open.
    } finally {
      setRemovingAssignmentId(null);
    }
  };
  
  // Build a fast lookup map: employeeId -> HREmployeeReadDto
  const empMap = new Map<string, HREmployeeReadDto>(
    (employees || []).map((e: HREmployeeReadDto) => [e.id, e])
  );

  if (!shift) return null;

  const color = getDeptColor(shift.department);
  const assignedEmployees = shift.assignedEmployees || [];

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex w-[750px] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5" style={{ backgroundColor: color }}>
          <div>
            <h2 className="text-[18px] font-bold text-white tracking-wide">Shift Details</h2>
            <p className="text-[13px] text-white/80 mt-0.5 font-medium uppercase tracking-wider">{shift.department}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-white/90 transition-all hover:bg-black/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shift Info Card */}
        <div className="px-8 pt-6 pb-2">
          <div className="rounded-2xl p-5 text-white shadow-md flex items-center justify-between bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm relative overflow-hidden" style={{ backgroundColor: color }}>
            {/* Decorative pattern */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
            <div className="absolute right-12 -bottom-10 w-24 h-24 bg-black opacity-5 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="text-[20px] font-black tracking-tight">{shift.type}</div>
              <div className="mt-1 flex items-center gap-2 text-[14px] font-medium opacity-90">
                <span className="bg-black/10 px-2 py-0.5 rounded-md">{shift.startTime}</span>
                <span className="opacity-60">—</span>
                <span className="bg-black/10 px-2 py-0.5 rounded-md">{shift.endTime}</span>
              </div>
            </div>
            <div className="text-right relative z-10">
              <div className="text-[32px] font-black leading-none drop-shadow-sm">{assignedEmployees.length}</div>
              <div className="text-[12px] opacity-80 font-bold uppercase tracking-widest mt-1">assigned</div>
            </div>
          </div>
        </div>

        {/* Assigned Employees */}
        <div className="px-8 pb-8 flex-1 flex flex-col min-h-0">
          <div className="mb-4 mt-6 flex items-center justify-between">
            <div className="text-[14px] font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
              Assigned Personnel
            </div>
            <div className="text-[13px] font-medium text-slate-400">
              Total: {assignedEmployees.length}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-2">
            {assignedEmployees.length > 0 ? (
              assignedEmployees.map((emp) => {
                const fullEmp = empMap.get(emp.id);
                const imageUrl = fullEmp?.imageUrl ? resolveMediaUrl(fullEmp.imageUrl) : null;
                const position = fullEmp?.positionName || '';

                return (
                  <div key={emp.id} className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={emp.name}
                          className="h-12 w-12 shrink-0 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-slate-100 transition-all"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-[14px] font-black text-white shadow-sm ring-2 ring-transparent group-hover:ring-slate-100 transition-all ${imageUrl ? 'hidden' : ''}`}
                        style={{ backgroundColor: color }}
                      >
                        {emp.initials}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[15px] font-bold text-slate-800 truncate pr-2">{emp.name}</div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(emp.assignmentId)}
                            disabled={removingAssignmentId === emp.assignmentId}
                            className="shrink-0 grid h-7 w-7 place-items-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                            title="Remove from shift"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {position && (
                          <div className="text-[13px] font-medium text-slate-500 truncate mt-0.5">{position}</div>
                        )}
                        {emp.reason && (
                          <div className="mt-2 inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-slate-600 border border-slate-100 w-full truncate">
                            <span className="opacity-70 mr-1.5">Reason:</span> 
                            <span className="truncate">{emp.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="text-4xl mb-3 opacity-50">👥</div>
                <div className="text-[15px] font-semibold text-slate-600">No employees assigned</div>
                <div className="text-[13px] text-slate-400 mt-1">Assign employees to this shift to see them here.</div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-slate-50 py-3.5 text-[15px] font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800 focus:ring-4 focus:ring-slate-100"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
