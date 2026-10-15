import { useState } from 'react';
import { X, CheckCircle2, Package, Warehouse } from 'lucide-react';
import type { InventoryTransfer } from '../../../../models/Purchasemodels/InventoryTransfer';

interface ConfirmTransferModalProps {
  open: boolean;
  transfer: InventoryTransfer | null;
  onClose: () => void;
  onConfirm: (transfer: InventoryTransfer) => Promise<void>;
  isConfirming: boolean;
}

export function ConfirmTransferModal({
  open,
  transfer,
  onClose,
  onConfirm,
  isConfirming,
}: ConfirmTransferModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!open || !transfer) return null;

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm(transfer);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to confirm transfer delivery');
    }
  };

  const formattedId = `#TR-${String(transfer.id).padStart(4, '0')}`;
  const destination = transfer.destinationWarehouseName || transfer.restaurantName || 'Destination Department';
  const itemsCount = transfer.items?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={!isConfirming ? onClose : undefined}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Transfer Delivery
              </h3>
              <p className="text-xs text-slate-500">
                Order <span className="font-mono font-semibold text-emerald-800">{formattedId}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please confirm that the inventory items have been received at{' '}
            <strong className="text-slate-900">{destination}</strong>. This action will update the transfer status to <span className="font-semibold text-emerald-700">Confirmed</span>.
          </p>

          {/* Transfer Summary Card */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Warehouse className="h-3.5 w-3.5 text-slate-400" /> Destination:
              </span>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                {destination}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/60 pt-2">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Package className="h-3.5 w-3.5 text-slate-400" /> Items Included:
              </span>
              <span className="font-semibold text-slate-800">
                {itemsCount} {itemsCount === 1 ? 'material item' : 'material items'}
              </span>
            </div>

            {transfer.items && transfer.items.length > 0 && (
              <div className="border-t border-slate-200/60 pt-2 text-[11px] text-slate-500 space-y-1">
                {transfer.items.slice(0, 3).map((it) => (
                  <div key={it.id} className="flex justify-between items-center">
                    <span className="truncate max-w-[220px]">{it.materialName}</span>
                    <span className="font-mono font-medium text-slate-700">
                      {it.transferredQuantity} {it.requestedUnitSymbol || it.requestedUnitName}
                    </span>
                  </div>
                ))}
                {transfer.items.length > 3 && (
                  <p className="text-[10px] text-slate-400 italic">
                    +{transfer.items.length - 3} more items...
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 leading-snug">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isConfirming}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isConfirming ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm Delivery</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
