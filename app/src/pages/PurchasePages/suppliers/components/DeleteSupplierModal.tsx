import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../../../shared/ui/Modal';
import { useAppDispatch } from '../../../../store/hooks';
import { deleteSupplier } from '../../../../features/Purchasefeatures/suppliers/suppliersSlice';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';

interface DeleteSupplierModalProps {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteSupplierModal({
  open,
  supplier,
  onClose,
  onSuccess,
}: DeleteSupplierModalProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!supplier) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const action = await dispatch(deleteSupplier(supplier.id));

      if (deleteSupplier.fulfilled.match(action)) {
        toast.success(`Supplier "${supplier.name}" removed successfully!`);
        onSuccess();
        onClose();
      } else {
        const error = (action.payload as string) || 'Failed to delete supplier';
        toast.error(error);
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[440px] max-w-[95vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h2 className="text-lg font-bold text-slate-800">Delete Supplier?</h2>
          <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">
            Are you sure you want to delete <strong className="text-slate-800 font-semibold">{supplier.name}</strong>?
            This action cannot be undone.
          </p>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left text-[12px] text-slate-500 space-y-1">
            <div><span className="font-semibold text-slate-700">Tax Number:</span> {supplier.taxNumber}</div>
            <div><span className="font-semibold text-slate-700">Departments:</span> {supplier.departments.join(', ')}</div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-1/2 rounded-xl border border-slate-200 bg-white py-2.5 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-[14px] font-semibold text-white hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
