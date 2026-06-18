import { useState } from 'react';
import { useAppDispatch } from '../../../../store/hooks';
import {
  deleteHkmInventoryUnit,
  updateHkmInventoryUnit,
} from '../../../../features/HKfeatures/hkmInventoryUnits/hkmInventoryUnitsSlice';
import type { HkmInventoryUnitReadDto } from '../../../../models/HKmodels/HkmInventoryUnit';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditUnitModal } from './EditUnitModal';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface UnitsTableProps {
  units: HkmInventoryUnitReadDto[];
  isLoading: boolean;
  error?: string;
}

export function UnitsTable({ units, isLoading, error }: UnitsTableProps) {
  const dispatch = useAppDispatch();

  const [deleteTarget, setDeleteTarget] = useState<HkmInventoryUnitReadDto | null>(null);
  const [editTarget, setEditTarget] = useState<HkmInventoryUnitReadDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await dispatch(deleteHkmInventoryUnit(deleteTarget.id));
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleEditConfirm = async (id: number, name: string) => {
    setIsSaving(true);
    await dispatch(updateHkmInventoryUnit({ id, payload: { name } }));
    setIsSaving(false);
    setEditTarget(null);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                {['#', 'Unit Name', 'Actions'].map((col) => (
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

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-[14px] font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  // Empty state
  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 text-center">
        <p className="text-[15px] font-semibold text-slate-500">No units found.</p>
        <p className="text-[13px] text-slate-400 mt-1">Units added from the API will appear here.</p>
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
                {['#', 'Unit Name', 'Actions'].map((col) => (
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
              {units.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-[13px] text-slate-400 font-medium w-12">
                    {index + 1}
                  </td>
                  <td className="px-6 py-5 text-[14px] font-semibold text-slate-800">
                    {unit.name}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => setEditTarget(unit)}
                        title="Edit unit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-[12px] font-semibold text-[#0a4bbd] hover:bg-blue-50 hover:border-[#0a4bbd] transition-colors"
                      >
                        {/* @ts-ignore */}
                        <FiEdit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(unit)}
                        title="Delete unit"
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

        {/* Footer count */}
        <div className="border-t border-slate-200 px-6 py-3 bg-white">
          <span className="text-[13px] text-slate-400">
            {units.length} {units.length === 1 ? 'unit' : 'units'} total
          </span>
        </div>
      </div>

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        unitName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      {/* Edit modal */}
      <EditUnitModal
        isOpen={!!editTarget}
        unit={editTarget}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditTarget(null)}
        isSaving={isSaving}
      />
    </>
  );
}
