import { Calendar, ChevronDown, Loader2 } from 'lucide-react'
import { useMemo, useRef } from 'react'

import type { PmsReservationDetails } from '../../../../../models/PmsReservation'

type Props = {
  details: PmsReservationDetails | null
  fallbackGuestName: string
  fallbackRoomNumber: string | null
  fallbackCheckInDate: string
  fallbackCheckOutDate: string
  newCheckoutDate: string
  onChangeNewCheckoutDate: (value: string) => void
  manualNightlyRate: string
  onChangeManualNightlyRate: (value: string) => void
  loading: boolean
  error: string | null
  evaluating: boolean
  evaluationError: string | null
  onCancel: () => void
  onEvaluate: () => void
}

function isoDateOnly(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}

function parseDate(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDate(value?: string | null) {
  const d = parseDate(value)
  if (!d) return 'N/A'
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function daysBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return 0
  const startDate = parseDate(`${isoDateOnly(start)}T00:00:00`)
  const endDate = parseDate(`${isoDateOnly(end)}T00:00:00`)
  if (!startDate || !endDate) return 0
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000))
}

function openDatePicker(input: HTMLInputElement | null) {
  if (!input) return
  try {
    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }
  } catch {
    // Browser can reject showPicker without user activation; focus keeps the input usable.
  }
  input.focus()
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase text-slate-400">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-slate-800">{value || 'N/A'}</div>
    </div>
  )
}

export function ExtendStayStep1({
  details,
  fallbackGuestName,
  fallbackRoomNumber,
  fallbackCheckInDate,
  fallbackCheckOutDate,
  newCheckoutDate,
  onChangeNewCheckoutDate,
  manualNightlyRate,
  onChangeManualNightlyRate,
  loading,
  error,
  evaluating,
  evaluationError,
  onCancel,
  onEvaluate,
}: Props) {
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const primaryRoom = details?.reservationRooms?.[0]
  const currentCheckIn = isoDateOnly(primaryRoom?.checkInDate || details?.checkInDate || fallbackCheckInDate)
  const currentCheckout = isoDateOnly(primaryRoom?.checkOutDate || details?.checkOutDate || fallbackCheckOutDate)
  const guestName = details?.guest?.fullName || details?.guestName || fallbackGuestName
  const roomNumber = details?.roomNumber || fallbackRoomNumber
  const extraNights = useMemo(() => daysBetween(currentCheckout, newCheckoutDate), [currentCheckout, newCheckoutDate])
  const rate = Number(manualNightlyRate)
  const canEvaluate = Boolean(newCheckoutDate) && extraNights > 0 && Number.isFinite(rate) && rate > 0 && !loading && !evaluating

  return (
    <>
      <div className="bg-[#0B4EA2] px-8 py-5">
        <div className="text-xl font-semibold text-white">Extend Stay</div>
        <div className="mt-1 text-sm text-white/90">{guestName || 'Selected reservation'}{roomNumber ? ` - Room ${roomNumber}` : ''}</div>
      </div>

      <div className="space-y-6 bg-slate-50 p-8">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading reservation details...</div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 text-sm font-bold text-slate-800">Reservation</div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
            <Field label="Guest" value={guestName} />
            <Field label="Room" value={roomNumber || 'N/A'} />
            <Field label="Check-in" value={formatDate(currentCheckIn)} />
            <Field label="Current Check-out" value={formatDate(currentCheckout)} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Calendar className="h-5 w-5 text-[#0B4EA2]" />
            Extension Request
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold text-slate-500">New Check-out Date</label>
              <button
                type="button"
                className="mt-2 flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-700"
                onClick={() => openDatePicker(dateInputRef.current)}
                disabled={loading || evaluating}
              >
                <span>{newCheckoutDate ? formatDate(newCheckoutDate) : 'Select date'}</span>
                <ChevronDown className="h-5 w-5 text-slate-500" />
                <input
                  ref={dateInputRef}
                  type="date"
                  className="sr-only"
                  value={newCheckoutDate}
                  min={currentCheckout || undefined}
                  onChange={(event) => onChangeNewCheckoutDate(event.target.value)}
                />
              </button>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-slate-500">Manual Nightly Rate</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
                value={manualNightlyRate}
                onChange={(event) => onChangeManualNightlyRate(event.target.value)}
                disabled={loading || evaluating}
                placeholder="0.00"
              />
            </div>

          </div>

          <div className="mt-5 rounded-xl border border-[#BBD3FF] bg-[#EEF6FF] p-4">
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <Field label="Additional Nights" value={String(extraNights)} />
              <Field label="Rate must be greater than" value="0" />
              <Field label="Evaluation Time" value="Current time when continued" />
            </div>
          </div>
        </div>

        {evaluationError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{evaluationError}</div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5">
        <button
          type="button"
          className="h-11 rounded-xl border border-slate-200 px-8 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          onClick={onCancel}
          disabled={evaluating}
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#093d81] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canEvaluate}
          onClick={onEvaluate}
        >
          {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {evaluating ? 'Evaluating...' : 'Evaluate Extend Stay'}
        </button>
      </div>
    </>
  )
}
