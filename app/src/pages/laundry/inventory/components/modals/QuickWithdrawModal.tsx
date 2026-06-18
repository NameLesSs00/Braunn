import { Modal } from './Modal';
import { FiCalendar } from 'react-icons/fi';

interface QuickWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickWithdrawModal({ isOpen, onClose }: QuickWithdrawModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Withdraw"
      maxWidth="max-w-2xl"
    >
      <div className="p-8">
        <form className="space-y-6">
          {/* Item Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Item Name <span className="text-slate-800">*</span>
            </label>
            <input
              type="text"
              placeholder="Item name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Quantity <span className="text-slate-800">*</span>
            </label>
            <input
              type="number"
              placeholder="Enter quantity"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Taken By */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Taken By <span className="text-slate-800">*</span>
            </label>
            <input
              type="text"
              defaultValue="Sarah Miller"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-slate-800">
              Reason
            </label>
            <textarea
              rows={4}
              placeholder="Purpose of withdrawal..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400 text-slate-700 resize-none"
            />
          </div>

          {/* Date & Time (Readonly style) */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
            {/* @ts-ignore */}
            <FiCalendar className="w-4 h-4 text-slate-500" />
            <span className="text-[14px] text-slate-500 font-medium">5/18/2026 03:44 PM</span>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-6 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl border border-slate-300 text-[15px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-[#0a4bbd] text-[15px] font-bold text-white hover:bg-blue-800 transition-colors"
            >
              Confirm Withdraw
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
