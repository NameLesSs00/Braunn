import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  mode?: 'add' | 'edit';
  initialData?: {
    name: string;
    description: string;
  };
};

export function AddPositionPopup({ open, onClose, onSubmit, mode = 'add', initialData }: Props) {
  const [form, setForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name ?? '',
        description: initialData?.description ?? '',
      });
    }
  }, [open, initialData]);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="w-[460px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <h2 className="text-[18px] font-semibold text-white">
            {mode === 'edit' ? 'Edit Position' : 'Add New Position'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 bg-white">
          {/* Position Name */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Position Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Position name"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Position description"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-6 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-11 rounded-lg border border-slate-300 bg-white text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-lg bg-[#0B4EA2] text-[14px] font-semibold text-white hover:bg-[#093c80] transition-colors"
          >
            {mode === 'edit' ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
