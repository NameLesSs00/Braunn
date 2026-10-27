import { FiCheckCircle, FiClock, FiEdit2, FiTrash2, FiUser, FiHome } from 'react-icons/fi';
import type { HkmReceptionAssignmentReadDto } from '../../../../models/HKmodels/HkmReceptionAssignment';

interface CleaningTasksTableProps {
  assignments: HkmReceptionAssignmentReadDto[];
  roomNumberMap: Map<string, string>;
  employeeNameMap: Map<string, string>;
  onSetProgress: (id: number) => Promise<void>;
  onComplete: (id: number) => Promise<void>;
  onEdit: (assignment: HkmReceptionAssignmentReadDto) => void;
  onDelete: (id: number) => Promise<void>;
  loadingActionId: number | null;
}

export function CleaningTasksTable({
  assignments,
  roomNumberMap,
  employeeNameMap,
  onSetProgress,
  onComplete,
  onEdit,
  onDelete,
  loadingActionId,
}: CleaningTasksTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <FiHome className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-700">No Cleaning Assignments Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Dirty rooms can be assigned directly from the <strong>Room Status</strong> page when rooms are inspected.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              <th className="px-5 py-3.5">Assignment</th>
              <th className="px-5 py-3.5">Room</th>
              <th className="px-5 py-3.5">Assigned Staff</th>
              <th className="px-5 py-3.5">Instructions / Notes</th>
              <th className="px-5 py-3.5">Assigned At</th>
              <th className="px-5 py-3.5">Assigned By</th>
              <th className="px-5 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {assignments.map((task) => {
              const roomNumber = roomNumberMap.get(task.roomId) || task.roomId.slice(0, 8);
              const employeeName = employeeNameMap.get(task.employeeId) || task.employeeId.slice(0, 8);
              const isActionLoading = loadingActionId === task.id;

              return (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* ID */}
                  <td className="px-5 py-4 font-mono font-bold text-[#0B4EA2]">
                    #ASN-{String(task.id).padStart(4, '0')}
                  </td>

                  {/* Room */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-50 text-[#0B4EA2] flex items-center justify-center font-bold text-xs">
                        <FiHome className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 text-xs">Room {roomNumber}</span>
                    </div>
                  </td>

                  {/* Staff */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        <FiUser className="h-3 w-3" />
                      </div>
                      <span className="font-semibold text-slate-800">{employeeName}</span>
                    </div>
                  </td>

                  {/* Note */}
                  <td className="px-5 py-4 max-w-[240px]">
                    <span className="text-slate-600 truncate block">
                      {task.note || <span className="text-slate-400 italic">No notes provided</span>}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : '-'}
                  </td>

                  {/* Created By */}
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {task.createdBy || '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Set In Progress */}
                      <button
                        type="button"
                        onClick={() => onSetProgress(task.id)}
                        disabled={isActionLoading}
                        title="Set Cleaning In Progress"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FiClock className="h-3.5 w-3.5" />
                        <span>In Progress</span>
                      </button>

                      {/* Complete */}
                      <button
                        type="button"
                        onClick={() => onComplete(task.id)}
                        disabled={isActionLoading}
                        title="Mark Cleaning Completed"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FiCheckCircle className="h-3.5 w-3.5" />
                        <span>Complete</span>
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        disabled={isActionLoading}
                        title="Edit Note / Staff"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        disabled={isActionLoading}
                        title="Delete Assignment"
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
