import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { PurchasingAdvanceStatus } from '../../../../models/Purchasemodels/PurchasingAdvance';

interface AdvanceStatusBadgeProps {
  status: PurchasingAdvanceStatus;
  className?: string;
}

export function AdvanceStatusBadge({ status, className = '' }: AdvanceStatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'active') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <CheckCircle2 className="h-3.5 w-3.5" />
        Active
      </span>
    );
  }

  if (normalized === 'cancelled') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 ${className}`}
      >
        <XCircle className="h-3.5 w-3.5" />
        Cancelled
      </span>
    );
  }

  if (normalized === 'consumed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 ${className}`}
      >
        <Clock className="h-3.5 w-3.5" />
        Consumed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
    >
      <AlertCircle className="h-3.5 w-3.5" />
      {status || 'Unknown'}
    </span>
  );
}
