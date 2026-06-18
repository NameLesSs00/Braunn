import { CheckCircle2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { SuccessAlertModal } from '../../../../shared/ui/SuccessAlertModal'
import type { ReservationDraft } from '../../../../features/reservations/draftSlice'

type Props = {
  value: ReservationDraft
  newCheckOutIso: string
  extraNights: number
  newTotalBalance: number
  selectedRoomNumber: string
  onBack: () => void
  onUpdateBalance: () => void
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

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <div className="text-slate-600">{label}</div>
      <div className="font-medium text-slate-800">{value}</div>
    </div>
  )
}

export function ExtendStayStep3({
  value,
  newCheckOutIso,
  extraNights,
  newTotalBalance,
  selectedRoomNumber,
  onBack,
  onUpdateBalance,
}: Props) {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const fullName = useMemo(() => [value.firstName, value.surName].filter(Boolean).join(' '), [value.firstName, value.surName])

  const originalCheckOut = useMemo(() => parseReservationDate(value.checkOutDate), [value.checkOutDate])
  const newCheckOut = useMemo(() => (newCheckOutIso ? parseIsoDate(newCheckOutIso) : null), [newCheckOutIso])

  const roomNumber = selectedRoomNumber || value.rooms[0]?.roomNumbers?.[0] || '—'

  const handleUpdateBalance = () => {
    onUpdateBalance()
    setShowSuccessAlert(true)
  }

  return (
    <div className="space-y-8 px-8 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-[#BBD3FF] bg-[#EEF6FF] p-6">
        <div className="divide-y divide-[#BBD3FF]">
          <Row label="Guest:" value={fullName || '—'} />
          <Row label="Original Check-out" value={formatShortDate(originalCheckOut)} />
          <Row label="New Check-out" value={formatShortDate(newCheckOut)} />
          <Row label="Room Number" value={roomNumber || '—'} />
          <Row label="Extra Nights" value={String(extraNights)} />

          <div className="flex items-center justify-between gap-4 py-4">
            <div className="text-sm font-semibold text-[#0B4EA2]">New Total Balance:</div>
            <div className="text-sm font-semibold text-[#0B4EA2]">{formatMoney(newTotalBalance)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-end gap-4 md:flex-row">
        <button
          type="button"
          className="h-12 w-full rounded-xl border border-slate-300 px-16 text-sm font-semibold text-slate-700 md:w-auto"
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="h-12 w-full rounded-xl bg-[#0B4EA2] px-16 text-sm font-semibold text-white md:w-auto"
          onClick={handleUpdateBalance}
        >
          Update Balance
        </button>
      </div>

      <SuccessAlertModal
        open={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
        icon={<CheckCircle2 className="h-12 w-12 text-emerald-600" />}
        message="Balance updated successfully!"
      />
    </div>
  )
}
