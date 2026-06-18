import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  fetchHkmInventoryItems,
  deleteHkmInventoryItem,
  setItemsCategoryFilter,
  setItemsUnitFilter,
  setItemsStatusFilter,
  setItemsPage,
} from '../../../../features/HKfeatures/hkmInventoryItems/hkmInventoryItemsSlice';
import type { HkmInventoryItemReadDto } from '../../../../models/HKmodels/HkmInventoryItem';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditItemModal } from './EditItemModal';
import { FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export function ItemsTable() {
  const dispatch = useAppDispatch();

  const { items, totalCount, status, error, params } = useAppSelector((s) => s.hkmInventoryItems);
  const { categories } = useAppSelector((s) => s.hkmInventoryCategories);
  const { units } = useAppSelector((s) => s.hkmInventoryUnits);

  const [deleteTarget, setDeleteTarget] = useState<HkmInventoryItemReadDto | null>(null);
  const [editTarget, setEditTarget] = useState<HkmInventoryItemReadDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Client-side name filter
  const [nameFilter, setNameFilter] = useState('');

  // Re-fetch when params change
  useEffect(() => {
    dispatch(fetchHkmInventoryItems(params));
  }, [params, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await dispatch(deleteHkmInventoryItem(deleteTarget.id));
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  // Filter items by name client-side
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / (params.PageSize || 10));

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Normal':
        return <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[12px] font-semibold">Normal</span>;
      case 'Low':
        return <span className="px-2 py-1 rounded-md bg-red-50 text-red-600 text-[12px] font-semibold">Low</span>;
      case 'High':
        return <span className="px-2 py-1 rounded-md bg-green-50 text-green-600 text-[12px] font-semibold">High</span>;
      default:
        return <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-[12px] font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          {/* @ts-ignore */}
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/30 focus:border-[#0a4bbd] transition"
          />
        </div>

        <select
          value={params.CategoryId || ''}
          onChange={(e) => dispatch(setItemsCategoryFilter(e.target.value ? Number(e.target.value) : ''))}
          className="px-3 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:border-[#0a4bbd] bg-white min-w-[150px]"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={params.UnitId || ''}
          onChange={(e) => dispatch(setItemsUnitFilter(e.target.value ? Number(e.target.value) : ''))}
          className="px-3 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:border-[#0a4bbd] bg-white min-w-[150px]"
        >
          <option value="">All Units</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={params.Status || ''}
          onChange={(e) => dispatch(setItemsStatusFilter(e.target.value as any))}
          className="px-3 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-700 focus:outline-none focus:border-[#0a4bbd] bg-white min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="Normal">Normal</option>
          <option value="Low">Low</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-[13px] font-semibold border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide w-12">#</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide">Unit</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide text-center">Quantity</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide text-center">Min / Max</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {status === 'loading' ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-5">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full max-w-[100px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-[14px] font-semibold text-slate-500">No items found.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-[13px] text-slate-400 font-medium w-12">
                      {((params.PageNumber || 1) - 1) * (params.PageSize || 10) + index + 1}
                    </td>
                    <td className="px-6 py-5 text-[14px] font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-5 text-[13px] text-slate-600">
                      {item.categoryName}
                    </td>
                    <td className="px-6 py-5 text-[13px] text-slate-600">
                      {item.unitName}
                    </td>
                    <td className="px-6 py-5 text-[14px] font-semibold text-slate-800 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-5 text-[13px] text-slate-600 text-center">
                      {item.minimumStock || 0} / {item.maximumStock || 0}
                    </td>
                    <td className="px-6 py-5 text-center">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(item)}
                          title="Edit item"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-[#0a4bbd] hover:bg-blue-50 hover:border-[#0a4bbd] transition-colors"
                        >
                          {/* @ts-ignore */}
                          <FiEdit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          title="Delete item"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-[12px] font-semibold text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
                        >
                          {/* @ts-ignore */}
                          <FiTrash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200 px-6 py-3 flex items-center justify-between bg-[#f8fafc]">
          <span className="text-[13px] text-slate-500 font-medium">
            Showing {filteredItems.length} of {totalCount} items
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={status === 'loading' || (params.PageNumber || 1) <= 1}
              onClick={() => dispatch(setItemsPage((params.PageNumber || 1) - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-[13px] font-medium text-slate-600 px-2">
              Page {params.PageNumber} of {Math.max(1, totalPages)}
            </span>
            <button
              disabled={status === 'loading' || (params.PageNumber || 1) >= totalPages}
              onClick={() => dispatch(setItemsPage((params.PageNumber || 1) + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        unitName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />

      <EditItemModal
        isOpen={!!editTarget}
        item={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
