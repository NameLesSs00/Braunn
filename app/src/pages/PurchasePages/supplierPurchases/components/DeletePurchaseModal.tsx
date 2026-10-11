import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../../../../store/hooks';
import { deleteSupplierPurchase } from '../../../../features/Purchasefeatures/supplierPurchases/supplierPurchasesSlice';
import type { SupplierPurchaseListItem } from '../../../../models/Purchasemodels/SupplierPurchase';

interface DeletePurchaseModalProps {
  open: boolean;
  purchase: SupplierPurchaseListItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeletePurchaseModal({
  open,
  purchase,
  onClose,
  onSuccess,
}: DeletePurchaseModalProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!open || !purchase) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteSupplierPurchase(purchase.id)).unwrap();
      toast.success(`Purchase order #${purchase.id} deleted successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to delete purchase order');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Delete Purchase Order</h3>
              <p className="text-xs text-slate-400">Order #{purchase.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-xs text-red-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            Irreversible Action
          </div>
          <p>
            Are you sure you want to delete purchase order <strong>#{purchase.id}</strong> from{' '}
            <strong>{purchase.supplierName}</strong>? All associated item records will be removed.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
