import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface InstallmentStatusBadgeProps {
  status: string;
  isOverdue?: boolean;
  className?: string;
}

export function InstallmentStatusBadge({
  status,
  isOverdue = false,
  className = '',
}: InstallmentStatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  if (isOverdue || normalized === 'overdue') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
        Overdue
      </span>
    );
  }

  if (normalized === 'paid') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Paid
      </span>
    );
  }

  if (normalized === 'partiallypaid') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 ${className}`}
      >
        <Clock className="h-3.5 w-3.5" />
        Partially Paid
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 ${className}`}
    >
      <Clock className="h-3.5 w-3.5" />
      {status || 'Pending'}
    </span>
  );
}
