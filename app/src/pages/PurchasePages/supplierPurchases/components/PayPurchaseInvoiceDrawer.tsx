import { useState, useEffect, useMemo } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  Wallet,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch } from '../../../../store/hooks';
import {
  processCashPayment,
  processAdvancePayment,
  processMixedPayment,
} from '../../../../features/Purchasefeatures/purchasingPayments/purchasingPaymentsSlice';
import { createInstallmentPlan } from '../../../../features/Purchasefeatures/purchasingInstallments/purchasingInstallmentsSlice';
import { purchasingAdvancesApi } from '../../../../shared/Purchaseshared/api/purchasingAdvancesApi';
import type { SupplierPurchaseListItem } from '../../../../models/Purchasemodels/SupplierPurchase';
import type { PurchasingAdvance } from '../../../../models/Purchasemodels/PurchasingAdvance';
import type { PaymentMode } from '../../../../models/Purchasemodels/PurchasingPayment';

interface PayPurchaseInvoiceDrawerProps {
  open: boolean;
  purchase: SupplierPurchaseListItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PayPurchaseInvoiceDrawer({
  open,
  purchase,
  onClose,
  onSuccess,
}: PayPurchaseInvoiceDrawerProps) {
  const dispatch = useAppDispatch();

  // Active Tab
  const [activeTab, setActiveTab] = useState<PaymentMode>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available advances for this supplier
  const [supplierAdvances, setSupplierAdvances] = useState<PurchasingAdvance[]>([]);
  const [loadingAdvances, setLoadingAdvances] = useState(false);

  // 1. Cash Tab Fields
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cashMethod, setCashMethod] = useState<string>('Cash');
  const [cashRef, setCashRef] = useState<string>('');
  const [cashNotes, setCashNotes] = useState<string>('');

  // 2. Advance Tab Fields
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<number | ''>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [advanceNotes, setAdvanceNotes] = useState<string>('');
  const [advanceRef, setAdvanceRef] = useState<string>('');

  // 3. Installment Plan Tab Fields
  const [planTotalAmount, setPlanTotalAmount] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('0');
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [planNotes, setPlanNotes] = useState<string>('');

  // 4. Mixed Payment Tab Fields
  const [mixedCashAmount, setMixedCashAmount] = useState<string>('');
  const [mixedAdvanceId, setMixedAdvanceId] = useState<number | ''>('');
  const [mixedAdvanceAmount, setMixedAdvanceAmount] = useState<string>('');

  // Fetch active supplier advances when drawer opens
  useEffect(() => {
    if (open && purchase?.supplierId) {
      setLoadingAdvances(true);
      purchasingAdvancesApi
        .getAdvances({
          supplierId: purchase.supplierId,
          status: 'Active',
          pageSize: 50,
        })
        .then((res) => {
          const activeWithBalance = (res.data || []).filter((a) => a.remainingAmount > 0);
          setSupplierAdvances(activeWithBalance);
          if (activeWithBalance.length > 0) {
            setSelectedAdvanceId(activeWithBalance[0].id);
            setMixedAdvanceId(activeWithBalance[0].id);
          }
        })
        .catch(() => {
          setSupplierAdvances([]);
        })
        .finally(() => {
          setLoadingAdvances(false);
        });
    }
  }, [open, purchase?.supplierId]);

  // Reset form values on open
  useEffect(() => {
    if (open && purchase) {
      const rem = purchase.remainingAmount || 0;
      setCashAmount(rem.toString());
      setCashMethod('Cash');
      setCashRef('');
      setCashNotes('');

      setAdvanceAmount(rem.toString());
      setAdvanceNotes('');
      setAdvanceRef('');

      setPlanTotalAmount(rem.toString());
      setDownPayment('0');
      setNumberOfInstallments(3);
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setStartDate(now.toISOString().slice(0, 16));
      setPlanNotes('');

      setMixedCashAmount('');
      setMixedAdvanceAmount('');
      setIsSubmitting(false);
    }
  }, [open, purchase]);

  const selectedAdvance = useMemo(
    () => supplierAdvances.find((a) => a.id === selectedAdvanceId),
    [supplierAdvances, selectedAdvanceId]
  );

  const selectedMixedAdvance = useMemo(
    () => supplierAdvances.find((a) => a.id === mixedAdvanceId),
    [supplierAdvances, mixedAdvanceId]
  );

  // Calculated preview for Installment Plan
  const planPreview = useMemo(() => {
    const total = parseFloat(planTotalAmount) || 0;
    const down = parseFloat(downPayment) || 0;
    const num = numberOfInstallments || 1;
    const financed = Math.max(0, total - down);
    const installmentVal = num > 0 ? financed / num : 0;

    const schedule = [];
    const baseDate = startDate ? new Date(startDate) : new Date();

    for (let i = 1; i <= num; i++) {
      const due = new Date(baseDate);
      due.setMonth(due.getMonth() + i);
      schedule.push({
        installmentNumber: i,
        dueDate: due.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        amount: installmentVal,
      });
    }

    return {
      financed,
      installmentVal,
      schedule,
    };
  }, [planTotalAmount, downPayment, numberOfInstallments, startDate]);

  if (!open || !purchase) return null;

  // Handlers
  const handleCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(cashAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid cash amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        processCashPayment({
          supplierId: purchase.supplierId,
          supplierPurchaseId: purchase.id,
          amount: amt,
          paymentMethod: cashMethod,
          notes: cashNotes.trim() || undefined,
          referenceNumber: cashRef.trim() || undefined,
        })
      ).unwrap();

      toast.success(`Cash payment of $${amt.toFixed(2)} recorded successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to record cash payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdvanceId) {
      toast.error('Please select an active advance');
      return;
    }

    const amt = parseFloat(advanceAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid deduction amount');
      return;
    }

    if (selectedAdvance && amt > selectedAdvance.remainingAmount) {
      toast.error(
        `Amount exceeds advance available balance ($${selectedAdvance.remainingAmount.toFixed(2)})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        processAdvancePayment({
          supplierId: purchase.supplierId,
          advanceId: Number(selectedAdvanceId),
          supplierPurchaseId: purchase.id,
          amount: amt,
          paymentMethod: 'AdvanceDeduction',
          notes: advanceNotes.trim() || undefined,
          referenceNumber: advanceRef.trim() || undefined,
        })
      ).unwrap();

      toast.success(`Advance deduction of $${amt.toFixed(2)} applied successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to apply advance payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(planTotalAmount);
    const down = parseFloat(downPayment) || 0;

    if (isNaN(total) || total <= 0) {
      toast.error('Please enter a valid plan total amount');
      return;
    }

    if (down < 0 || down >= total) {
      toast.error('Down payment must be less than the total plan amount');
      return;
    }

    if (numberOfInstallments < 1) {
      toast.error('Number of installments must be at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createInstallmentPlan({
          supplierPurchaseId: purchase.id,
          totalAmount: total,
          downPayment: down,
          numberOfInstallments,
          startDate: new Date(startDate).toISOString(),
          notes: planNotes.trim() || undefined,
        })
      ).unwrap();

      toast.success(
        `Installment plan of $${total.toFixed(2)} created with ${numberOfInstallments} installments!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to create installment plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMixedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cAmt = parseFloat(mixedCashAmount) || 0;
    const aAmt = parseFloat(mixedAdvanceAmount) || 0;

    if (cAmt <= 0 && aAmt <= 0) {
      toast.error('Please specify at least cash or advance deduction amount');
      return;
    }

    if (aAmt > 0 && !mixedAdvanceId) {
      toast.error('Please select an advance to deduct from');
      return;
    }

    if (selectedMixedAdvance && aAmt > selectedMixedAdvance.remainingAmount) {
      toast.error(
        `Advance deduction exceeds available balance ($${selectedMixedAdvance.remainingAmount.toFixed(
          2
        )})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        processMixedPayment({
          supplierPurchaseId: purchase.id,
          advanceId: aAmt > 0 && mixedAdvanceId ? Number(mixedAdvanceId) : undefined,
          advanceAmount: aAmt > 0 ? aAmt : undefined,
          cashAmount: cAmt > 0 ? cAmt : undefined,
        })
      ).unwrap();

      toast.success(`Mixed payment applied successfully! Total: $${(cAmt + aAmt).toFixed(2)}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err || 'Failed to process mixed payment');
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#0B4EA2]">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pay Purchase Order #{purchase.id}
                </h2>
                <p className="text-xs text-slate-500">
                  Vendor: <span className="font-semibold text-slate-800">{purchase.supplierName}</span>
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

          {/* Invoice Summary Card */}
          <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-3.5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-slate-200/60 bg-white p-2.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">
                  Invoice Total
                </span>
                <span className="text-sm font-black text-slate-800">
                  ${Number(purchase.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase">
                  Paid
                </span>
                <span className="text-sm font-black text-emerald-700">
                  ${Number(purchase.paidAmount || 0).toFixed(2)}
                </span>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
                <span className="block text-[10px] font-bold text-amber-600 uppercase">
                  Remaining
                </span>
                <span className="text-sm font-black text-amber-700">
                  ${Number(purchase.remainingAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="flex border-b border-slate-100 px-6 pt-3 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('cash')}
              className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'cash'
                  ? 'border-[#0B4EA2] text-[#0B4EA2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Cash / Bank
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('advance')}
              className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'advance'
                  ? 'border-[#0B4EA2] text-[#0B4EA2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Advance Deduction
              {supplierAdvances.length > 0 && (
                <span className="ml-1 rounded-full bg-blue-100 text-[#0B4EA2] px-1.5 py-0.2 text-[10px]">
                  {supplierAdvances.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'plan'
                  ? 'border-[#0B4EA2] text-[#0B4EA2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Installment Plan
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mixed')}
              className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'mixed'
                  ? 'border-[#0B4EA2] text-[#0B4EA2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="h-4 w-4" />
              Mixed
            </button>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 1. Cash Payment Form */}
            {activeTab === 'cash' && (
              <form id="cash-payment-form" onSubmit={handleCashSubmit} className="space-y-4">
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
                      max={purchase.remainingAmount}
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-base font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Outstanding: ${Number(purchase.remainingAmount).toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => setCashAmount(purchase.remainingAmount.toString())}
                      className="text-[#0B4EA2] font-semibold hover:underline"
                    >
                      Pay Full Remaining
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={cashMethod}
                      onChange={(e) => setCashMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
                    >
                      <option value="Cash">Cash</option>
                      <option value="BankTransfer">Bank Transfer</option>
                      <option value="Check">Check / Cheque</option>
                      <option value="CreditCard">Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Reference / Receipt #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. REC-9921"
                      value={cashRef}
                      onChange={(e) => setCashRef(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional remarks..."
                    value={cashNotes}
                    onChange={(e) => setCashNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none resize-none"
                  />
                </div>
              </form>
            )}

            {/* 2. Advance Deduction Form */}
            {activeTab === 'advance' && (
              <form id="advance-payment-form" onSubmit={handleAdvanceSubmit} className="space-y-4">
                {loadingAdvances ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0B4EA2]/20 border-t-[#0B4EA2] mx-auto mb-2" />
                    Loading vendor active advances...
                  </div>
                ) : supplierAdvances.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs space-y-2">
                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">No active advances available</p>
                    <p className="text-slate-400 max-w-xs mx-auto">
                      This vendor does not have any active cash advances with an unconsumed balance.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Select Vendor Advance <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedAdvanceId}
                        onChange={(e) =>
                          setSelectedAdvanceId(e.target.value ? Number(e.target.value) : '')
                        }
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 font-medium"
                      >
                        {supplierAdvances.map((adv) => (
                          <option key={adv.id} value={adv.id}>
                            #ADV-{adv.id} &mdash; Available: ${adv.remainingAmount.toFixed(2)} (Total: ${adv.amount.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedAdvance && (
                      <div className="rounded-xl border border-blue-100 bg-[#EEF4FF]/50 p-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Advance Available Balance:</span>
                          <span className="font-bold text-[#0B4EA2]">
                            ${selectedAdvance.remainingAmount.toFixed(2)}
                          </span>
                        </div>
                        {selectedAdvance.notes && (
                          <div className="text-[11px] text-slate-400 italic">
                            Advance Note: {selectedAdvance.notes}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Deduction Amount ($) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          max={
                            selectedAdvance
                              ? Math.min(selectedAdvance.remainingAmount, purchase.remainingAmount)
                              : purchase.remainingAmount
                          }
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-base font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Reference #
                        </label>
                        <input
                          type="text"
                          placeholder="Optional"
                          value={advanceRef}
                          onChange={(e) => setAdvanceRef(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                          Notes
                        </label>
                        <input
                          type="text"
                          placeholder="Remarks..."
                          value={advanceNotes}
                          onChange={(e) => setAdvanceNotes(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* 3. Installment Plan Form */}
            {activeTab === 'plan' && (
              <form id="plan-payment-form" onSubmit={handlePlanSubmit} className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-[#EEF4FF]/40 p-3 text-xs text-[#0B4EA2] leading-relaxed">
                  Configure an installment plan for this invoice. You can finance all or part of the remaining balance. Down payment is deducted upfront, and the remainder is divided evenly across installments.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Total Plan Amount ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={planTotalAmount}
                      onChange={(e) => setPlanTotalAmount(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Down Payment ($)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Number of Installments <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={numberOfInstallments}
                      onChange={(e) => setNumberOfInstallments(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                    >
                      {[2, 3, 4, 6, 9, 12, 18, 24].map((n) => (
                        <option key={n} value={n}>
                          {n} Installments ({n} Months)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      First Due / Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Plan Notes / Agreement
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Approved 3-month vendor financing agreement..."
                    value={planNotes}
                    onChange={(e) => setPlanNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                  />
                </div>

                {/* Live Installment Schedule Preview */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">
                      Schedule Breakdown Preview
                    </span>
                    <span className="font-bold text-[#0B4EA2]">
                      ${planPreview.installmentVal.toFixed(2)} / installment
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto text-xs">
                    {planPreview.schedule.map((itm) => (
                      <div key={itm.installmentNumber} className="flex justify-between py-1.5">
                        <span className="text-slate-500">
                          Installment #{itm.installmentNumber} &mdash; Due {itm.dueDate}
                        </span>
                        <span className="font-semibold text-slate-800">
                          ${itm.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* 4. Mixed Payment Form */}
            {activeTab === 'mixed' && (
              <form id="mixed-payment-form" onSubmit={handleMixedSubmit} className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600">
                  Combine cash payment and advance deduction in a single transaction.
                </div>

                {/* Cash Portion */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Cash Amount ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={mixedCashAmount}
                    onChange={(e) => setMixedCashAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none"
                  />
                </div>

                {/* Advance Portion */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Advance Deduction ($)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={mixedAdvanceAmount}
                      onChange={(e) => setMixedAdvanceAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-[#0B4EA2] focus:outline-none"
                    />
                  </div>

                  {parseFloat(mixedAdvanceAmount) > 0 && supplierAdvances.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Select Advance to deduct from
                      </label>
                      <select
                        value={mixedAdvanceId}
                        onChange={(e) =>
                          setMixedAdvanceId(e.target.value ? Number(e.target.value) : '')
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#0B4EA2] focus:outline-none"
                      >
                        {supplierAdvances.map((adv) => (
                          <option key={adv.id} value={adv.id}>
                            #ADV-{adv.id} (Available: ${adv.remainingAmount.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Total Combined Calculator */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800">Total Payment Applied:</span>
                  <span className="text-base font-black text-emerald-800">
                    $
                    {(
                      (parseFloat(mixedCashAmount) || 0) + (parseFloat(mixedAdvanceAmount) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </form>
            )}
          </div>

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

            {activeTab === 'cash' && (
              <button
                type="submit"
                form="cash-payment-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span>Processing Cash...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Record Cash Payment</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'advance' && (
              <button
                type="submit"
                form="advance-payment-form"
                disabled={isSubmitting || supplierAdvances.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span>Deducting Advance...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    <span>Deduct from Advance</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'plan' && (
              <button
                type="submit"
                form="plan-payment-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span>Creating Plan...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>Create Installment Plan</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'mixed' && (
              <button
                type="submit"
                form="mixed-payment-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#093d80] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4" />
                    <span>Process Mixed Payment</span>
                  </>
                )}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
