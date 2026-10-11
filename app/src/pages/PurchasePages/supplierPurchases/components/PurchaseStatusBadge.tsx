import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { PurchaseStatus, PurchasePaymentStatus } from '../../../../models/Purchasemodels/SupplierPurchase';

export function PurchaseStatusBadge({ status }: { status: PurchaseStatus | string }) {
  const normalized = status?.toLowerCase();

  if (normalized === 'received') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Received
      </span>
    );
  }

  if (normalized === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {status || 'Unknown'}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PurchasePaymentStatus | string }) {
  const normalized = status?.toLowerCase();

  if (normalized === 'paid') {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
        Paid
      </span>
    );
  }

  if (normalized === 'partiallypaid') {
    return (
      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
        Partially Paid
      </span>
    );
  }

  if (normalized === 'pending') {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
      {status || 'Pending'}
    </span>
  );
}
