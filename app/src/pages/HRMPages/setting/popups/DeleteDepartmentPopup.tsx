import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../store/store';
import {
  deleteDepartment,
  fetchDepartments,
} from '../../../../features/HRMfeatures/departments/departmentsSlice';

type Props = {
  open: boolean;
  onClose: () => void;
  departmentId: string;
  departmentName: string;
};

export function DeleteDepartmentPopup({ open, onClose, departmentId, departmentName }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dispatch(deleteDepartment(departmentId)).unwrap();
      await dispatch(fetchDepartments(undefined));
      onClose();
    } catch {
      // error stays in redux; keep modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[420px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-[17px] font-bold text-slate-800">Delete Department</h2>
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
            <span className="font-bold text-slate-800">{departmentName}</span>? This action cannot
            be undone.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-lg border border-slate-300 bg-white text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-red-500 text-[14px] font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
