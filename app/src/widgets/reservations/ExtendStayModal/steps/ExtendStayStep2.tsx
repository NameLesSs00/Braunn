import { AlertCircle, Calendar, CheckCircle2, ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { formatMoney } from '../../CheckInProcessModal/utils'

import type { ReservationDraft } from '../../../../features/reservations/draftSlice'

type Props = {
  value: ReservationDraft
  extraNights: number
  extensionCharge: number
  newCheckOutIso: string
  onChangeNewCheckOutIso: (value: string) => void
  sameRoomAvailable: boolean
  selectedRoomNumber: string
  onChangeSelectedRoomNumber: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

type PaymentMethod = 'charge_to_room' | 'pay_now' | 'charge_to_company'



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

export function ExtendStayStep2({
  value,
  extraNights,
  extensionCharge,
  newCheckOutIso,
  onChangeNewCheckOutIso,
  sameRoomAvailable,
  selectedRoomNumber,
  onChangeSelectedRoomNumber,
  onCancel,
  onConfirm,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('charge_to_room')
  const [confirmError, setConfirmError] = useState('')

  const [roomType, setRoomType] = useState(value.rooms[0]?.roomType ?? 'single')
  const [roomView, setRoomView] = useState(value.rooms[0]?.roomView ?? 'Garden view')

  const checkIn = useMemo(() => parseReservationDate(value.checkInDate), [value.checkInDate])
  const checkOut = useMemo(() => parseReservationDate(value.checkOutDate), [value.checkOutDate])
  const newCheckOut = useMemo(() => (newCheckOutIso ? parseIsoDate(newCheckOutIso) : null), [newCheckOutIso])

  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const currentBalance = useMemo(() => {
    const paid = Number.parseFloat(value.paidAmount || '0')
    return Number.isFinite(paid) ? Math.max(0, paid) : 0
  }, [value.paidAmount])

  const newTotalBalance = currentBalance + extensionCharge
  const currency = (value as any)?.finance?.currency || '$'

  const alternativeRooms = useMemo(
    () => [
      { id: '103-a', number: 'Room 103', subtitle: 'double • Floor 1', price: 120 },
      { id: '103-b', number: 'Room 103', subtitle: 'double • Floor 1', price: 120 },
      { id: '104', number: 'Room 104', subtitle: 'double • Floor 1', price: 120 },
    ],
    []
  )

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
                  <span className="font-semibold text-slate-800">{formatMoney(120)}</span>
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
                    Room {value.rooms[0]?.roomNumbers?.[0] || '—'} is not available. Please select an alternative room below.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!sameRoomAvailable ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 text-[12px] font-medium text-slate-700">Room Type</div>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <option value="single">single</option>
                    <option value="double">double</option>
                    <option value="suite">suite</option>
                    <option value="deluxe">deluxe</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
                </div>
              </div>
              <div>
                <div className="mb-2 text-[12px] font-medium text-slate-700">Room view</div>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                    value={roomView}
                    onChange={(e) => setRoomView(e.target.value)}
                  >
                    <option value="Garden view">Garden view</option>
                    <option value="Sea view">Sea view</option>
                    <option value="City view">City view</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
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
                          <span className={['mt-1 inline-block h-5 w-5 rounded-full border', checked ? 'border-[#0B4EA2]' : 'border-slate-300'].join(' ')}>
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
                    Room {value.rooms[0]?.roomNumbers?.[0] || '—'} is available for the entire extended period.
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
              <div className="flex items-start gap-3">
                <span
                  className={[
                    'mt-1 inline-block h-5 w-5 rounded-full border',
                    paymentMethod === 'charge_to_room' ? 'border-[#0B4EA2]' : 'border-slate-300',
                  ].join(' ')}
                >
                  {paymentMethod === 'charge_to_room' ? (
                    <span className="mx-auto mt-[3px] block h-2.5 w-2.5 rounded-full bg-[#0B4EA2]" />
                  ) : null}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Charge to Room</div>
                  <div className="mt-1 text-xs text-slate-500">Add to guest folio</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={[
                'w-full rounded-xl border p-4 text-left',
                paymentMethod === 'pay_now' ? 'border-[#0B4EA2] bg-[#EEF6FF]' : 'border-slate-200 bg-white',
              ].join(' ')}
              onClick={() => setPaymentMethod('pay_now')}
            >
              <div className="flex items-start gap-3">
                <span
                  className={[
                    'mt-1 inline-block h-5 w-5 rounded-full border',
                    paymentMethod === 'pay_now' ? 'border-[#0B4EA2]' : 'border-slate-300',
                  ].join(' ')}
                >
                  {paymentMethod === 'pay_now' ? (
                    <span className="mx-auto mt-[3px] block h-2.5 w-2.5 rounded-full bg-[#0B4EA2]" />
                  ) : null}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Pay Now</div>
                  <div className="mt-1 text-xs text-slate-500">Process payment immediately</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={[
                'w-full rounded-xl border p-4 text-left',
                paymentMethod === 'charge_to_company' ? 'border-[#0B4EA2] bg-[#EEF6FF]' : 'border-slate-200 bg-white',
              ].join(' ')}
              onClick={() => setPaymentMethod('charge_to_company')}
            >
              <div className="flex items-start gap-3">
                <span
                  className={[
                    'mt-1 inline-block h-5 w-5 rounded-full border',
                    paymentMethod === 'charge_to_company' ? 'border-[#0B4EA2]' : 'border-slate-300',
                  ].join(' ')}
                >
                  {paymentMethod === 'charge_to_company' ? (
                    <span className="mx-auto mt-[3px] block h-2.5 w-2.5 rounded-full bg-[#0B4EA2]" />
                  ) : null}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Charge to Company</div>
                  <div className="mt-1 text-xs text-slate-500">Bill corporate account</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-[#EEF6FF] p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span>▣</span>
            Payment Summary
          </div>

          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Current Balance:</span>
              <span className="font-semibold">{formatMoney(currentBalance, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Extension Charge:</span>
              <span className="font-semibold">{formatMoney(extensionCharge, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Room change :</span>
              <span className="font-semibold">103 To 104</span>
            </div>
            <div className="border-t border-[#BBD3FF] pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0B4EA2]">New Total Balance:</span>
                <span className="font-semibold text-[#0B4EA2]">{formatMoney(newTotalBalance, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
        <button
          type="button"
          className="h-12 w-full rounded-xl border border-slate-300 px-16 text-sm font-semibold text-slate-700 md:w-auto"
          onClick={onCancel}
        >
          cancel
        </button>

        {confirmError ? <div className="w-full text-center text-xs font-semibold text-rose-600 md:w-auto md:text-right">{confirmError}</div> : null}

        <button
          type="button"
          className={[
            'h-12 w-full rounded-xl bg-[#0B4EA2] px-16 text-sm font-semibold text-white md:w-auto',
            canConfirm ? '' : 'opacity-60',
          ].join(' ')}
          onClick={handleConfirm}
          aria-disabled={!canConfirm}
        >
          Confirm Extension
        </button>
      </div>
    </div>
  )
}
