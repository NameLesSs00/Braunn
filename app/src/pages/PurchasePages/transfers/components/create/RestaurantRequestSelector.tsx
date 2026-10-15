import { Calendar, Building2, Layers, CheckCircle2 } from 'lucide-react';
import type { RestaurantMaterialRequest } from '../../../../../models/Purchasemodels/InventoryTransfer';

interface RestaurantRequestSelectorProps {
  materialRequests: RestaurantMaterialRequest[];
  selectedRequestId: number | 'none';
  onSelectRequest: (requestId: number | 'none') => void;
  fulfilledRequestIds?: Set<number>;
}

export function RestaurantRequestSelector({
  materialRequests,
  selectedRequestId,
  onSelectRequest,
  fulfilledRequestIds,
}: RestaurantRequestSelectorProps) {
  const pendingRequests = materialRequests.filter((r) => {
    const isPending = r.status?.toLowerCase() === 'pending';
    const isAlreadyFulfilled = fulfilledRequestIds ? fulfilledRequestIds.has(r.id) : false;
    return isPending && !isAlreadyFulfilled;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Select Material Request to Fulfill:
        </label>
        <span className="text-xs text-slate-400 font-medium">
          {pendingRequests.length} pending request{pendingRequests.length === 1 ? '' : 's'}
        </span>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-xs text-slate-400">
          No pending material requests from restaurants at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
          {pendingRequests.map((req) => {
            const isSelected = selectedRequestId === req.id;
            const itemsSummary = req.items
              .map((it) => `${it.materialName} (${it.requestedQuantity} ${it.unitSymbol || ''})`)
              .join(', ');

            return (
              <button
                key={req.id}
                type="button"
                onClick={() => onSelectRequest(isSelected ? 'none' : req.id)}
                className={`flex flex-col text-left rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#0B4EA2] bg-blue-50/40 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold font-mono text-xs text-slate-900">
                    {req.requestNumber || `#MR-${req.id}`}
                  </span>
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-[#0B4EA2] shrink-0" />
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.2 text-[10px] font-semibold text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-1">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{req.restaurantName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{formatDate(req.requestDate || req.createdAt)}</span>
                </div>

                <div className="flex items-start gap-1 text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-1.5">
                  <Layers className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 italic">{itemsSummary}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
