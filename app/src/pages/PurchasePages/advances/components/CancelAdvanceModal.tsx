import { useState } from 'react';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../../../../store/hooks';
import { cancelPurchasingAdvance } from '../../../../features/Purchasefeatures/purchasingAdvances/purchasingAdvancesSlice';
import type { PurchasingAdvance } from '../../../../models/Purchasemodels/PurchasingAdvance';

interface CancelAdvanceModalProps {
  advance: PurchasingAdvance | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelAdvanceModal({ advance, onClose, onSuccess }: CancelAdvanceModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!advance) return null;

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(cancelPurchasingAdvance(advance.id)).unwrap();
      toast.success(`Advance #ADV-${advance.id} successfully cancelled!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to cancel advance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cancel Advance</h3>
              <p className="text-xs text-slate-500">Advance #ADV-{advance.id}</p>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-800 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Are you sure you want to cancel this advance?</p>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Cancelling will deactivate this advance. The remaining balance of{' '}
                <strong className="text-slate-900 font-bold">
                  ${advance.remainingAmount.toFixed(2)}
                </strong>{' '}
                will no longer be available to reconcile against supplier purchases.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Supplier:</span>
              <span className="font-semibold text-slate-800">
                {advance.supplierName || `Supplier #${advance.supplierId}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Original Amount:</span>
              <span className="font-semibold text-slate-800">${advance.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancellation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
