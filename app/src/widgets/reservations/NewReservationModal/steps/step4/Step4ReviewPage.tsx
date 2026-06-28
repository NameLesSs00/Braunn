import { useEffect, useMemo, useRef, useState } from 'react'

import { IconImage } from '../../../../../shared/ui/IconImage'

import type { ReservationDraft } from '../../../../../features/reservations/draftSlice'

import { InfoRow } from '../../../CheckInProcessModal/InfoRow'
import { Step4Card } from './Step4Card'
import type { Pricing } from '../../../CheckInProcessModal/types'
import { formatMoney } from '../../../CheckInProcessModal/utils'
import { FiLogIn } from "react-icons/fi";
import { LuClock, LuIdCard } from "react-icons/lu";
import { MdMeetingRoom, MdDateRange, MdNotes } from "react-icons/md";

type Props = {
  value: ReservationDraft
  guestsTotal: number
  pricing: Pricing
  nights: number
  onOpenCheckIn: () => void
  onOpenExtendStay: () => void
}

function LabeledInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[12px] text-slate-500">{label}</div>
      {children}
    </div>
  )
}

export function Step4ReviewPage({ value, guestsTotal, pricing, nights, onOpenCheckIn, onOpenExtendStay }: Props) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const actionsRef = useRef<HTMLDivElement | null>(null)

  const pricePerNight = useMemo(() => {
    if (!nights || nights < 1) return pricing.baseTotal
    return pricing.baseTotal / nights
  }, [pricing.baseTotal, nights])

  const todayFormatted = useMemo(() => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), [])

  const fullName = useMemo(() => [value.firstName, value.surName].filter(Boolean).join(' '), [value.firstName, value.surName])

  const summaryRemainingBalance = Math.max(0, pricing.totalAmount - pricing.requiredDeposit)

  useEffect(() => {
    if (!actionsOpen) return

    const onMouseDown = (e: MouseEvent) => {
      const el = actionsRef.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      setActionsOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [actionsOpen])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-[#0B4EA2]">
            Confirmed
          </span>
          <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600">
            DEPOSIT PAID
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-6 text-sm font-semibold text-white"
            onClick={onOpenCheckIn}
          >
            <IconImage src={FiLogIn} alt="" className="h-4 w-4 opacity-95" />
            Check-in Guest
          </button>

          <div ref={actionsRef} className="relative">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700"
              onClick={() => setActionsOpen((prev) => !prev)}
              aria-label="Actions"
            >
              ...
            </button>

            {actionsOpen ? (
              <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  cancel Reservation
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Early Check out
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  + Move Room
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Step4Card title="Guest Information" titleIconBgClassName="bg-blue-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow label="Full Name" value={fullName} />
            <InfoRow label="Phone Number" value={value.phone} />
            <InfoRow label="Email Address" value={value.email} />
            <InfoRow label="ID Number" value={value.idNumber} />
            <InfoRow label="Nationality" value={value.nationality} />
            <InfoRow label="Booking source" value={value.bookingSource} />
          </div>
        </Step4Card>

        <Step4Card title="Room Information" titleIconSrc={MdMeetingRoom} titleIconBgClassName="bg-violet-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoRow label="Room count" value={value.rooms[0]?.roomCount.toString() ?? '—'} />
            <InfoRow label="Room Type" value={value.rooms[0]?.roomType ?? '—'} />
            {(value.rooms[0] as any)?.roomNumbers?.length > 0 && (
              <InfoRow label="Room Numbers" value={(value.rooms[0] as any).roomNumbers.join(', ')} />
            )}
            {value.rateCode && <InfoRow label="Rate code" value={value.rateCode} />}
            <InfoRow label="Maximum Guests" value={guestsTotal ? `${guestsTotal} guests` : ''} />
            <InfoRow label="Price per Night" value={formatMoney(pricePerNight)} />
          </div>

          <div className="mt-4">
            <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[12px] font-semibold text-[#0B4EA2]">
              {value.reservationStatus || 'Reserved'}
            </div>
          </div>
        </Step4Card>
      </div>

      <Step4Card title="Stay Details" titleIconSrc={MdDateRange} titleIconBgClassName="bg-orange-100">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <LabeledInput label="Check-in Date">
            <div className="text-[13px] font-semibold text-slate-800">
              {value.checkInDate || '—'}
            </div>
          </LabeledInput>
          
          <LabeledInput label="Check-out Date">
            <div className="text-[13px] font-semibold text-slate-800">
              {value.checkOutDate || '—'}
            </div>
          </LabeledInput>

          <InfoRow label="Number of Nights" value={value.nights ? `${value.nights} nights` : ''} />
          <InfoRow label="Number of Guests" value={guestsTotal ? `${guestsTotal} guests` : ''} />
        </div>
      </Step4Card>

      <Step4Card title="Payment Information" titleIconBgClassName="bg-emerald-100">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-[12px] text-slate-500">Payment Method</div>
              <div className="text-[13px] font-semibold text-slate-800">{value.paymentMethod || '—'}</div>
            </div>

            <div className="space-y-1 md:text-right">
              <div className="text-[12px] text-slate-500">Payment Status</div>
              <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-600">
                DEPOSIT PAID
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-2 text-[12px] text-slate-600 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <span>Total Amount</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deposit Required (25%)</span>
                <span className="font-semibold text-slate-800">{formatMoney(pricing.requiredDeposit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Amount Paid</span>
                <span className="font-semibold text-emerald-600">{formatMoney(pricing.requiredDeposit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Remaining Balance</span>
                <span className="font-semibold text-orange-600">{formatMoney(summaryRemainingBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      </Step4Card>

      <Step4Card title="Special Requests" titleIconSrc={MdNotes} titleIconBgClassName="bg-violet-100">
        <div className="rounded-xl bg-[#F7F4FF] p-4 text-sm text-slate-700">{value.specialRequests || '—'}</div>
      </Step4Card>

      <Step4Card title="Booking Information" titleIconSrc={LuIdCard} titleIconBgClassName="bg-slate-100">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <InfoRow label="Created On" value={todayFormatted} />
          <InfoRow label="Reservation ID" value="Pending" />
          <InfoRow label="Booking Source" value={value.bookingSource || '—'} />
        </div>
      </Step4Card>

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">

        <div className="flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            className="h-12 rounded-xl border border-[#0B4EA2] px-12 text-sm font-semibold text-[#0B4EA2]"
            onClick={onOpenExtendStay}
          >
            <span className="inline-flex items-center gap-2">
              <IconImage src={LuClock} alt="" className="h-4 w-4 opacity-80" />
              Extend stay
            </span>
          </button>

          <button
            type="button"
            className="h-12 rounded-xl bg-[#0B4EA2] px-12 text-sm font-semibold text-white"
            onClick={onOpenCheckIn}
          >
            <span className="inline-flex items-center gap-2">
             Export Reservation Details
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
