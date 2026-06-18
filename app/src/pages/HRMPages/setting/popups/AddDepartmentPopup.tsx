import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../store/store';
import {
  createDepartment,
  updateDepartment,
  fetchDepartments,
} from '../../../../features/HRMfeatures/departments/departmentsSlice';
import type { DepartmentReadDto } from '../../../../models/HRMmodels/Department';

type Props = {
  open: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
  initialData?: DepartmentReadDto;
};

export function AddDepartmentPopup({ open, onClose, mode = 'add', initialData }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setForm({ name: '', description: '', isActive: true });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      if (mode === 'edit' && initialData) {
        await dispatch(
          updateDepartment({
            id: initialData.id,
            payload: { name: form.name, description: form.description, isActive: form.isActive },
          })
        ).unwrap();
      } else {
        await dispatch(
          createDepartment({ name: form.name, description: form.description })
        ).unwrap();
      }
      await dispatch(fetchDepartments(undefined));
      handleClose();
    } catch {
      // error is stored in redux state; keep modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="w-[460px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <h2 className="text-[18px] font-semibold text-white">
            {mode === 'edit' ? 'Edit Department' : 'Add Department'}
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
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Department name"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Description
            </label>
            <textarea
              placeholder="Department description"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* isActive toggle — only shown in edit mode */}
          {mode === 'edit' && (
            <div className="flex items-center gap-3">
              <label className="text-[13px] font-semibold text-slate-700">Active</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isActive ? 'bg-[#0B4EA2]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-6 pt-1">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 h-11 rounded-lg border border-slate-300 bg-white text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
            className="flex-1 h-11 rounded-lg bg-[#0B4EA2] text-[14px] font-semibold text-white hover:bg-[#093c80] transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving…' : mode === 'edit' ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
