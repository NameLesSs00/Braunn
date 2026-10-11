import { useState } from 'react';
import { X, CheckCircle2, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../../../../store/hooks';
import { receiveSupplierPurchase } from '../../../../features/Purchasefeatures/supplierPurchases/supplierPurchasesSlice';
import type { SupplierPurchaseListItem } from '../../../../models/Purchasemodels/SupplierPurchase';

interface ReceiveOrderModalProps {
  open: boolean;
  purchase: SupplierPurchaseListItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceiveOrderModal({
  open,
  purchase,
  onClose,
  onSuccess,
}: ReceiveOrderModalProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || !purchase) return null;

  const handleReceive = async () => {
    try {
      setIsSubmitting(true);
      await dispatch(receiveSupplierPurchase(purchase.id)).unwrap();
      toast.success(`Purchase order #${purchase.id} marked as received!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to receive purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Receive Purchase Order</h3>
              <p className="text-xs text-slate-400">Order #{purchase.id}</p>
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

        {/* Info box */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Supplier:</span>
            <span className="font-semibold text-slate-800">{purchase.supplierName}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Order Date:</span>
            <span className="font-medium text-slate-700">{purchase.purchaseDate}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Value:</span>
            <span className="font-bold text-slate-900">
              ${Number(purchase.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Marking this order as received records the receipt of goods and updates its status to{' '}
          <strong className="text-emerald-700 font-semibold">Received</strong>.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReceive}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Receive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
