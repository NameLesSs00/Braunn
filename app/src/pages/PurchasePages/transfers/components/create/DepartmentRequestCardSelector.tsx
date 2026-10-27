import { Calendar, Building2, Sparkles, Home, Wrench, Layers, CheckCircle2 } from 'lucide-react';
import type { UnifiedDepartmentRequest, DepartmentType } from '../../../../../models/Purchasemodels/InventoryTransfer';

interface DepartmentRequestCardSelectorProps {
  department: DepartmentType;
  requests: UnifiedDepartmentRequest[];
  selectedRequestId: string | number | 'none';
  onSelectRequest: (requestId: string | 'none') => void;
}

export function DepartmentRequestCardSelector({
  department,
  requests,
  selectedRequestId,
  onSelectRequest,
}: DepartmentRequestCardSelectorProps) {
  const pendingRequests = requests.filter(
    (r) => r.department === department && r.status?.toLowerCase() === 'pending'
  );

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

  const getDeptIcon = () => {
    switch (department) {
      case 'Laundry':
        return <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />;
      case 'Housekeeping':
        return <Home className="h-3.5 w-3.5 text-sky-600 shrink-0" />;
      case 'Maintenance':
        return <Wrench className="h-3.5 w-3.5 text-purple-600 shrink-0" />;
      case 'Restaurant':
      default:
        return <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Select {department} Request to Fulfill:
        </label>
        <span className="text-xs text-slate-400 font-medium">
          {pendingRequests.length} pending request{pendingRequests.length === 1 ? '' : 's'}
        </span>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-xs text-slate-400">
          No pending purchase requests from {department} at this time. Use "Direct {department} Dispatch" to send materials ad-hoc.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1">
          {pendingRequests.map((req) => {
            const isSelected = String(selectedRequestId) === String(req.id);
            const itemsSummary = req.items
              .map((it) =>
                department === 'Restaurant'
                  ? `${it.itemName} (${it.quantity}${it.unitSymbol ? ` ${it.unitSymbol}` : ''})`
                  : `${it.itemName} (Amount: ${it.quantity})`
              )
              .join(', ');

            return (
              <button
                key={req.id}
                type="button"
                onClick={() => onSelectRequest(isSelected ? 'none' : String(req.id))}
                className={`flex flex-col text-left rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#0B4EA2] bg-blue-50/40 shadow-2xs ring-1 ring-[#0B4EA2]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold font-mono text-xs text-slate-900">
                    {req.referenceCode}
                  </span>
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-4 text-[#0B4EA2] shrink-0" />
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                      Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-1">
                  {getDeptIcon()}
                  <span className="truncate">{req.requesterName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>Required: {formatDate(req.requiredDate || req.createdAt)}</span>
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

export default DepartmentRequestCardSelector;
