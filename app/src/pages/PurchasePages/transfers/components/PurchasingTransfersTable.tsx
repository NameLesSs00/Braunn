import {
  Calendar,
  Eye,
  CheckCircle2,
  Ban,
  ArrowRightLeft,
  Building2,
  Package,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import type { InventoryTransfer } from '../../../../models/Purchasemodels/InventoryTransfer';

interface PurchasingTransfersTableProps {
  transfers: InventoryTransfer[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onViewDetails: (transfer: InventoryTransfer) => void;
  onConfirm: (transfer: InventoryTransfer) => void;
  onCancel: (transfer: InventoryTransfer) => void;
  onCreateClick: () => void;
  isFiltered: boolean;
}

export function PurchasingTransfersTable({
  transfers,
  isLoading,
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onConfirm,
  onCancel,
  onCreateClick,
  isFiltered,
}: PurchasingTransfersTableProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Confirmed
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200/60">
          <Ban className="h-3.5 w-3.5 text-slate-500" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Pending
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Transfer #</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Destination</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Transferred Items</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-5 w-20 bg-slate-200 rounded-full mx-auto" /></td>
                  <td className="py-4 px-4"><div className="h-7 w-20 bg-slate-200 rounded mx-auto" /></td>
                </tr>
              ))
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                      <ArrowRightLeft className="h-6 w-6" />
                    </div>
                    <div className="text-[15px] font-bold text-slate-700">No transfers found</div>
                    <p className="mt-1 text-xs text-slate-400">
                      {isFiltered
                        ? 'Try adjusting your search filters or date range.'
                        : 'Create your first inventory transfer to deliver stock from Central Storage.'}
                    </p>
                    {!isFiltered && (
                      <button
                        type="button"
                        onClick={onCreateClick}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#093d80] transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create Transfer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              transfers.map((tx) => {
                const isPending = tx.status?.toLowerCase() === 'pending';
                const itemsCount = tx.items?.length || 0;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Transfer # */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewDetails(tx)}
                        className="font-mono text-xs font-bold text-[#0B4EA2] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-[#0B4EA2]" />
                        <span>#TR-{String(tx.id).padStart(4, '0')}</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{formatDate(tx.transferDate)}</span>
                      </div>
                    </td>

                    {/* Destination Warehouse / Restaurant */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Building2 className="h-3.5 w-3.5 text-[#0B4EA2] shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {tx.destinationWarehouseName || tx.restaurantName || 'Central Processing'}
                          </span>
                        </div>
                        {tx.restaurantName && tx.destinationWarehouseName ? (
                          <span className="text-[11px] text-slate-400 pl-5">
                            {tx.restaurantName}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {tx.departmentType || 'Restaurant'}
                      </span>
                    </td>

                    {/* Transferred Items Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span>{itemsCount} {itemsCount === 1 ? 'Item' : 'Items'}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1">
                        {/* View Drawer */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(tx)}
                          title="View transfer details"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* If Pending: Confirm & Cancel buttons */}
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => onConfirm(tx)}
                              title="Confirm delivery"
                              className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onCancel(tx)}
                              title="Cancel transfer"
                              className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 shadow-2xs hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-200/80 px-4 py-3 bg-white text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span>
            Showing{' '}
            <strong className="font-semibold text-slate-800">
              {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="font-semibold text-slate-800">
              {Math.min(page * pageSize, totalCount)}
            </strong>{' '}
            of <strong className="font-semibold text-slate-800">{totalCount}</strong> transfers
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-[#0B4EA2] focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-slate-500">
            Page {page} of {Math.max(1, totalPages)}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
