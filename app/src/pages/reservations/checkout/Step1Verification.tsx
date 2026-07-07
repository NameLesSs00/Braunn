import { useEffect, useState } from 'react'
import { InfoRow } from '../../../widgets/reservations/CheckInProcessModal/InfoRow'
import { Step4Card } from '../../../widgets/reservations/NewReservationModal/steps/step4/Step4Card'
import { getPmsReservationById } from '../../../shared/apis/PmsReservation'
import type { PmsReservation, PmsReservationDetails } from '../../../models/PmsReservation'

type Props = {
  reservation: PmsReservation
  onNext: () => void
  onBack: () => void
}

function calcNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 1
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(1, diff)
}

function formatDate(iso?: string) {
  if (!iso) return '-----'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US')
}

export function Step1Verification({ reservation, onNext, onBack }: Props) {
  const [details, setDetails] = useState<PmsReservationDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    getPmsReservationById(reservation.id, controller.signal)
      .then(setDetails)
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === 'AbortError') return
        // non-abort errors: just leave details null, component will show what it can
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reservation.id])

  const nights = calcNights(reservation.checkInDate, reservation.checkOutDate)
  
  // Late checkout check (mock logic: if today > scheduled checkout date)
  const today = new Date().toISOString().split('T')[0]
  const isLate = reservation.checkOutDate < today

  return (
    <div className="space-y-8">
      {/* Verification Notice */}
      <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-6 py-4 text-sm text-blue-700">
        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-700 font-bold">i</div>
        <span>Please verify all details before proceeding with check-out</span>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-800">Verify Guest & Reservation Details</h3>
        
        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-slate-100 md:grid-cols-2">
          {/* Guest Information */}
          <div className="border-r border-slate-100 p-6">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Guest Information</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">Name</div>
                <div className="text-[13px] font-semibold text-slate-800">{reservation.guestName}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">ID Number</div>
                <div className="text-[13px] font-semibold text-slate-800">{details?.guest.idNumber || '-----'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">Phone</div>
                <div className="text-[13px] font-semibold text-slate-800">{details?.guest.phone || '-----'}</div>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div className="p-6">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stay Information</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">Room Number</div>
                <div className="text-[13px] font-semibold text-slate-800">{reservation.roomNumber} ({reservation.roomTypeName})</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">Check-in Date</div>
                <div className="text-[13px] font-semibold text-slate-800">{formatDate(reservation.checkInDate)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">Scheduled Check-out</div>
                <div className="text-[13px] font-semibold text-slate-800">{formatDate(reservation.checkOutDate)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">Total Nights</div>
                <div className="text-[13px] font-semibold text-slate-800">{nights} nights</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Late Checkout Warning */}
      {isLate && (
        <div className="flex flex-col gap-2 rounded-xl border border-orange-100 bg-orange-50 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-orange-800">
            <span className="text-lg">⚠</span>
            Late Check-out Detected:
          </div>
          <p className="text-[13px] text-orange-700">
            Guest is checking out after the scheduled date. A late checkout fee of $60.00 will be applied.
          </p>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-xl border border-[#0B4EA2] px-16 text-sm font-semibold text-[#0B4EA2]"
        >
          back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="h-12 rounded-xl bg-[#0B4EA2] px-12 text-sm font-semibold text-white shadow-lg shadow-blue-900/20"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
