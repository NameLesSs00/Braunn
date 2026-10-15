import {
  FileText,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Layers,
  Hash,
  ExternalLink,
  Wallet,
  Clock,
} from 'lucide-react';
import type { FinanceTransactionListItem } from '../../../../models/Purchasemodels/SupplierFinance';

interface PurchasingTransactionsTableProps {
  transactions: FinanceTransactionListItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onViewInvoice?: (purchaseId: number) => void;
  isFiltered?: boolean;
}

export function PurchasingTransactionsTable({
  transactions,
  totalCount,
  totalPages,
  pageNumber,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onViewInvoice,
  isFiltered = false,
}: PurchasingTransactionsTableProps) {
  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateOnly = (dateStr?: string) => {
    const d = parseDate(dateStr);
    if (!d) return dateStr || '—';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeOnly = (dateStr?: string) => {
    const d = parseDate(dateStr);
    if (!d) return '';
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const getMethodBadge = (method: string) => {
    const m = (method || '').toLowerCase();
    if (m.includes('cash')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          Cash
        </span>
      );
    }
    if (m.includes('bank') || m.includes('transfer')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
          Bank Transfer
        </span>
      );
    }
    if (m.includes('advance')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
          Advance
        </span>
      );
    }
    if (m.includes('check') || m.includes('cheque')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          Check
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
        {method || 'N/A'}
      </span>
    );
  };

  const getTypeBadge = (tx: FinanceTransactionListItem) => {
    if (tx.advanceId !== null && tx.advanceId !== undefined) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/80">
          <Wallet className="h-3 w-3 text-purple-500" />
          Advance Settlement
        </span>
      );
    }
    if (tx.installmentId !== null && tx.installmentId !== undefined) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#0B4EA2] border border-blue-200/80">
          <Layers className="h-3 w-3 text-[#0B4EA2]" />
          Installment Payment
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/80">
        <Receipt className="h-3 w-3 text-emerald-600" />
        Direct Payment
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Txn #</th>
              <th className="py-3.5 px-4">Supplier</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4" title="Purchase Order or Installment schedule linked to this transaction">
                Linked PO / Plan
              </th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Reference / Notes</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-1.5" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-200 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="h-6 w-6 bg-slate-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-400">
                  <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No financial transactions found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isFiltered
                      ? 'Try adjusting your search criteria or date filters.'
                      : 'Financial disbursements and settlements will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Transaction # */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#0B4EA2]">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{tx.transactionNumber || `#TXN-${tx.id}`}</span>
                    </div>
                  </td>

                  {/* Supplier */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[170px]">
                        {tx.supplierName || (tx.supplierId ? `Supplier #${tx.supplierId}` : '—')}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getTypeBadge(tx)}
                  </td>

                  {/* Method */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getMethodBadge(tx.paymentMethod)}
                  </td>

                  {/* Linked Purchase Order / Installment Plan */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      {tx.supplierPurchaseId ? (
                        onViewInvoice ? (
                          <button
                            type="button"
                            onClick={() => onViewInvoice(tx.supplierPurchaseId!)}
                            title={`Inspect Purchase Order #${tx.supplierPurchaseId}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-[#0B4EA2] text-xs font-bold hover:shadow-2xs active:scale-[0.98] transition-all cursor-pointer group"
                          >
                            <Receipt className="h-3.5 w-3.5 text-[#0B4EA2] shrink-0" />
                            <span>PO #{tx.supplierPurchaseId}</span>
                            <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                            <Receipt className="h-3.5 w-3.5 text-[#0B4EA2] shrink-0" />
                            <span>PO #{tx.supplierPurchaseId}</span>
                          </div>
                        )
                      ) : null}

                      {tx.installmentId !== null && tx.installmentId !== undefined ? (
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50/80 text-[#0B4EA2] border border-blue-200/70"
                          title={`Payment allocated towards Installment #${tx.installmentId}${tx.installmentPlanId ? ` under Plan #${tx.installmentPlanId}` : ''}`}
                        >
                          <Layers className="h-3 w-3 text-[#0B4EA2] shrink-0" />
                          <span>
                            {tx.installmentPlanId ? `Plan #${tx.installmentPlanId} • ` : ''}Installment #{tx.installmentId}
                          </span>
                        </div>
                      ) : tx.advanceId !== null && tx.advanceId !== undefined ? (
                        <div
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/70"
                          title={`Deducted from Supplier Advance #${tx.advanceId}`}
                        >
                          <Wallet className="h-3 w-3 text-purple-600 shrink-0" />
                          <span>Advance #{tx.advanceId}</span>
                        </div>
                      ) : tx.supplierPurchaseId ? (
                        <div
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 bg-slate-100 border border-slate-200/60"
                          title="Direct cash payment settled directly on this Purchase Order"
                        >
                          <span>Direct Cash Payment</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unlinked Ledger</span>
                      )}
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3.5 px-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800">
                          {formatDateOnly(tx.transactionDate)}
                        </span>
                        {formatTimeOnly(tx.transactionDate) && (
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3 inline text-slate-400" />
                            {formatTimeOnly(tx.transactionDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Reference / Notes */}
                  <td className="py-3.5 px-4 text-slate-500 max-w-[200px]">
                    {tx.referenceNumber && (
                      <span className="font-mono text-xs text-slate-700 block">
                        Ref: {tx.referenceNumber}
                      </span>
                    )}
                    {tx.notes && (
                      <span className="text-xs text-slate-400 truncate block">
                        {tx.notes}
                      </span>
                    )}
                    {!tx.referenceNumber && !tx.notes && '—'}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right font-black text-emerald-700 whitespace-nowrap text-sm">
                    ${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    {tx.supplierPurchaseId && onViewInvoice ? (
                      <button
                        type="button"
                        onClick={() => onViewInvoice(tx.supplierPurchaseId!)}
                        title="View linked Purchase Order"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0B4EA2] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Consistent with PurchasingAdvancesTable) */}
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
            of <strong className="font-semibold text-slate-800">{totalCount}</strong> transactions
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
