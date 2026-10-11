import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Wallet, Building2, Phone, Mail, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../../../../store/hooks';
import { createPurchasingAdvance } from '../../../../features/Purchasefeatures/purchasingAdvances/purchasingAdvancesSlice';
import type { Supplier } from '../../../../models/Purchasemodels/Supplier';

interface CreatePurchasingAdvanceDrawerProps {
  open: boolean;
  suppliers: Supplier[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePurchasingAdvanceDrawer({
  open,
  suppliers,
  onClose,
  onSuccess,
}: CreatePurchasingAdvanceDrawerProps) {
  const dispatch = useAppDispatch();

  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
      setAmount('');
      setNotes('');
      setIsSubmitting(false);
    }
  }, [open, suppliers]);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === supplierId),
    [suppliers, supplierId]
  );

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid advance amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createPurchasingAdvance({
          supplierId: Number(supplierId),
          amount: numAmount,
          notes: notes.trim(),
        })
      ).unwrap();

      toast.success(
        `Advance of $${numAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })} successfully issued to ${selectedSupplier?.name || 'vendor'}!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to create purchasing advance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2]">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Purchasing Advance</h2>
                <p className="text-xs text-slate-500">
                  Record a cash down payment or prepaid balance for a vendor
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body Form */}
          <form
            id="create-advance-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Supplier Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Supplier / Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
                >
                  <option value="">Choose vendor...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.phone ? `(${s.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor details preview */}
              {selectedSupplier && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Building2 className="h-3.5 w-3.5 text-[#0B4EA2]" />
                    {selectedSupplier.name}
                    {selectedSupplier.taxNumber && (
                      <span className="text-[11px] text-slate-400 font-normal">
                        Tax #: {selectedSupplier.taxNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-1">
                    {selectedSupplier.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {selectedSupplier.phone}
                      </span>
                    )}
                    {selectedSupplier.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {selectedSupplier.email}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Advance Amount ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-base font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                This amount will be recorded as active prepaid balance and can be reconciled against future invoices.
              </p>
            </div>

            {/* Notes / Reason */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Notes & Justification
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Down payment for raw food materials shipment #1042..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 resize-none"
                />
              </div>
            </div>

            {/* Advance Policy Notice */}
            <div className="rounded-xl border border-blue-100 bg-[#EEF4FF]/50 p-3.5 text-xs text-[#0B4EA2] flex items-start gap-2.5">
              <FileText className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Advance Policy Notice</p>
                <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">
                  Advances remain in <strong>Active</strong> status until consumed against vendor invoices or manually cancelled. Consumed advances cannot be deleted.
                </p>
              </div>
            </div>
          </form>

          {/* Drawer Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-advance-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span>Issuing Advance...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Issue Advance</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
