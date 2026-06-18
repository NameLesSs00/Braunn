import { X } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  shiftName: string;
};

export function DeleteShiftPopup({ open, onClose, onDelete, shiftName }: Props) {
  const handleDelete = () => {
    onDelete();
  };

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[420px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header — white, no blue bar (matches design) */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[17px] font-bold text-slate-800">Delete Shift</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-[14px] text-slate-600 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-800">{shiftName}</span>? This action cannot
            be undone.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-slate-300 bg-white text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 h-11 rounded-lg bg-red-500 text-[14px] font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
