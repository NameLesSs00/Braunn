import { useEffect, useState, useMemo } from 'react'
import { getPmsReservationById } from '../../../shared/apis/PmsReservation'
import type { PmsReservation, PmsReservationDetails } from '../../../models/PmsReservation'
import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'
import { ChevronDown, Plus } from 'lucide-react'

type Props = {
  reservation: PmsReservation
  onNext: () => void
  onBack: () => void
  onPaymentChange: (data: { method?: string; amount?: string }) => void
}

function calcNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diff)
}

export function Step2Payment({ reservation, onNext, onBack, onPaymentChange }: Props) {
  const [details, setDetails] = useState<PmsReservationDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPmsReservationById(reservation.id)
      .then((res) => {
        setDetails(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [reservation.id])

  const currency = details?.finance?.currency || '$'

  // Mock data for display based on the image
  const nights = calcNights(reservation.checkInDate, reservation.checkOutDate)
  const roomCharge = reservation.totalAmount || 480
  const depositPaid = reservation.paidAmount || 120
  const tax = 20
  const lateFee = 0
  const additionalCharges = 0
  
  const remainingBalance = roomCharge - depositPaid
  const totalAmount = remainingBalance + tax + lateFee + additionalCharges

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {/* Summary Rows */}
          <SummaryRow label="Number of Night :" value={`${nights}`} amount={formatMoney(roomCharge, currency)} />
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
            <span className="text-sm font-bold text-slate-800">Total Amount:</span>
            <span className="text-lg font-bold text-slate-800">{formatMoney(totalAmount, currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Payment Method *</label>
          <div className="relative">
            <select 
              className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
              onChange={(e) => onPaymentChange({ method: e.target.value })}
            >
              <option value="">Select Payment</option>
              <option value="cash">Cash</option>
              <option value="card">Credit Card</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Paid amount</label>
          <input 
            type="text" 
            placeholder="Enter amount" 
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:bg-white"
            onChange={(e) => onPaymentChange({ amount: e.target.value })}
          />
          <div className="text-[11px] font-medium text-slate-400">Remaining: {formatMoney(totalAmount, currency)}</div>
        </div>
      </div>

      <button className="flex items-center gap-2 text-sm font-bold text-[#0B4EA2] hover:underline">
        <Plus className="h-4 w-4" />
        Add Other Payment Method
      </button>

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
          className="h-12 rounded-xl bg-[#0B4EA2] px-12 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#093d81]"
        >
          Proceed to confirmation
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
