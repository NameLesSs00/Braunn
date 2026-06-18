import { useState, useEffect } from 'react';
import { X, ChevronDown, Calendar } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { useAppDispatch, useAppSelector } from '../../../../shared/apis/hooks';
import { createHrLeave } from '../../../../features/HRMfeatures/leaves/hrLeavesSlice';
import { fetchHrEmployees } from '../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import { fetchHrLeaves } from '../../../../features/HRMfeatures/leaves/hrLeavesSlice';
import type { LeaveType } from '../../../../models/HRMmodels/Leave';

const LEAVE_TYPES: LeaveType[] = ['Annual', 'Sick', 'Emergency', 'Unpaid'];

type NewLeaveRequestPopupProps = {
  open: boolean;
  onClose: () => void;
};

const emptyForm = {
  employeeId: '',
  leaveType: '' as LeaveType | '',
  startDate: '',
  endDate: '',
  reason: '',
};

export function NewLeaveRequestPopup({ open, onClose }: NewLeaveRequestPopupProps) {
  const dispatch = useAppDispatch();
  const { employees } = useAppSelector((s) => s.hrEmployees);
  const { status } = useAppSelector((s) => s.hrLeaves);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  // Load employees when popup opens
  useEffect(() => {
    if (open) {
      dispatch(fetchHrEmployees({ PageNumber: 1, PageSize: 100 }));
    }
  }, [open, dispatch]);

  const handleClose = () => {
    setForm(emptyForm);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.leaveType || !form.startDate || !form.endDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    const result = await dispatch(
      createHrLeave({
        employeeId: form.employeeId,
        type: form.leaveType as LeaveType,
        fromDate: new Date(form.startDate).toISOString(),
        toDate: new Date(form.endDate).toISOString(),
        reason: form.reason,
      })
    );

    if (createHrLeave.fulfilled.match(result)) {
      // Refresh the list after creation
      dispatch(fetchHrLeaves({ PageNumber: 1, PageSize: 20 }));
      handleClose();
    } else {
      setError('Failed to submit leave request. Please try again.');
    }
  };

  const isSubmitting = status === 'loading';

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="w-[560px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-[#0B4EA2]">
          <h2 className="text-[20px] font-semibold text-white">New Leave Request</h2>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Error */}
          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {/* Employee */}
          <div>
            <label className="mb-2 block text-[15px] font-semibold text-[#4a5568]">Employee *</label>
            <div className="relative">
              <select
                className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[15px] text-slate-700 outline-none transition-colors focus:border-[#0848a6] focus:ring-2 focus:ring-[#0848a6]/10"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              >
                <option value="" disabled>Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* Leave Type */}
          <div>
            <label className="mb-2 block text-[15px] font-semibold text-[#4a5568]">Leave Type *</label>
            <div className="relative">
              <select
                className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[15px] text-slate-700 outline-none transition-colors focus:border-[#0848a6] focus:ring-2 focus:ring-[#0848a6]/10"
                value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value as LeaveType })}
              >
                <option value="" disabled>Select leave type</option>
                {LEAVE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-[15px] font-semibold text-[#4a5568]">From Date *</label>
              <div className="relative">
                <input
                  type="date"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-[15px] text-slate-700 outline-none transition-colors focus:border-[#0848a6] focus:ring-2 focus:ring-[#0848a6]/10 cursor-pointer"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[15px] font-semibold text-[#4a5568]">To Date *</label>
              <div className="relative">
                <input
                  type="date"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-[15px] text-slate-700 outline-none transition-colors focus:border-[#0848a6] focus:ring-2 focus:ring-[#0848a6]/10 cursor-pointer"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block text-[15px] font-semibold text-[#4a5568]">Reason for Leave</label>
            <textarea
              rows={3}
              placeholder="e.g., Family Emergency"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0848a6] focus:ring-2 focus:ring-[#0848a6]/10"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 rounded-lg bg-[#0848a6] text-[16px] font-semibold text-white hover:bg-[#073985] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Sending…' : 'Send request'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
