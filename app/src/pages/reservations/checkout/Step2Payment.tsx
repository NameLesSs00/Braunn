import type { EvaluateLateCheckoutResponse, PmsReservation, PmsReservationDetails, PmsReservationFolio } from '../../../models/PmsReservation'
import type { CheckoutPaymentData } from './CheckOutProcessPopup'
import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'
import { ChevronDown } from 'lucide-react'

type Props = {
  reservation: PmsReservation
  details: PmsReservationDetails | null
  folio: PmsReservationFolio | null
  guestCount: number
  paymentData: CheckoutPaymentData
  paymentError: string | null
  submitting: boolean
  requiredAmount?: number
  requiredAmountLabel?: string
  lateCheckoutEvaluation?: EvaluateLateCheckoutResponse | null
  onNext: () => void
  onBack: () => void
  onPaymentChange: (data: Partial<CheckoutPaymentData>) => void
}

function calcNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diff)
}

export function Step2Payment({ reservation, details, folio, guestCount, paymentData, paymentError, submitting, requiredAmount, requiredAmountLabel, lateCheckoutEvaluation, onNext, onBack, onPaymentChange }: Props) {
  const isLateCheckout = Boolean(lateCheckoutEvaluation)
  const currency = lateCheckoutEvaluation?.currency || folio?.currency || details?.finance?.currency || reservation.currency || 'EUR'
  const nights = folio?.numberOfNights || calcNights(folio?.checkInDate || reservation.checkInDate, folio?.checkOutDate || reservation.checkOutDate)
  const roomCharge = folio?.totals?.roomChargesTotal ?? folio?.totalRoomRate ?? details?.finance?.baseRoomAmount ?? reservation.totalAmount
  const depositPaid = folio?.paidAmount ?? details?.finance?.paidAmount ?? reservation.paidAmount
  const tax = folio?.totals?.taxTotal ?? details?.finance?.taxAmount ?? 0
  const serviceCharges = folio?.totals?.serviceChargesTotal ?? details?.finance?.servicesTotal ?? 0
  const mealCharges = folio?.totals?.mealChargesTotal ?? details?.finance?.mealPlansTotal ?? 0
  const packageCharges = folio?.totals?.packageChargesTotal ?? 0
  const manualCharges = folio?.totals?.manualChargesTotal ?? 0
  const discounts = folio?.totalDiscounts ?? details?.finance?.discountAmount ?? 0
  const remainingBalance = folio?.remainingBalance ?? details?.finance?.remainingBalance ?? reservation.remainingAmount ?? Math.max(0, roomCharge + serviceCharges + mealCharges + packageCharges + manualCharges + tax - discounts - depositPaid)
  const grandTotal = folio?.grandTotal ?? details?.finance?.grandTotal ?? reservation.totalAmount
  const lateChargeBeforeTax = lateCheckoutEvaluation?.chargeBeforeTax ?? 0
  const lateTax = lateCheckoutEvaluation?.taxAmount ?? 0
  const lateChargeAfterTax = lateCheckoutEvaluation?.chargeAfterTax ?? Math.max(0, lateChargeBeforeTax + lateTax)
  const lateOutstandingBalance = lateCheckoutEvaluation?.existingOutstandingBalance ?? 0
  const lateGrandTotal = lateCheckoutEvaluation?.estimatedRemainingBalanceAfterPosting ?? Math.max(0, lateOutstandingBalance + lateChargeAfterTax)
  const effectiveRemainingBalance = isLateCheckout ? lateGrandTotal : remainingBalance
  const effectiveGrandTotal = isLateCheckout ? lateGrandTotal : grandTotal
  const amountDue = requiredAmount ?? remainingBalance
  const hasBalance = amountDue > 0

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {/* Summary Rows */}
          <SummaryRow label="Number of Night :" value={`${nights}`} amount={isLateCheckout ? formatMoney(lateChargeBeforeTax, currency) : formatMoney(roomCharge, currency)} />
          <SummaryRow label="Number of Guest" value={`${guestCount}`} />
          <SummaryRow label="Room Type" value={lateCheckoutEvaluation?.roomTypeName || folio?.roomTypeName || reservation.roomTypeName || '-----'} />
          
          <div className="my-4 h-px bg-slate-100" />
          
          {isLateCheckout ? (
            <>
              <SummaryRow label="Late Check-out Charges" amount={formatMoney(lateChargeBeforeTax, currency)} />
              <SummaryRow label="Taxes" amount={formatMoney(lateTax, currency)} />
              <SummaryRow label="Discounts" amount={`${lateCheckoutEvaluation?.percentage ?? 0}%`} amountClassName="text-emerald-500" />
              <SummaryRow label="Charge After Tax" amount={formatMoney(lateChargeAfterTax, currency)} />
              <SummaryRow label="Existing Outstanding Balance" amount={formatMoney(lateOutstandingBalance, currency)} />
            </>
          ) : (
            <>
              <SummaryRow label="Total Room Charges" amount={formatMoney(roomCharge, currency)} />
              <SummaryRow label="Service Charges" amount={formatMoney(serviceCharges, currency)} subtext={folio?.services?.length ? `${folio.services.length} service(s)` : 'No services'} />
              <SummaryRow label="Meal Charges" amount={formatMoney(mealCharges, currency)} subtext={folio?.mealPlans?.length ? `${folio.mealPlans.length} meal plan(s)` : 'No meal plans'} />
              <SummaryRow label="Package Charges" amount={formatMoney(packageCharges, currency)} />
              <SummaryRow label="Manual Charges" amount={formatMoney(manualCharges, currency)} />
              <SummaryRow label="Taxes" amount={formatMoney(tax, currency)} />
              <SummaryRow label="Discounts" amount={`-${formatMoney(discounts, currency)}`} amountClassName="text-emerald-500" />
              <SummaryRow label="Amount Paid" amount={formatMoney(depositPaid, currency)} amountClassName="text-emerald-500" />
            </>
          )}
          <SummaryRow label="Remaining Balance" amount={formatMoney(effectiveRemainingBalance, currency)} amountClassName={effectiveRemainingBalance > 0 ? 'text-orange-600' : 'text-emerald-600'} />
          {requiredAmount !== undefined ? (
            <SummaryRow label={requiredAmountLabel || 'Amount Due'} amount={formatMoney(requiredAmount, currency)} amountClassName={requiredAmount > 0 ? 'text-orange-600' : 'text-emerald-600'} />
          ) : null}
          
          <div className="my-4 h-px bg-slate-100" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Grand Total:</span>
            <span className="text-lg font-bold text-slate-800">{formatMoney(effectiveGrandTotal, currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      {paymentError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {paymentError}
        </div>
      )}

      {!hasBalance ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-5">
          <div className="text-sm font-bold text-emerald-700">Fully Paid</div>
          <div className="mt-1 text-[13px] text-emerald-700">
            This reservation has no remaining balance. You can continue to confirmation.
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Amount *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter amount"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
            value={paymentData.amount}
            onChange={(e) => onPaymentChange({ amount: e.target.value })}
            disabled={!hasBalance || submitting}
          />
          <div className="text-[11px] font-medium text-slate-400">Required: {formatMoney(amountDue, currency)}</div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Currency</label>
          <div className="relative">
            <select
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
              value={paymentData.currency}
              onChange={(e) => onPaymentChange({ currency: e.target.value })}
              disabled={!hasBalance || submitting}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EGP">EGP</option>
              <option value="SAR">SAR</option>
              <option value="AED">AED</option>
              <option value="JOD">JOD</option>
              <option value="KWD">KWD</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Payment Method *</label>
          <div className="relative">
            <select 
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
              value={paymentData.paymentMethod}
              onChange={(e) => onPaymentChange({ paymentMethod: e.target.value as CheckoutPaymentData['paymentMethod'], method: e.target.value as CheckoutPaymentData['method'] })}
              disabled={!hasBalance || submitting}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Payment Type</label>
          <div className="relative">
            <select
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
              value={paymentData.paymentType}
              onChange={(e) => onPaymentChange({ paymentType: e.target.value as CheckoutPaymentData['paymentType'] })}
              disabled={!hasBalance || submitting}
            >
              <option value="Deposit">Deposit</option>
              <option value="Payment">Payment</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Method</label>
          <div className="relative">
            <select
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
              value={paymentData.method}
              onChange={(e) => onPaymentChange({ method: e.target.value as CheckoutPaymentData['method'] })}
              disabled={!hasBalance || submitting}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Payment Date</label>
          <input
            type="datetime-local"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
            value={paymentData.paymentDate}
            onChange={(e) => onPaymentChange({ paymentDate: e.target.value })}
            disabled={!hasBalance || submitting}
          />
        </div>

        <div className="space-y-2 lg:col-span-3">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Payment Reference</label>
          <input
            type="text"
            placeholder="Optional reference"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
            value={paymentData.paymentReference}
            onChange={(e) => onPaymentChange({ paymentReference: e.target.value })}
            disabled={!hasBalance || submitting}
          />
        </div>
      </div>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-xl border border-[#0B4EA2] px-16 text-sm font-semibold text-[#0B4EA2] transition-all hover:bg-blue-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="h-12 rounded-xl bg-[#0B4EA2] px-12 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#093d81] disabled:opacity-60"
        >
          {submitting ? 'Processing payment...' : hasBalance ? 'Pay and continue' : 'Proceed to confirmation'}
        </button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, amount, labelClassName, amountClassName, subtext }: { 
  label: string; 
  value?: string; 
  amount?: string; 
  labelClassName?: string;
  amountClassName?: string;
  subtext?: string;
}) {
  return (
    <div className="flex items-start justify-between text-sm">
      <div className="space-y-1">
        <div className={["font-medium text-slate-500", labelClassName].join(' ')}>{label}</div>
        {subtext && <div className="text-[11px] text-slate-400">{subtext}</div>}
      </div>
      <div className="flex items-center gap-12">
        {value && <span className="font-bold text-slate-800">{value}</span>}
        {amount && <span className={["font-bold text-slate-800", amountClassName].join(' ')}>{amount}</span>}
      </div>
    </div>
  )
}
