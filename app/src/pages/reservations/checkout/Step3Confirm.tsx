import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'
import type { PmsReservation, PmsReservationDetails } from '../../../models/PmsReservation'
import { CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getPmsReservationById } from '../../../shared/apis/PmsReservation'

type Props = {
  reservation: PmsReservation
  paymentData: { method: string; amount: string }
  onNext: () => void
  onBack: () => void
}

function formatDate(iso?: string) {
  if (!iso) return '-----'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US')
}

export function Step3Confirm({ reservation, paymentData, onNext, onBack }: Props) {
  const [details, setDetails] = useState<PmsReservationDetails | null>(null)

  useEffect(() => {
    getPmsReservationById(reservation.id).then((res) => setDetails(res)).catch(() => {})
  }, [reservation.id])

  const currency = details?.finance?.currency || '$'

  const roomCharge = reservation.totalAmount || 480
  const depositPaid = reservation.paidAmount || 120
  const tax = 20
  const lateFee = 0
  const additionalCharges = 0
  const remainingBalance = roomCharge - depositPaid
  const totalAmount = remainingBalance + tax + lateFee + additionalCharges

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
            <div className="text-[13px] font-semibold text-slate-800">{reservation.guestName}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Room Number</div>
            <div className="text-[13px] font-semibold text-slate-800">{reservation.roomNumber}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Check-in Date</div>
            <div className="text-[13px] font-semibold text-slate-800">{formatDate(reservation.checkInDate)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500">Check-out Date</div>
            <div className="text-[13px] font-semibold text-slate-800">{formatDate(reservation.checkOutDate)}</div>
          </div>
        </div>
      </div>

      {/* Payment Summary Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Payment Summary</h4>
        <div className="space-y-4">
          <SummaryRow label="Number of Night :" value="1" amount={formatMoney(roomCharge, currency)} />
          <SummaryRow label="Number of Guest" value="1" />
          <SummaryRow label="Adult :" value="1" amount={formatMoney(roomCharge, currency)} />
          
          <div className="my-4 h-px bg-slate-100" />
          
          <SummaryRow label="Total Room Charges" amount={formatMoney(roomCharge, currency)} />
          <SummaryRow label="Deposit Paid" amount={formatMoney(depositPaid, currency)} amountClassName="text-emerald-500" />
          <SummaryRow label="Remaining Balance" amount={formatMoney(remainingBalance, currency)} />
          <SummaryRow label="Late Check-out Fee" amount={formatMoney(lateFee, currency)} labelClassName="text-orange-600" amountClassName="text-orange-600" />
          <SummaryRow label="Additional Charges" amount={formatMoney(additionalCharges, currency)} subtext="No services" />
          <SummaryRow label="Taxes" amount={formatMoney(tax, currency)} />
          
          <div className="my-4 h-px bg-slate-100" />
          
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-800">Amount Paid at Check-out</span>
            <span className="text-sm font-extrabold text-slate-800">{formatMoney(totalAmount, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium uppercase tracking-wider">Payment Method</span>
            <span className="font-bold text-slate-700">{paymentData.method || 'cash'}</span>
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

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 px-5 py-4 text-[12px] text-blue-700">
        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-blue-700 font-bold">i</div>
        <span>After completing check-out, the room will be marked as "Cleaning" and the reservation will be marked as "Checked Out".</span>
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
          className="flex h-12 items-center gap-2 rounded-xl bg-[#0B4EA2] px-10 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#093d81]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Complete Check-Out
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
