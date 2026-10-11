import { useState, useEffect } from 'react';
import { X, Edit3, DollarSign, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../../../../store/hooks';
import { updatePurchasingAdvance } from '../../../../features/Purchasefeatures/purchasingAdvances/purchasingAdvancesSlice';
import type { PurchasingAdvance } from '../../../../models/Purchasemodels/PurchasingAdvance';

interface EditPurchasingAdvanceModalProps {
  advance: PurchasingAdvance | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPurchasingAdvanceModal({
  advance,
  onClose,
  onSuccess,
}: EditPurchasingAdvanceModalProps) {
  const dispatch = useAppDispatch();

  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (advance) {
      setAmount(advance.amount.toString());
      setNotes(advance.notes || '');
      setIsSubmitting(false);
    }
  }, [advance]);

  if (!advance) return null;

  const consumedAmount = Math.max(0, advance.amount - advance.remainingAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (numAmount < consumedAmount) {
      toast.error(
        `Amount cannot be less than the already consumed amount ($${consumedAmount.toFixed(2)})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        updatePurchasingAdvance({
          id: advance.id,
          payload: {
            amount: numAmount,
            notes: notes.trim(),
          },
        })
      ).unwrap();

      toast.success(`Advance #ADV-${advance.id} successfully updated!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to update advance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit Advance #ADV-{advance.id}
              </h3>
              <p className="text-xs text-slate-500">Update advance total amount or notes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Supplier Info (Readonly) */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-[#0B4EA2] shrink-0" />
            <div>
              <span className="block text-[11px] font-bold text-slate-400 uppercase">
                Vendor
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {advance.supplierName || `Supplier #${advance.supplierId}`}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Advance Amount ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <DollarSign className="h-4 w-4" />
              </div>
              <input
                type="number"
                min={consumedAmount > 0 ? consumedAmount : 0.01}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
              />
            </div>
            {consumedAmount > 0 && (
              <p className="mt-1 text-[11px] text-amber-600">
                * Note: ${consumedAmount.toFixed(2)} has already been consumed. New amount cannot be lower.
              </p>
            )}
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes & Remarks
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Adjusted advance following revised purchase quote..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4EA2] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
