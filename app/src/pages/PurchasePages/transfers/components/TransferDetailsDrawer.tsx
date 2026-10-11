import {
  X,
  Calendar,
  Building2,
  Package,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRightLeft,
  FileText,
  User,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import type { InventoryTransfer } from '../../../../models/Purchasemodels/InventoryTransfer';

interface TransferDetailsDrawerProps {
  open: boolean;
  transfer: InventoryTransfer | null;
  onClose: () => void;
  onConfirm: (transfer: InventoryTransfer) => void;
  onCancel: (transfer: InventoryTransfer) => void;
}

export function TransferDetailsDrawer({
  open,
  transfer,
  onClose,
  onConfirm,
  onCancel,
}: TransferDetailsDrawerProps) {
  if (!open || !transfer) return null;

  const isPending = transfer.status?.toLowerCase() === 'pending';
  const isConfirmed = transfer.status?.toLowerCase() === 'confirmed';
  const isCancelled = transfer.status?.toLowerCase() === 'cancelled';

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString(undefined, {
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
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4.5 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 font-mono">
                    #TR-{String(transfer.id).padStart(4, '0')}
                  </h2>
                  {isConfirmed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmed
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                  {isCancelled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200/60">
                      <Ban className="h-3 w-3" />
                      Cancelled
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">Main Inventory Transfer Record</p>
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

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Origin & Destination Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Origin (Source)
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Package className="h-4 w-4 text-[#0B4EA2]" />
                  <span>Central Purchasing Storage</span>
                </div>
                <p className="text-xs text-slate-500">Main Warehouse</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Destination
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span className="truncate">
                    {transfer.destinationWarehouseName || transfer.restaurantName || 'Department Storage'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {transfer.departmentType} &bull; {transfer.restaurantName || 'Kitchen'}
                </p>
              </div>
            </div>

            {/* Line Items Breakdown Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-[#0B4EA2]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Transferred Materials ({transfer.items?.length || 1})
                  </h3>
                </div>
                {transfer.materialRequestId && (
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Req #{transfer.materialRequestId}
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Material</th>
                      <th className="px-4 py-3 text-right">Requested</th>
                      <th className="px-4 py-3 text-right">Transferred</th>
                      <th className="px-4 py-3 text-center">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transfer.items && transfer.items.length > 0 ? (
                      transfer.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {it.materialName || `Material #${it.materialId}`}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-500">
                            {it.requestedQuantity}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-[#0B4EA2]">
                            {it.transferredQuantity}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              {it.transferredUnitSymbol || it.transferredUnitName || 'Unit'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          Item #{transfer.itemId}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-500">
                          {transfer.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#0B4EA2]">
                          {transfer.quantity}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                            Units
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail & Timestamps */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
                Audit Journal & Timestamps
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Transfer Date:
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {formatDateTime(transfer.transferDate)}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Transferred By:
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 truncate block" title={transfer.transferredBy}>
                    {transfer.transferredBy || 'System Admin'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Confirmation Date:
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {formatDateTime(transfer.confirmedAt)}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Confirmed By:
                  </span>
                  <span className="font-mono text-[11px] text-slate-600 truncate block" title={transfer.confirmedBy || '—'}>
                    {transfer.confirmedBy || '—'}
                  </span>
                </div>
              </div>

              {transfer.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                    <FileText className="h-3.5 w-3.5" /> Transfer Notes:
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {transfer.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {isPending && (
            <div className="border-t border-slate-200/80 bg-white p-4 px-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onCancel(transfer)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Ban className="h-4 w-4" />
                <span>Cancel Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => onConfirm(transfer)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Delivery</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
