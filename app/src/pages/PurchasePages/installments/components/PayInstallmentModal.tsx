import { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Building2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../../../../store/hooks';
import { paySingleInstallment } from '../../../../features/Purchasefeatures/purchasingInstallments/purchasingInstallmentsSlice';
import type { PurchasingInstallmentListItem } from '../../../../models/Purchasemodels/PurchasingInstallment';

interface PayInstallmentModalProps {
  installment: PurchasingInstallmentListItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayInstallmentModal({
  installment,
  onClose,
  onSuccess,
}: PayInstallmentModalProps) {
  const dispatch = useAppDispatch();

  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (installment) {
      setAmount(installment.remainingAmount.toString());
      setPaymentMethod('Cash');
      setReferenceNumber('');
      setNotes('');
      setIsSubmitting(false);
    }
  }, [installment]);

  if (!installment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid payment amount greater than 0');
      return;
    }

    if (numAmount > installment.remainingAmount) {
      toast.error(
        `Amount cannot exceed the remaining due amount ($${installment.remainingAmount.toFixed(2)})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        paySingleInstallment({
          installmentId: installment.id,
          amount: numAmount,
          paymentMethod,
          referenceNumber: referenceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      ).unwrap();

      toast.success(
        `Installment payment of $${numAmount.toFixed(2)} recorded successfully!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to pay installment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pay Installment #{installment.installmentNumber || installment.id}
              </h3>
              <p className="text-xs text-slate-500">Plan #PLAN-{installment.installmentPlanId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Supplier Info */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#0B4EA2]" />
              <span className="font-semibold text-slate-800">
                {installment.supplierName || `Supplier #${installment.supplierId}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5">Due:</span>
              <span className="font-bold text-[#0B4EA2]">
                ${Number(installment.remainingAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Payment Amount ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="number"
                step="any"
                min="0.01"
                max={installment.remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-base font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Check">Check / Cheque</option>
                <option value="CreditCard">Credit Card</option>
              </select>
            </div>

            {/* Reference # */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. TXN-1092"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Notes
            </label>
            <input
              type="text"
              placeholder="Optional remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4EA2] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Record Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
