import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  ArrowRightLeft,
} from 'lucide-react';
import type {
  PurchasingInventoryItem,
  RestaurantMaterialRequest,
  CreateRestaurantTransferRequest,
} from '../../../../models/Purchasemodels/InventoryTransfer';

interface CreateTransferModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRestaurantTransferRequest) => Promise<void>;
  purchasingInventory: PurchasingInventoryItem[];
  materialRequests: RestaurantMaterialRequest[];
  warehouses: Array<{ warehouseId: number; warehouseName: string; restaurantId: number; restaurantName: string }>;
  isSubmitting: boolean;
}

interface TransferItemRow {
  materialId: number;
  materialName: string;
  availableStock: number;
  requestedQuantity: number;
  transferredQuantity: number;
  unitId: number;
  unitSymbol: string;
}

export function CreateTransferModal({
  open,
  onClose,
  onSubmit,
  purchasingInventory,
  materialRequests,
  warehouses,
  isSubmitting,
}: CreateTransferModalProps) {
  const [mode, setMode] = useState<'request' | 'adhoc'>('request');
  const [selectedRequestId, setSelectedRequestId] = useState<number | 'none'>('none');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(warehouses[0]?.warehouseId || 1);
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<TransferItemRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync destination warehouse default
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].warehouseId);
    }
  }, [warehouses, selectedWarehouseId]);

  // When switching to a material request, prefill items
  useEffect(() => {
    if (mode === 'request' && selectedRequestId !== 'none') {
      const req = materialRequests.find((r) => r.id === Number(selectedRequestId));
      if (req) {
        const newRows: TransferItemRow[] = req.items.map((it) => {
          const invItem = purchasingInventory.find((p) => p.itemId === it.materialId);
          return {
            materialId: it.materialId,
            materialName: it.materialName,
            availableStock: invItem?.quantity || 0,
            requestedQuantity: it.requestedQuantity,
            transferredQuantity: Math.min(it.requestedQuantity, invItem?.quantity || it.requestedQuantity),
            unitId: it.unitId,
            unitSymbol: it.unitSymbol || invItem?.unitSymbol || 'KG',
          };
        });
        setRows(newRows);
      }
    }
  }, [selectedRequestId, mode, materialRequests, purchasingInventory]);

  if (!open) return null;

  const handleAddCustomRow = () => {
    if (purchasingInventory.length === 0) return;
    const first = purchasingInventory[0];
    setRows((prev) => [
      ...prev,
      {
        materialId: first.itemId,
        materialName: first.itemName,
        availableStock: first.quantity,
        requestedQuantity: 1,
        transferredQuantity: 1,
        unitId: first.unitId,
        unitSymbol: first.unitSymbol,
      },
    ]);
  };

  const handleRowMaterialChange = (index: number, materialId: number) => {
    const item = purchasingInventory.find((p) => p.itemId === materialId);
    if (!item) return;

    setRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              materialId: item.itemId,
              materialName: item.itemName,
              availableStock: item.quantity,
              unitId: item.unitId,
              unitSymbol: item.unitSymbol,
            }
          : r
      )
    );
  };

  const handleRowQuantityChange = (index: number, qty: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, transferredQuantity: qty } : r))
    );
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (rows.length === 0) {
      setFormError('Please add at least one material to transfer.');
      return;
    }

    for (const r of rows) {
      if (r.transferredQuantity <= 0) {
        setFormError(`Transferred quantity for ${r.materialName} must be greater than zero.`);
        return;
      }
    }

    const payload: CreateRestaurantTransferRequest = {
      destinationWarehouseId: selectedWarehouseId,
      materialRequestId: mode === 'request' && selectedRequestId !== 'none' ? Number(selectedRequestId) : null,
      notes,
      items: rows.map((r) => ({
        materialId: r.materialId,
        requestedQuantity: r.requestedQuantity,
        requestedUnitId: r.unitId,
        transferredQuantity: r.transferredQuantity,
        transferredUnitId: r.unitId,
      })),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create transfer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Issue Inventory Transfer</h2>
              <p className="text-xs text-slate-500">
                Dispatch stock from Central Purchasing Storage to department warehouse
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('request');
                setRows([]);
              }}
              className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
                mode === 'request'
                  ? 'bg-white text-[#0B4EA2] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Fulfill Material Request ({materialRequests.filter((r) => r.status?.toLowerCase() === 'pending').length})
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('adhoc');
                setSelectedRequestId('none');
                setRows([]);
              }}
              className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
                mode === 'adhoc'
                  ? 'bg-white text-[#0B4EA2] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Ad-Hoc / Custom Transfer
            </button>
          </div>

          {/* Destination & Source row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* If Mode === Request, show Request Dropdown */}
            {mode === 'request' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Pending Material Request:
                </label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value === 'none' ? 'none' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
                >
                  <option value="none">-- Select Request --</option>
                  {materialRequests
                    .filter((r) => r.status?.toLowerCase() === 'pending')
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.requestNumber || `#MR-${r.id}`} - {r.restaurantName} ({r.items.length} items)
                      </option>
                    ))}
                </select>
              </div>
            ) : null}

            {/* Destination Warehouse */}
            <div className={mode === 'adhoc' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Destination Warehouse:
              </label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
              >
                {warehouses.map((w) => (
                  <option key={w.warehouseId} value={w.warehouseId}>
                    {w.warehouseName} ({w.restaurantName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Transfer Items ({rows.length})
              </span>
              {mode === 'adhoc' && (
                <button
                  type="button"
                  onClick={handleAddCustomRow}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0B4EA2] hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Material
                </button>
              )}
            </div>

            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                {mode === 'request'
                  ? 'Select a pending material request above to prefill materials.'
                  : 'Click "Add Material" above to select materials from Central Stock.'}
              </div>
            ) : (
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div
                    key={`row-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/40 p-3"
                  >
                    {/* Material Select / Display */}
                    <div className="flex-1">
                      {mode === 'adhoc' ? (
                        <select
                          value={row.materialId}
                          onChange={(e) => handleRowMaterialChange(idx, Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-[#0B4EA2] focus:outline-none"
                        >
                          {purchasingInventory.map((item) => (
                            <option key={item.id} value={item.itemId}>
                              {item.itemName} (Avail: {item.quantity} {item.unitSymbol})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="font-semibold text-slate-800 text-xs">
                          {row.materialName}
                          <span className="text-[11px] font-normal text-slate-400 block">
                            Requested: {row.requestedQuantity} {row.unitSymbol} &bull; Central Stock: {row.availableStock} {row.unitSymbol}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Input */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-medium text-slate-400">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={row.availableStock > 0 ? row.availableStock : undefined}
                          step="any"
                          value={row.transferredQuantity}
                          onChange={(e) => handleRowQuantityChange(idx, Number(e.target.value))}
                          className="h-8 w-20 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800 focus:border-[#0B4EA2] focus:outline-none text-right"
                        />
                        <span className="text-xs font-semibold text-slate-500 w-8">
                          {row.unitSymbol}
                        </span>
                      </div>

                      {mode === 'adhoc' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="grid h-8 w-8 place-items-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Remarks / Notes (Optional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Regular kitchen morning stock replenishment"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 focus:border-[#0B4EA2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
            />
          </div>

          {/* Footer buttons */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || rows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4EA2] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Dispatching Transfer...</span>
              ) : (
                <>
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>Issue Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
