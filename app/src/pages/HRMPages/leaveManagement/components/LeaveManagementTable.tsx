import { useAppDispatch, useAppSelector } from '../../../../shared/apis/hooks';
import { updateHrLeaveStatus, deleteHrLeave } from '../../../../features/HRMfeatures/leaves/hrLeavesSlice';
import type { LeaveReadDto, LeaveStatus } from '../../../../models/HRMmodels/Leave';
import { FiTrash2 } from 'react-icons/fi';

// ── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_PALETTE = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-teal-600', 'bg-emerald-600', 'bg-orange-500',
];

function avatarColor(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysBetween(from: string, to: string) {
  const a = new Date(from), b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return '—';
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeaveStatus }) {
  const styles: Record<LeaveStatus, string> = {
    Pending: 'bg-orange-100 text-orange-600',
    Approved: 'bg-emerald-100 text-emerald-600',
    Rejected: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function ActionButtons({
  leave,
  onApprove,
  onReject,
  onDelete,
}: {
  leave: LeaveReadDto;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  if (leave.status === 'Pending') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onApprove}
          className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[13px] font-medium hover:bg-emerald-100 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={onReject}
          className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md text-[13px] font-medium hover:bg-red-100 transition-colors"
        >
          Refuse
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onDelete}
      title="Delete"
      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
    >
      {/* @ts-ignore */}
      <FiTrash2 className="w-4 h-4" />
    </button>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function LeaveManagementTable() {
  const dispatch = useAppDispatch();
  const { leaves, status } = useAppSelector((s) => s.hrLeaves);

  const handleStatusChange = (id: string, newStatus: LeaveStatus) => {
    dispatch(updateHrLeaveStatus({ id, payload: { status: newStatus } }));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteHrLeave(id));
  };

  if (status === 'loading') {
    return (
      <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl py-16 flex items-center justify-center text-slate-400 text-[14px]">
        Loading leave requests…
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl py-16 flex items-center justify-center text-slate-400 text-[14px]">
        No leave requests found.
      </div>
    );
  }

  return (
    <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl overflow-hidden pb-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">Employee</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">Leave Type</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">From</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">To</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">Days</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">Reason</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">Status</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium flex-shrink-0 text-white ${avatarColor(leave.employeeId)}`}
                    >
                      {getInitials(leave.employeeName)}
                    </div>
                    <div className="text-[14px] font-medium text-slate-900">{leave.employeeName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{leave.type}</td>
                <td className="px-6 py-4 text-[14px] text-slate-900 font-medium">{formatDate(leave.fromDate)}</td>
                <td className="px-6 py-4 text-[14px] text-slate-900 font-medium">{formatDate(leave.toDate)}</td>
                <td className="px-6 py-4 text-[14px] text-slate-900 font-medium">{daysBetween(leave.fromDate, leave.toDate)}</td>
                <td className="px-6 py-4 text-[14px] text-slate-600 max-w-[180px] truncate">{leave.reason}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={leave.status} />
                </td>
                <td className="px-6 py-4">
                  <ActionButtons
                    leave={leave}
                    onApprove={() => handleStatusChange(leave.id, 'Approved')}
                    onReject={() => handleStatusChange(leave.id, 'Rejected')}
                    onDelete={() => handleDelete(leave.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
