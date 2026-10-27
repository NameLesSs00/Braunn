import { Trash2, AlertTriangle, ArrowRight, Layers, Plus, Minus } from 'lucide-react';

export interface StagedTransferRow {
  materialId: number;
  materialName: string;
  departmentType: string;
  availableStock: number;
  requestedQuantity?: number;
  transferredQuantity: number;
  unitId: number;
  unitSymbol: string;
}

interface TransferLineItemsTableProps {
  rows: StagedTransferRow[];
  onUpdateQuantity: (materialId: number, newQty: number) => void;
  onRemoveRow: (materialId: number) => void;
  isFulfillingRequest?: boolean;
  isRestaurant?: boolean;
}

export function TransferLineItemsTable({
  rows,
  onUpdateQuantity,
  onRemoveRow,
  isFulfillingRequest = false,
  isRestaurant = false,
}: TransferLineItemsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-600">No Items Selected Yet</p>
        <p>Use the search combobox above to pick items to transfer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {rows.map((row) => {
        const isRowRestaurant = isRestaurant || row.departmentType === 'Restaurant';
        const remainingStock = row.availableStock - row.transferredQuantity;
        const isExceeding = isRowRestaurant && row.transferredQuantity > row.availableStock;
        const isZeroTransfer = row.transferredQuantity <= 0;

        return (
          <div
            key={row.materialId}
            className={`rounded-2xl border p-4 transition-all ${
              isExceeding
                ? 'border-rose-300 bg-rose-50/30'
                : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Material Identity */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-[#0B4EA2] shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {row.materialName}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      #{row.materialId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                      {row.departmentType || 'Central'}
                    </span>
                    <span>&bull;</span>
                    <span>
                      In Storage:{' '}
                      <strong className="text-slate-800">
                        {Number(row.availableStock).toLocaleString()}
                        {isRowRestaurant ? ` ${row.unitSymbol}` : ''}
                      </strong>
                    </span>
                    {isFulfillingRequest && row.requestedQuantity !== undefined && (
                      <>
                        <span>&bull;</span>
                        <span className="text-blue-600 font-medium">
                          {isRowRestaurant
                            ? `Requested: ${row.requestedQuantity} ${row.unitSymbol}`
                            : `Requested Amount: ${row.requestedQuantity}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Projections */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Stepper Input */}
                <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(row.materialId, Math.max(1, row.transferredQuantity - 1))}
                    disabled={row.transferredQuantity <= 1}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={row.transferredQuantity}
                    onChange={(e) => onUpdateQuantity(row.materialId, Number(e.target.value))}
                    className="w-16 text-center text-xs font-bold text-slate-900 bg-transparent outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(row.materialId, row.transferredQuantity + 1)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>

                  <span className="text-[11px] font-semibold text-slate-500 pr-1.5">
                    {isRowRestaurant ? row.unitSymbol : 'Amount'}
                  </span>
                </div>

                {/* Storage Balance Projection */}
                <div className="hidden md:flex flex-col text-right min-w-[120px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Remaining Storage
                  </span>
                  <div className="flex items-center justify-end gap-1 text-xs">
                    <span className="text-slate-400 line-through">
                      {row.availableStock}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span
                      className={`font-bold ${
                        remainingStock < 0
                          ? 'text-rose-600'
                          : remainingStock <= 5
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {remainingStock}{isRowRestaurant ? ` ${row.unitSymbol}` : ''}
                    </span>
                  </div>
                </div>

                {/* Delete row */}
                <button
                  type="button"
                  onClick={() => onRemoveRow(row.materialId)}
                  className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Warnings */}
            {isExceeding && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Transfer quantity ({row.transferredQuantity} {row.unitSymbol}) exceeds available central storage ({row.availableStock} {row.unitSymbol})!
                </span>
              </div>
            )}
            {isZeroTransfer && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>Transfer {isRowRestaurant ? 'quantity' : 'amount'} must be greater than 0.</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
