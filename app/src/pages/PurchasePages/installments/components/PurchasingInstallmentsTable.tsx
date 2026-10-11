import {
  CreditCard,
  Layers,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { PurchasingInstallmentListItem } from '../../../../models/Purchasemodels/PurchasingInstallment';
import { InstallmentStatusBadge } from './InstallmentStatusBadge';

interface PurchasingInstallmentsTableProps {
  installments: PurchasingInstallmentListItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onPay: (installment: PurchasingInstallmentListItem) => void;
  onViewPlan: (planId: number) => void;
  onViewHistory?: (installmentId: number) => void;
  isFiltered?: boolean;
}

export function PurchasingInstallmentsTable({
  installments,
  totalCount,
  totalPages,
  pageNumber,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onPay,
  onViewPlan,
  onViewHistory,
  isFiltered = false,
}: PurchasingInstallmentsTableProps) {
  const formatDate = (dateStr: string) => {
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

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Inst. #</th>
              <th className="py-3.5 px-4">Plan #</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-right">Paid</th>
              <th className="py-3.5 px-4 text-right">Remaining</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-14 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-14 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-28 bg-slate-200 rounded mb-1.5" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-5 w-16 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-7 w-16 bg-slate-200 rounded-lg mx-auto" />
                  </td>
                </tr>
              ))
            ) : installments.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2] mb-3">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {isFiltered ? 'No installments match your filters' : 'No installment schedules recorded yet'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    {isFiltered
                      ? 'Try clearing or modifying your filter criteria.'
                      : 'Create an installment plan when settling supplier invoices to populate schedules.'}
                  </p>
                </td>
              </tr>
            ) : (
              // Table rows
              installments.map((inst) => {
                const isUnpaid = inst.remainingAmount > 0;
                return (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Installment # */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#0B4EA2]">
                      #{inst.installmentNumber || inst.id}
                    </td>

                    {/* Plan # */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onViewPlan(inst.installmentPlanId)}
                        className="font-mono text-xs font-semibold text-slate-700 hover:text-[#0B4EA2] hover:underline"
                        title="View plan schedule"
                      >
                        #PLAN-{inst.installmentPlanId}
                      </button>
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {inst.supplierName || `Supplier #${inst.supplierId}`}
                        </span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{formatDate(inst.dueDate)}</span>
                      </div>
                      {inst.isOverdue && isUnpaid && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Overdue</span>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ${Number(inst.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                      ${Number(inst.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Remaining */}
                    <td className="py-3.5 px-4 text-right font-bold text-[#0B4EA2]">
                      ${Number(inst.remainingAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <InstallmentStatusBadge
                        status={inst.status}
                        isOverdue={inst.isOverdue && isUnpaid}
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        {/* Pay Installment (if unpaid) */}
                        {isUnpaid && (
                          <button
                            type="button"
                            onClick={() => onPay(inst)}
                            title="Pay this installment"
                            className="rounded-lg p-1.5 text-[#0B4EA2] hover:bg-[#EEF4FF] transition-colors"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}

                        {/* View History (if payments made) */}
                        {onViewHistory && inst.paidAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => onViewHistory(inst.id)}
                            title="View installment payment history"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}

                        {/* View Plan */}
                        <button
                          type="button"
                          onClick={() => onViewPlan(inst.installmentPlanId)}
                          title="View entire plan schedule"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Layers className="h-4 w-4" />
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
            of <strong className="font-semibold text-slate-800">{totalCount}</strong> installments
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
