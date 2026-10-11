import {
  X,
  Wallet,
  Building2,
  Calendar,
  FileText,
  Edit3,
  Ban,
  Trash2,
  PieChart,
} from 'lucide-react';
import type { PurchasingAdvance } from '../../../../models/Purchasemodels/PurchasingAdvance';
import { AdvanceStatusBadge } from './AdvanceStatusBadge';

interface AdvanceDetailsDrawerProps {
  advance: PurchasingAdvance | null;
  onClose: () => void;
  onEdit: (advance: PurchasingAdvance) => void;
  onCancel: (advance: PurchasingAdvance) => void;
  onDelete: (advance: PurchasingAdvance) => void;
}

export function AdvanceDetailsDrawer({
  advance,
  onClose,
  onEdit,
  onCancel,
  onDelete,
}: AdvanceDetailsDrawerProps) {
  if (!advance) return null;

  const isActive = advance.status?.toLowerCase() === 'active';
  const isCancelled = advance.status?.toLowerCase() === 'cancelled';
  const consumedAmount = Math.max(0, advance.amount - advance.remainingAmount);
  const percentRemaining =
    advance.amount > 0
      ? Math.min(100, Math.max(0, (advance.remainingAmount / advance.amount) * 100))
      : 0;
  const percentConsumed = 100 - percentRemaining;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'long',
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2]">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    #ADV-{String(advance.id).padStart(4, '0')}
                  </h2>
                  <AdvanceStatusBadge status={advance.status} />
                </div>
                <p className="text-xs text-slate-500">Advance Details</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Vendor Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Building2 className="h-4 w-4 text-[#0B4EA2]" />
                <span>Vendor Details</span>
              </div>
              <div className="pt-1">
                <h3 className="text-base font-bold text-slate-900">
                  {advance.supplierName || `Supplier #${advance.supplierId}`}
                </h3>
                <p className="text-xs text-slate-500">Supplier System ID: #{advance.supplierId}</p>
              </div>
            </div>

            {/* Financial Reconciliation Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <PieChart className="h-4 w-4 text-[#0B4EA2]" />
                  <span>Advance Breakdown</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#0B4EA2]">
                  {percentRemaining.toFixed(0)}% Available
                </span>
              </div>

              {/* Amount Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                    Total Advance
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    ${advance.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                    Remaining Balance
                  </span>
                  <span className="text-lg font-black text-[#0B4EA2]">
                    ${advance.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Consumed: ${consumedAmount.toFixed(2)} ({percentConsumed.toFixed(0)}%)</span>
                  <span>Unconsumed: ${advance.remainingAmount.toFixed(2)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-slate-300 h-full transition-all"
                    style={{ width: `${percentConsumed}%` }}
                    title={`Consumed: $${consumedAmount.toFixed(2)}`}
                  />
                  <div
                    className="bg-[#0B4EA2] h-full transition-all"
                    style={{ width: `${percentRemaining}%` }}
                    title={`Remaining: $${advance.remainingAmount.toFixed(2)}`}
                  />
                </div>
              </div>
            </div>

            {/* Timestamps & Audit */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Timeline</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="text-slate-400">Created:</span>
                <span className="font-medium">{formatDate(advance.createdAt)}</span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-500 font-semibold uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Notes & Remarks</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {advance.notes ? advance.notes : <span className="text-slate-400 italic">No notes provided for this advance.</span>}
              </p>
            </div>
          </div>

          {/* Drawer Actions Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              {isActive && !isCancelled && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(advance)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onCancel(advance)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/50 px-3.5 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => onDelete(advance)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
