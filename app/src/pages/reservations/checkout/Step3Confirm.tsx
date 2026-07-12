import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'
import type { EvaluateLateCheckoutResponse, PmsReservation, PmsReservationDetails, PmsReservationFolio } from '../../../models/PmsReservation'
import type { CheckoutPaymentData } from './CheckOutProcessPopup'
import { CheckCircle2 } from 'lucide-react'

type Props = {
  reservation: PmsReservation
  details: PmsReservationDetails | null
  folio: PmsReservationFolio | null
  guestCount: number
  paymentData: CheckoutPaymentData
  completing: boolean
  requiredAmount?: number
  requiredAmountLabel?: string
  completionLabel?: string
  lateCheckoutEvaluation?: EvaluateLateCheckoutResponse | null
  onNext: () => void
  onBack: () => void
}

function formatDate(iso?: string) {
  if (!iso) return '-----'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US')
}

export function Step3Confirm({ reservation, details, folio, guestCount, paymentData, completing, requiredAmount, requiredAmountLabel, completionLabel, lateCheckoutEvaluation, onNext, onBack }: Props) {
  const isLateCheckout = Boolean(lateCheckoutEvaluation)
  const currency = lateCheckoutEvaluation?.currency || folio?.currency || details?.finance?.currency || reservation.currency || 'EUR'
  const roomCharge = folio?.totals?.roomChargesTotal ?? folio?.totalRoomRate ?? details?.finance?.baseRoomAmount ?? reservation.totalAmount
  const paidAmount = folio?.paidAmount ?? details?.finance?.paidAmount ?? reservation.paidAmount
  const tax = folio?.totals?.taxTotal ?? details?.finance?.taxAmount ?? 0
  const serviceCharges = folio?.totals?.serviceChargesTotal ?? details?.finance?.servicesTotal ?? 0
  const mealCharges = folio?.totals?.mealChargesTotal ?? details?.finance?.mealPlansTotal ?? 0
  const packageCharges = folio?.totals?.packageChargesTotal ?? 0
  const manualCharges = folio?.totals?.manualChargesTotal ?? 0
  const discounts = folio?.totalDiscounts ?? details?.finance?.discountAmount ?? 0
  const remainingBalance = folio?.remainingBalance ?? details?.finance?.remainingBalance ?? reservation.remainingAmount ?? 0
  const grandTotal = folio?.grandTotal ?? details?.finance?.grandTotal ?? reservation.totalAmount
  const lateChargeBeforeTax = lateCheckoutEvaluation?.chargeBeforeTax ?? 0
  const lateTax = lateCheckoutEvaluation?.taxAmount ?? 0
  const lateChargeAfterTax = lateCheckoutEvaluation?.chargeAfterTax ?? Math.max(0, lateChargeBeforeTax + lateTax)
  const lateOutstandingBalance = lateCheckoutEvaluation?.existingOutstandingBalance ?? 0
  const lateGrandTotal = lateCheckoutEvaluation?.estimatedRemainingBalanceAfterPosting ?? Math.max(0, lateOutstandingBalance + lateChargeAfterTax)
  const effectiveRemainingBalance = isLateCheckout ? lateGrandTotal : remainingBalance
  const effectiveGrandTotal = isLateCheckout ? lateGrandTotal : grandTotal
  const checkoutAmount = Number(paymentData.amount) || 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-800">Confirm Check-Out</h3>
        <p className="text-[12px] text-slate-500">Please review all details before completing the check-out</p>
      </div>

      {/* Guest Details Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Guest Details</h4>
        <div className="grid grid-cols-2 gap-y-4">
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Guest Name</div>
            <div className="text-[13px] font-semibold text-slate-800">{folio?.guestName || details?.guest?.fullName || reservation.guestName}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Room Number</div>
            <div className="text-[13px] font-semibold text-slate-800">{folio?.roomNumber || reservation.roomNumber || '-----'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Check-in Date</div>
            <div className="text-[13px] font-semibold text-slate-800">{formatDate(folio?.checkInDate || reservation.checkInDate)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Check-out Date</div>
            <div className="text-[13px] font-semibold text-slate-800">{formatDate(folio?.checkOutDate || reservation.checkOutDate)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Guests</div>
            <div className="text-[13px] font-semibold text-slate-800">{guestCount}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Payment Status</div>
            <div className="text-[13px] font-semibold text-slate-800">{folio?.paymentStatus || details?.finance?.paymentStatus || '-----'}</div>
          </div>
        </div>
      </div>

      {/* Payment Summary Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Payment Summary</h4>
        <div className="space-y-4">
          <SummaryRow label="Number of Night :" value={`${folio?.numberOfNights || '-----'}`} amount={isLateCheckout ? formatMoney(lateChargeBeforeTax, currency) : formatMoney(roomCharge, currency)} />
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
              <SummaryRow label="Amount Paid" amount={formatMoney(paidAmount, currency)} amountClassName="text-emerald-500" />
            </>
          )}
          <SummaryRow label="Remaining Balance" amount={formatMoney(effectiveRemainingBalance, currency)} amountClassName={effectiveRemainingBalance > 0 ? 'text-orange-600' : 'text-emerald-600'} />
          {requiredAmount !== undefined ? (
            <SummaryRow label={requiredAmountLabel || 'Amount Due'} amount={formatMoney(requiredAmount, currency)} amountClassName={requiredAmount > 0 ? 'text-orange-600' : 'text-emerald-600'} />
          ) : null}
          
          <div className="my-4 h-px bg-slate-100" />

          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-800">Grand Total</span>
            <span className="text-sm font-extrabold text-slate-800">{formatMoney(effectiveGrandTotal, currency)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-800">Amount Paid at Check-out</span>
            <span className="text-sm font-extrabold text-slate-800">{formatMoney(checkoutAmount, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium uppercase tracking-wider">Payment Method</span>
            <span className="font-bold text-slate-700">{paymentData.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium uppercase tracking-wider">Method</span>
            <span className="font-bold text-slate-700">{paymentData.method}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium uppercase tracking-wider">Payment Type</span>
            <span className="font-bold text-slate-700">{paymentData.paymentType}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium uppercase tracking-wider">Currency</span>
            <span className="font-bold text-slate-700">{paymentData.currency}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium uppercase tracking-wider">Payment Date</span>
            <span className="font-bold text-slate-700">{paymentData.paymentDate || '-----'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium uppercase tracking-wider">Reference</span>
            <span className="font-bold text-slate-700">{paymentData.paymentReference || '-----'}</span>
          </div>
        </div>
      </div>

      {/* Room Inspection */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Room Inspection</h4>
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
          Room in Good Condition
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-4">
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
          disabled={completing}
          className="flex h-12 items-center gap-2 rounded-xl bg-[#0B4EA2] px-10 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#093d81] disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" />
          {completing ? 'Completing...' : completionLabel || 'Complete Check-Out'}
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
    <div className="flex items-start justify-between text-[12px]">
      <div className="space-y-0.5">
        <div className={["font-medium text-slate-500", labelClassName].join(' ')}>{label}</div>
        {subtext && <div className="text-[10px] text-slate-400">{subtext}</div>}
      </div>
      <div className="flex items-center gap-8">
        {value && <span className="font-bold text-slate-800">{value}</span>}
        {amount && <span className={["font-bold text-slate-800", amountClassName].join(' ')}>{amount}</span>}
      </div>
    </div>
  )
}
