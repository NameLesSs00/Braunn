import { AlertCircle, Calendar, CheckCircle2, ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import type { Room } from '../../../../../models/Room'
import type { ReservationDraft } from '../../../../../widgets/reservations/NewReservationModal/NewReservationModal'

type Props = {
  value: ReservationDraft
  rooms: Room[]
  newCheckOutIso: string
  onChangeNewCheckOutIso: (value: string) => void
  selectedRoomNumber: string
  onChangeSelectedRoomNumber: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

type PaymentMethod = 'charge_to_room' | 'pay_now' | 'charge_to_company'

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function parseIsoDate(value: string) {
  const trimmed = value.trim()
  const [yyyy, mm, dd] = trimmed.split('-')
  if (!yyyy || !mm || !dd) return null
  const y = Number(yyyy)
  const m = Number(mm)
  const d = Number(dd)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  const date = new Date(y, m - 1, d)
  const t = date.getTime()
  return Number.isFinite(t) ? date : null
}

function parseUsDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parts = trimmed.split('/')
  if (parts.length !== 3) return null
  const [mm, dd, yyyy] = parts
  const m = Number(mm)
  const d = Number(dd)
  const y = Number(yyyy)
  if (!Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(y)) return null
  const date = new Date(y, m - 1, d)
  const t = date.getTime()
  return Number.isFinite(t) ? date : null
}

function parseReservationDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.includes('-')) return parseIsoDate(trimmed)
  return parseUsDate(trimmed)
}

function formatHuman(d: Date | null) {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatShort(d: Date | null) {
  if (!d) return ''
  return d.toLocaleDateString('en-US')
}

function toIsoDateInput(d: Date) {
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function daysBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 0
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(0, diff)
}

function titleCase(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export function ExtendStayStep2({
  value,
  rooms,
  newCheckOutIso,
  onChangeNewCheckOutIso,
  selectedRoomNumber,
  onChangeSelectedRoomNumber,
  onCancel,
  onConfirm,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('charge_to_room')
  const [confirmError, setConfirmError] = useState('')

  const checkIn = useMemo(() => parseReservationDate(value.checkInDate), [value.checkInDate])
  const checkOut = useMemo(() => parseReservationDate(value.checkOutDate), [value.checkOutDate])
  const newCheckOut = useMemo(() => (newCheckOutIso ? parseIsoDate(newCheckOutIso) : null), [newCheckOutIso])

  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const extraNights = useMemo(() => daysBetween(checkOut, newCheckOut), [checkOut, newCheckOut])
  const ratePerNight = 120
  const extensionCharge = extraNights * ratePerNight

  const sameRoomAvailable = useMemo(() => {
    if (!newCheckOutIso) return true
    return extraNights < 4
  }, [extraNights, newCheckOutIso])

  const currentBalance = useMemo(() => {
    const paid = Number.parseFloat(value.paidAmount || '0')
    return Number.isFinite(paid) ? Math.max(0, paid) : 0
  }, [value.paidAmount])

  const newTotalBalance = currentBalance + extensionCharge

  const alternativeRooms = useMemo(() => {
    if (!rooms?.length) return []
    return rooms.map((r) => ({
      id: r.id,
      number: `Room ${r.roomNumber}`,
      subtitle: `${titleCase(r.roomTypeName)} • Floor ${r.floor}`,
      price: ratePerNight,
    }))
  }, [rooms])

  const canConfirm = Boolean(newCheckOutIso) && (sameRoomAvailable || Boolean(selectedRoomNumber))

  const handleConfirm = () => {
    if (!newCheckOutIso) {
      setConfirmError('Please select a new check-out date.')
      return
    }

    if (!sameRoomAvailable && !selectedRoomNumber) {
      setConfirmError('Please select an alternative room to continue.')
      return
    }

    setConfirmError('')
    onConfirm()
  }

  return (
    <div className="space-y-8 px-8 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#BBD3FF] bg-[#EEF6FF] px-6 py-5">
              <div className="text-[12px] text-slate-500">Current Check-in Date</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{formatHuman(checkIn)}</div>
            </div>

            <div className="rounded-xl border border-[#BBD3FF] bg-[#EEF6FF] px-6 py-5">
              <div className="text-[12px] text-slate-500">Current Check-out Date</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{formatHuman(checkOut)}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-800">
              <Calendar className="h-5 w-5 text-[#0B4EA2]" />
              New Check-out Date
            </div>

            <button
              type="button"
              className="mt-4 flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-700"
              onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
            >
              <span className="inline-flex items-center gap-3 text-slate-400">
                <Calendar className="h-5 w-5 text-slate-400" />
                {newCheckOut ? formatShort(newCheckOut) : 'MM/DD/YY'}
              </span>

              <ChevronDown className="h-5 w-5 text-slate-500" />

              <input
                ref={dateInputRef}
                type="date"
                className="sr-only"
                value={newCheckOutIso}
                onChange={(e) => onChangeNewCheckOutIso(e.target.value)}
                min={checkOut ? toIsoDateInput(checkOut) : undefined}
              />
            </button>

            <div className="mt-4 rounded-xl border border-[#BBD3FF] bg-[#EEF6FF] p-4">
              <div className="grid grid-cols-1 gap-2 text-[12px] text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#0B4EA2]">Extra Nights</span>
                  <span className="font-semibold text-slate-800">{extraNights}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#0B4EA2]">Rate per Night:</span>
                  <span className="font-semibold text-slate-800">{formatMoney(ratePerNight)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#BBD3FF] pt-2">
                  <span className="font-semibold text-[#0B4EA2]">Total Additional:</span>
                  <span className="font-semibold text-[#0B4EA2]">{formatMoney(extensionCharge)}</span>
                </div>
              </div>
            </div>
          </div>

          {!sameRoomAvailable ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-rose-600" />
                <div>
                  <div className="text-sm font-semibold text-rose-700">Room Change Required</div>
                  <div className="mt-1 text-xs text-rose-700/80">
                    Room {value.rooms[0]?.roomNumber || '—'} is not available. Please select an alternative room below.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!sameRoomAvailable ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Calendar className="h-5 w-5 text-[#0B4EA2]" />
                Alternative Rooms
              </div>

              <div className="space-y-3">
                {alternativeRooms.map((r) => {
                  const checked = selectedRoomNumber === r.number
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={[
                        'w-full rounded-xl border p-4 text-left',
                        checked ? 'border-[#0B4EA2] bg-[#EEF6FF]' : 'border-slate-200 bg-white',
                      ].join(' ')}
                      onClick={() => onChangeSelectedRoomNumber(r.number)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span
                            className={[
                              'mt-1 inline-block h-5 w-5 rounded-full border',
                              checked ? 'border-[#0B4EA2]' : 'border-slate-300',
                            ].join(' ')}
                          >
                            {checked ? <span className="mx-auto mt-[3px] block h-2.5 w-2.5 rounded-full bg-[#0B4EA2]" /> : null}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{r.number}</div>
                            <div className="mt-1 text-xs text-slate-500">{r.subtitle}</div>
                            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                              Available
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">{formatMoney(r.price)}/night</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {sameRoomAvailable ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-semibold text-emerald-700">Same Room Available</div>
                  <div className="mt-1 text-xs text-emerald-700/80">
                    Room {value.rooms[0]?.roomNumber || '—'} is available for the entire extended period.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span>€</span>
            Payment Method
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className={[
                'w-full rounded-xl border p-4 text-left',
                paymentMethod === 'charge_to_room' ? 'border-[#0B4EA2] bg-[#EEF6FF]' : 'border-slate-200 bg-white',
              ].join(' ')}
              onClick={() => setPaymentMethod('charge_to_room')}
            >
              <div className="text-sm font-semibold text-slate-800">Charge to Room</div>
              <div className="mt-1 text-xs text-slate-500">Add extension charges to the guest folio.</div>
            </button>

            <button
              type="button"
              className={[
                'w-full rounded-xl border p-4 text-left',
                paymentMethod === 'pay_now' ? 'border-[#0B4EA2] bg-[#EEF6FF]' : 'border-slate-200 bg-white',
              ].join(' ')}
              onClick={() => setPaymentMethod('pay_now')}
            >
              <div className="text-sm font-semibold text-slate-800">Pay Now</div>
              <div className="mt-1 text-xs text-slate-500">Collect payment for the extension now.</div>
            </button>

            <button
              type="button"
              className={[
                'w-full rounded-xl border p-4 text-left',
                paymentMethod === 'charge_to_company' ? 'border-[#0B4EA2] bg-[#EEF6FF]' : 'border-slate-200 bg-white',
              ].join(' ')}
              onClick={() => setPaymentMethod('charge_to_company')}
            >
              <div className="text-sm font-semibold text-slate-800">Charge to Company</div>
              <div className="mt-1 text-xs text-slate-500">Bill the extension to a company account.</div>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 text-sm font-semibold text-slate-800">Summary</div>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Extra Nights</span>
              <span className="font-semibold">{extraNights}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Extension Charge</span>
              <span className="font-semibold">{formatMoney(extensionCharge)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Current Balance</span>
              <span className="font-semibold">{formatMoney(currentBalance)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="font-semibold">New Total Balance</span>
              <span className="font-semibold text-[#0B4EA2]">{formatMoney(newTotalBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {confirmError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{confirmError}</div> : null}

      <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
        <button
          type="button"
          className="h-12 w-full rounded-xl border border-slate-300 px-16 text-sm font-semibold text-slate-700 md:w-auto"
          onClick={onCancel}
        >
          cancel
        </button>

        <button
          type="button"
          className={[
            'h-12 w-full rounded-xl bg-[#0B4EA2] px-16 text-sm font-semibold text-white md:w-auto',
            canConfirm ? '' : 'opacity-50',
          ].join(' ')}
          onClick={handleConfirm}
          disabled={!canConfirm}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
