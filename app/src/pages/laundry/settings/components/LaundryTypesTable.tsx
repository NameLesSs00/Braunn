import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../../store/hooks';
import {
  deleteLaundryType,
  updateLaundryType,
  clearLaundryTypesError,
} from '../../../../features/Laundryfeatures/laundryTypes/laundryTypesSlice';
import type { LaundryTypeReadDto } from '../../../../models/Laundrymodels/LaundryType';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditTypeModal } from './EditTypeModal';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { appAlert } from '../../../../shared/ui/AppAlert';

const showSuccess = (title: string) =>
  appAlert.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: 'success',
    title,
  });

const showError = (title: string) =>
  appAlert.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    icon: 'error',
    title,
  });

interface LaundryTypesTableProps {
  types: LaundryTypeReadDto[];
  isLoading: boolean;
  error?: string;
}

export function LaundryTypesTable({ types, isLoading, error }: LaundryTypesTableProps) {
  const dispatch = useAppDispatch();

  const [deleteTarget, setDeleteTarget] = useState<LaundryTypeReadDto | null>(null);
  const [editTarget, setEditTarget] = useState<LaundryTypeReadDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearLaundryTypesError());
    }
  }, [error, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await dispatch(deleteLaundryType(deleteTarget.id));
    setIsDeleting(false);
    setDeleteTarget(null);
    if (deleteLaundryType.fulfilled.match(result)) {
      showSuccess('Type deleted successfully');
    } else {
      showError((result.payload as string) || 'Failed to delete type');
    }
  };

  const handleEditConfirm = async (id: number, name: string) => {
    setIsSaving(true);
    const result = await dispatch(updateLaundryType({ id, payload: { name } }));
    setIsSaving(false);
    setEditTarget(null);
    if (updateLaundryType.fulfilled.match(result)) {
      showSuccess('Type updated successfully');
    } else {
      showError((result.payload as string) || 'Failed to update type');
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                {['#', 'Type Name', 'Actions'].map((col) => (
                  <th key={col} className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-5"><div className="h-4 w-6 bg-slate-100 rounded animate-pulse" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-40 bg-slate-100 rounded animate-pulse" /></td>
                  <td className="px-6 py-5"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (types.length === 0 && !error) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 text-center">
        <p className="text-[15px] font-semibold text-slate-500">No types found.</p>
        <p className="text-[13px] text-slate-400 mt-1">Types added from the API will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                {['#', 'Type Name', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className={`px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide ${col === 'Actions' ? 'text-right' : ''}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.map((type, index) => (
                <tr key={type.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-[13px] text-slate-400 font-medium w-12">{index + 1}</td>
                  <td className="px-6 py-5 text-[14px] font-semibold text-slate-800">{type.name}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditTarget(type)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-[12px] font-semibold text-[#0a4bbd] hover:bg-blue-50 hover:border-[#0a4bbd] transition-colors"
                      >
                        {/* @ts-ignore */}
                        <FiEdit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(type)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-[12px] font-semibold text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
                      >
                        {/* @ts-ignore */}
                        <FiTrash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-6 py-3 bg-white">
          <span className="text-[13px] text-slate-400">
            {types.length} {types.length === 1 ? 'type' : 'types'} total
          </span>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
      <EditTypeModal
        isOpen={!!editTarget}
        type={editTarget}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditTarget(null)}
        isSaving={isSaving}
      />
    </>
  );
}
