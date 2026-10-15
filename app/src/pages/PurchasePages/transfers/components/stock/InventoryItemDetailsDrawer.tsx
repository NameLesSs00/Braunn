import { X, Package, ArrowDownLeft, ArrowUpRight, Calendar, FileText, Hash } from 'lucide-react';
import type { PurchasingInventoryDetail, PurchasingInventoryItem } from '../../../../../models/Purchasemodels/InventoryTransfer';

interface InventoryItemDetailsDrawerProps {
  open: boolean;
  item: PurchasingInventoryItem | null;
  detail: PurchasingInventoryDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

export function InventoryItemDetailsDrawer({
  open,
  item,
  detail,
  isLoading,
  onClose,
}: InventoryItemDetailsDrawerProps) {
  if (!open || !item) return null;

  const currentItem = detail || item;
  const transactions = detail?.recentTransactions || [];

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      const d = new Date(normalized);
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="flex w-screen max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2]">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    {currentItem.itemName}
                  </h2>
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    #{currentItem.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 font-medium">
                    {currentItem.departmentType}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  {currentItem.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.2 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.2 text-[10px] font-semibold text-slate-500">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Current Stock KPI Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Current Stock On Hand
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-900">
                    {Number(currentItem.quantity).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {currentItem.unitSymbol || currentItem.unitName || 'Units'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Last Updated
                </span>
                <span className="text-xs font-semibold text-slate-700 block mt-2">
                  {formatDateTime(currentItem.modifiedAt || currentItem.createdAt)}
                </span>
              </div>
            </div>

            {/* Recent Movement Ledger */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0B4EA2]" />
                  <span>Stock Movement Ledger</span>
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  {transactions.length} record{transactions.length === 1 ? '' : 's'}
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-3 py-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No movement transactions recorded for this item yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => {
                    const isReceipt = tx.transactionType?.toLowerCase() === 'receipt';
                    const isTransferOut = tx.transactionType?.toLowerCase() === 'transferout';

                    return (
                      <div
                        key={tx.id}
                        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {isReceipt ? (
                              <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                                <ArrowDownLeft className="h-4 w-4" />
                              </div>
                            ) : isTransferOut ? (
                              <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
                                <ArrowUpRight className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600">
                                <Hash className="h-4 w-4" />
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  {tx.transactionType}
                                </span>
                                {tx.reference && (
                                  <span className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                                    {tx.reference}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(tx.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Delta Quantity */}
                          <div className="text-right">
                            <span
                              className={`text-sm font-bold block ${
                                isReceipt
                                  ? 'text-emerald-600'
                                  : isTransferOut
                                  ? 'text-amber-600'
                                  : 'text-slate-800'
                              }`}
                            >
                              {isReceipt ? '+' : isTransferOut ? '-' : ''}
                              {tx.quantity} {tx.unitSymbol || tx.unitName || ''}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Bal: {tx.beforeQuantity} &rarr; {tx.afterQuantity}
                            </span>
                          </div>
                        </div>

                        {tx.notes && (
                          <p className="text-xs text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
