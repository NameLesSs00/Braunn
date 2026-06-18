import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';

// We mimic the row data interface structure for simplicity
type LeaveRequestRow = {
  id: string;
  initials: string;
  name: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  avatarBg: string;
  avatarText: string;
};

type ExtendLeavePopupProps = {
  open: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequestRow | null;
};

export function ExtendLeavePopup({ open, onClose, leaveRequest }: ExtendLeavePopupProps) {
  const [form, setForm] = useState({
    newEndDate: '',
    reason: '',
  });

  useEffect(() => {
    if (open && leaveRequest) {
      setForm({
        newEndDate: '',
        reason: '',
      });
    }
  }, [open, leaveRequest]);

  const handleClose = () => {
    setForm({
      newEndDate: '',
      reason: '',
    });
    onClose();
  };

  const handleSubmit = () => {
    console.log('Extend Leave Payload:', {
      id: leaveRequest?.id,
      newEndDate: form.newEndDate,
      reason: form.reason,
    });
    handleClose();
  };

  if (!leaveRequest) return null;

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="w-[560px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 bg-[#0848a6]">
          <h2 className="text-[20px] font-semibold text-white">Extend Leave</h2>
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
          {/* Info Box */}
          <div className="bg-[#f8fafc] rounded-xl p-4 flex items-center gap-4 border border-transparent">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-semibold bg-[#0848a6] text-white">
              {leaveRequest.initials}
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-slate-800">{leaveRequest.name}</h3>
              <p className="text-[14px] text-slate-500">
                {leaveRequest.leaveType} &middot; {leaveRequest.days} days
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-[#f8fafc] rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[14px] font-medium text-slate-400 mb-1">Current Start Date</span>
              <span className="text-[16px] font-semibold text-slate-800">{leaveRequest.startDate}</span>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 flex flex-col justify-center border border-orange-200">
              <span className="text-[14px] font-medium text-orange-500 mb-1">Current End Date</span>
              <span className="text-[16px] font-semibold text-orange-600">{leaveRequest.endDate}</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[15px] font-semibold text-[#4a5568]">New Date*</label>
            <div className="relative">
              <input
                type="date"
                className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-[15px] text-slate-700 outline-none transition-colors focus:border-[#0848a6] focus:ring-2 focus:ring-[#0848a6]/10 [&::-webkit-calendar-picker-indicator]:hidden"
                value={form.newEndDate}
                onChange={(e) => setForm({ ...form, newEndDate: e.target.value })}
              />
              <Calendar className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[15px] font-semibold text-[#4a5568]">Reason for Extension</label>
            <textarea
              rows={4}
              placeholder="Medical certificate received, family situation requires more time..."
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0848a6] focus:ring-2 focus:ring-[#0848a6]/10"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-8 pb-8 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-[140px] h-12 rounded-lg border border-slate-300 bg-white text-[16px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-[160px] h-12 rounded-lg bg-[#0848a6] text-[16px] font-semibold text-white hover:bg-[#073985] transition-colors"
          >
            Extend Leave
          </button>
        </div>
      </div>
    </Modal>
  );
}
