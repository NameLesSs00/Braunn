import { useMemo } from 'react'

import type { ReservationDraft } from '../../../../../widgets/reservations/NewReservationModal/NewReservationModal'

type Props = {
  value: ReservationDraft
  newCheckOutIso: string
  selectedRoomNumber: string
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
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

function formatShortDate(d: Date | null) {
  if (!d) return '—'
  return d.toLocaleDateString('en-US')
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <div className="text-slate-600">{label}</div>
      <div className="font-medium text-slate-800">{value}</div>
    </div>
  )
}

export function ExtendStayStep3({ value, newCheckOutIso, selectedRoomNumber, onBack, onSubmit, submitting }: Props) {
  const fullName = useMemo(() => [value.firstName, value.lastName].filter(Boolean).join(' '), [value.firstName, value.lastName])

  const originalCheckOut = useMemo(() => parseReservationDate(value.checkOutDate), [value.checkOutDate])
  const newCheckOut = useMemo(() => (newCheckOutIso ? parseIsoDate(newCheckOutIso) : null), [newCheckOutIso])

  const roomNumber = selectedRoomNumber || (value.rooms[0]?.roomNumber ? `Room ${value.rooms[0]?.roomNumber}` : '—')

  const extraNights = useMemo(() => {
    if (!originalCheckOut || !newCheckOut) return 0
    const diff = Math.round((newCheckOut.getTime() - originalCheckOut.getTime()) / 86400000)
    return Math.max(0, diff)
  }, [newCheckOut, originalCheckOut])

  return (
    <div className="space-y-8 px-8 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#BBD3FF] bg-[#EEF6FF] p-6">
        <div className="divide-y divide-[#BBD3FF]">
          <Row label="Guest:" value={fullName || '—'} />
          <Row label="Original Check-out" value={formatShortDate(originalCheckOut)} />
          <Row label="New Check-out" value={formatShortDate(newCheckOut)} />
          <Row label="Room Number" value={roomNumber || '—'} />
          <Row label="Extra Nights" value={String(extraNights)} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
        <button
          type="button"
          className="h-12 w-full rounded-xl border border-slate-300 px-16 text-sm font-semibold text-slate-700 md:w-auto"
          onClick={onBack}
          disabled={submitting}
        >
          Back
        </button>

        <button
          type="button"
          className={[
            'h-12 w-full rounded-xl bg-[#0B4EA2] px-16 text-sm font-semibold text-white md:w-auto',
            submitting ? 'opacity-60' : '',
          ].join(' ')}
          onClick={onSubmit}
          disabled={submitting}
        >
          Confirm Extension
        </button>
      </div>
    </div>
  )
}
