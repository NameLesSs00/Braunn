import { X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'

import type { ReservationDraft } from '../../../features/reservations/draftSlice'

import { ExtendStayStep1 } from './steps/ExtendStayStep1'
import { ExtendStayStep2 } from './steps/ExtendStayStep2'
import { ExtendStayStep3 } from './steps/ExtendStayStep3'

type Props = {
  open: boolean
  onClose: () => void
  value: ReservationDraft
}

function titleCase(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export function ExtendStayModal({ open, onClose, value }: Props) {
  const fullName = useMemo(() => [value.firstName, value.surName].filter(Boolean).join(' '), [value.firstName, value.surName])

  const roomNumber = value.rooms[0]?.roomNumbers?.[0] ?? ''

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [newCheckOutIso, setNewCheckOutIso] = useState('')
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('')

  const checkOutIso = useMemo(() => {
    const trimmed = value.checkOutDate.trim()
    return trimmed.includes('-') ? trimmed : ''
  }, [value.checkOutDate])

  const extraNights = useMemo(() => {
    if (!checkOutIso || !newCheckOutIso) return 0
    const toDate = (iso: string) => {
      const [yyyy, mm, dd] = iso.split('-')
      const y = Number(yyyy)
      const m = Number(mm)
      const d = Number(dd)
      if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
      return new Date(y, m - 1, d)
    }

    const start = toDate(checkOutIso)
    const end = toDate(newCheckOutIso)
    if (!start || !end) return 0
    const diff = Math.round((end.getTime() - start.getTime()) / 86400000)
    return Math.max(0, diff)
  }, [checkOutIso, newCheckOutIso])

  const ratePerNight = 120
  const extensionCharge = extraNights * ratePerNight

  const sameRoomAvailable = useMemo(() => {
    if (!newCheckOutIso) return true
    return extraNights < 4
  }, [extraNights, newCheckOutIso])

  const newTotalBalance = useMemo(() => {
    const current = Number.parseFloat(value.paidAmount || '0')
    const base = Number.isFinite(current) ? Math.max(0, current) : 0
    return base + extensionCharge
  }, [extensionCharge, value.paidAmount])

  const onCloseSafe = () => {
    onClose()
    setStep(1)
    setNewCheckOutIso('')
    setSelectedRoomNumber('')
  }

  return (
    <Modal open={open} onClose={onCloseSafe} lockScroll>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="bg-[#0B4EA2] px-8 py-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-lg font-semibold text-white">{step === 3 ? 'Confirm Extension' : 'Extend Stay'}</div>
              <div className="mt-1 text-sm text-white/90">
                {step === 3 ? (
                  <span>Review extension details</span>
                ) : (
                  <span className="flex flex-wrap items-center gap-4">
                    <span>• {fullName || '—'}</span>
                    <span>• Room {roomNumber || '—'}</span>
                    <span className="inline-flex h-7 items-center rounded-full bg-emerald-400 px-6 text-xs font-semibold text-white">
                      {titleCase('in house')}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseSafe}
              className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          {step === 1 ? (
            <ExtendStayStep1
              value={value}
              newCheckOutIso={newCheckOutIso}
              onChangeNewCheckOutIso={setNewCheckOutIso}
              onCancel={onCloseSafe}
              onConfirm={() => setStep(2)}
            />
          ) : step === 2 ? (
            <ExtendStayStep2
              value={value}
              extraNights={extraNights}
              extensionCharge={extensionCharge}
              newCheckOutIso={newCheckOutIso}
              onChangeNewCheckOutIso={setNewCheckOutIso}
              sameRoomAvailable={sameRoomAvailable}
              selectedRoomNumber={selectedRoomNumber}
              onChangeSelectedRoomNumber={setSelectedRoomNumber}
              onCancel={onCloseSafe}
              onConfirm={() => setStep(3)}
            />
          ) : step === 3 ? (
            <ExtendStayStep3
              value={value}
              newCheckOutIso={newCheckOutIso}
              extraNights={extraNights}
              newTotalBalance={newTotalBalance}
              selectedRoomNumber={selectedRoomNumber}
              onBack={() => setStep(2)}
              onUpdateBalance={onCloseSafe}
            />
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
