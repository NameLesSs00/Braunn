import { useState } from 'react';
import { X, AlertTriangle, Ban } from 'lucide-react';
import type { InventoryTransfer } from '../../../../models/Purchasemodels/InventoryTransfer';

interface CancelTransferModalProps {
  open: boolean;
  transfer: InventoryTransfer | null;
  onClose: () => void;
  onConfirmCancel: (id: number, reason: string) => Promise<void>;
  isCancelling: boolean;
}

export function CancelTransferModal({
  open,
  transfer,
  onClose,
  onConfirmCancel,
  isCancelling,
}: CancelTransferModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open || !transfer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for cancelling this transfer.');
      return;
    }

    try {
      await onConfirmCancel(transfer.id, reason.trim());
      setReason('');
      setError(null);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel transfer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cancel Transfer #TR-{String(transfer.id).padStart(4, '0')}
              </h3>
              <p className="text-xs text-slate-500">
                This will void the pending delivery order
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel this transfer to{' '}
            <strong>{transfer.destinationWarehouseName || transfer.restaurantName || 'the department'}</strong>?
            Please specify an audit reason for logging.
          </p>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate order issued / kitchen changed requirements"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isCancelling}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isCancelling || !reason.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
