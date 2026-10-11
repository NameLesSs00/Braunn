import {
  Eye,
  Edit3,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  Building2,
  Calendar,
} from 'lucide-react';
import type { PurchasingAdvance } from '../../../../models/Purchasemodels/PurchasingAdvance';
import { AdvanceStatusBadge } from './AdvanceStatusBadge';

interface PurchasingAdvancesTableProps {
  advances: PurchasingAdvance[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onView: (advance: PurchasingAdvance) => void;
  onEdit: (advance: PurchasingAdvance) => void;
  onCancel: (advance: PurchasingAdvance) => void;
  onDelete: (advance: PurchasingAdvance) => void;
  onCreateClick: () => void;
  isFiltered?: boolean;
}

export function PurchasingAdvancesTable({
  advances,
  totalCount,
  totalPages,
  pageNumber,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onCancel,
  onDelete,
  onCreateClick,
  isFiltered = false,
}: PurchasingAdvancesTableProps) {
  // Format dates cleanly
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Advance #</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4 text-right">Advance Amount</th>
              <th className="py-3.5 px-4 text-right">Remaining Balance</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4">Notes</th>
              <th className="py-3.5 px-4 text-center w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-1.5" />
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-5 w-16 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-8 w-24 bg-slate-200 rounded-lg mx-auto" />
                  </td>
                </tr>
              ))
            ) : advances.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2] mb-3">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {isFiltered ? 'No advances match your filters' : 'No purchasing advances yet'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    {isFiltered
                      ? 'Try adjusting your search keywords, status, or date filters.'
                      : 'Create your first supplier cash advance or down-payment to start tracking balances.'}
                  </p>
                  {!isFiltered && (
                    <button
                      type="button"
                      onClick={onCreateClick}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#093d80] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Issue First Advance
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              // Advance Rows
              advances.map((advance) => {
                const isCancelled = advance.status?.toLowerCase() === 'cancelled';
                const isActive = advance.status?.toLowerCase() === 'active';
                const percentRemaining =
                  advance.amount > 0
                    ? Math.min(100, Math.max(0, (advance.remainingAmount / advance.amount) * 100))
                    : 0;

                return (
                  <tr
                    key={advance.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Advance Number */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0B4EA2]">
                      #ADV-{String(advance.id).padStart(4, '0')}
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {advance.supplierName || `Supplier #${advance.supplierId}`}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Vendor ID: #{advance.supplierId}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ${advance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Remaining Amount */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-[#0B4EA2]">
                        ${advance.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-1.5">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentRemaining > 50
                                ? 'bg-emerald-500'
                                : percentRemaining > 20
                                ? 'bg-amber-500'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${percentRemaining}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {percentRemaining.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <AdvanceStatusBadge status={advance.status} />
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{formatDate(advance.createdAt)}</span>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-[180px] truncate">
                      {advance.notes ? (
                        <span title={advance.notes}>{advance.notes}</span>
                      ) : (
                        <span className="text-slate-300 italic">No notes</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onView(advance)}
                          title="View advance details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-[#EEF4FF] hover:text-[#0B4EA2] transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit Amount/Notes (Active only) */}
                        {isActive && !isCancelled && (
                          <button
                            type="button"
                            onClick={() => onEdit(advance)}
                            title="Edit advance amount & notes"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}

                        {/* Cancel (Active only) */}
                        {isActive && !isCancelled && (
                          <button
                            type="button"
                            onClick={() => onCancel(advance)}
                            title="Cancel advance"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDelete(advance)}
                          title="Delete advance"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
              {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="font-semibold text-slate-800">
              {Math.min(pageNumber * pageSize, totalCount)}
            </strong>{' '}
            of <strong className="font-semibold text-slate-800">{totalCount}</strong> advances
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-[#0B4EA2] focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-slate-500">
            Page {pageNumber} of {Math.max(1, totalPages)}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(pageNumber - 1)}
              disabled={pageNumber <= 1 || isLoading}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages || isLoading}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
