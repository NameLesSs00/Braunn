import { Calendar, ChevronDown } from 'lucide-react'
import { useMemo, useRef } from 'react'

import type { ReservationDraft } from '../../../../../widgets/reservations/NewReservationModal/NewReservationModal'

type Props = {
  value: ReservationDraft
  newCheckOutIso: string
  onChangeNewCheckOutIso: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
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

function toIsoDateInput(d: Date) {
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function formatHuman(d: Date | null) {
  if (!d) return '—'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatShort(d: Date | null) {
  if (!d) return ''
  return d.toLocaleDateString('en-US')
}

function daysBetween(start: Date | null, end: Date | null) {
  if (!start || !end) return 0
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
  return Math.max(0, diff)
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function ExtendStayStep1({ value, newCheckOutIso, onChangeNewCheckOutIso, onCancel, onConfirm }: Props) {
  const checkIn = useMemo(() => parseReservationDate(value.checkInDate), [value.checkInDate])
  const checkOut = useMemo(() => parseReservationDate(value.checkOutDate), [value.checkOutDate])
  const newCheckOut = useMemo(() => (newCheckOutIso ? parseIsoDate(newCheckOutIso) : null), [newCheckOutIso])

  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const extraNights = useMemo(() => daysBetween(checkOut, newCheckOut), [checkOut, newCheckOut])
  const ratePerNight = 120
  const totalAdditional = extraNights * ratePerNight

  const canConfirm = Boolean(newCheckOutIso) && extraNights > 0

  return (
    <div className="space-y-8 px-8 py-8">
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
      </div>

      <div className="rounded-xl border border-[#BBD3FF] bg-[#EEF6FF] p-4">
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
            <span className="font-semibold text-[#0B4EA2]">{formatMoney(totalAdditional)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
        <button
          type="button"
          className="h-12 w-full rounded-xl border border-slate-300 px-12 text-sm font-semibold text-slate-700 md:w-auto"
          onClick={onCancel}
        >
          cancel
        </button>

        <button
          type="button"
          className={[
            'h-12 w-full rounded-xl px-10 text-sm font-semibold md:w-auto',
            canConfirm ? 'bg-[#0B4EA2] text-white' : 'bg-slate-200 text-slate-500',
          ].join(' ')}
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          Confirm Extension
        </button>
      </div>
    </div>
  )
}
