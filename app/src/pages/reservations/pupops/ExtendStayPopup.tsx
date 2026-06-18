import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'

import { extendReservation, getReservationById } from '../../../shared/apis/reservationsApi'
import { getRooms } from '../../../shared/apis/roomsApi'

import type { Reservation } from '../../../models/Reservation'
import type { Room } from '../../../models/Room'
import type { ReservationDraft } from '../../../features/reservations/draftSlice'

import { ExtendStayStep1 } from './extendStay/steps/ExtendStayStep1'
import { ExtendStayStep2 } from './extendStay/steps/ExtendStayStep2'
import { ExtendStayStep3 } from './extendStay/steps/ExtendStayStep3'

type Props = {
  open: boolean
  onClose: () => void
  reservationId: string | null
}

function titleCase(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function isoDateOnly(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function reservationToDraft(res: Reservation): ReservationDraft {
  const [firstName = '', ...rest] = (res.guestName ?? '').split(' ')
  const surName = rest.join(' ')

  return {
    bookingSource: '',

    isGroupReservation: false,

    firstName,
    surName,
    dateOfBirth: '',
    language: '',

    email: '',
    phone: '',

    nationality: '',
    idNumber: '',

    notes: '',

    checkInDate: isoDateOnly(res.checkInDate),
    checkOutDate: isoDateOnly(res.checkOutDate),
    nights: '',

    adultCount: 1,
    childCount: 0,
    infantCount: 0,

    rooms: [
      {
        id: 0,
        roomType: res.roomTypeName ?? '',
        roomView: '',
        roomCount: 1,
        roomNumbers: res.roomNumber ? [res.roomNumber] : [],
      },
    ],

    discountType: 'none',
    discountPercentage: '',
    discountFixed: '',
    discountComment: '',

    rateCode: '',
    ratePlan: '',

    extras: [],

    specialRequests: '',

    depositAmountReceived: '',
    paymentMethod: '',
    paidAmount: String(res.paidAmount ?? 0),
    coupon: '',

    otherPayments: [],
  } as unknown as ReservationDraft
}

export function ExtendStayPopup({ open, onClose, reservationId }: Props) {
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [newCheckOutIso, setNewCheckOutIso] = useState('')
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const draft = useMemo<ReservationDraft | null>(() => (reservation ? reservationToDraft(reservation) : null), [reservation])

  const fullName = useMemo(() => {
    if (!draft) return ''
    return [draft.firstName, draft.surName].filter(Boolean).join(' ')
  }, [draft])

  const roomNumber = draft?.rooms[0]?.roomNumbers?.[0] ?? ''

  useEffect(() => {
    if (!open) return
    if (!reservationId) return

    const controller = new AbortController()

    setLoading(true)
    setError(null)
    setReservation(null)
    setRooms([])

    setStep(1)
    setNewCheckOutIso('')
    setSelectedRoomNumber('')

    Promise.all([getReservationById(reservationId, controller.signal), getRooms(controller.signal)])
      .then(([res, rms]) => {
        setReservation(res)
        setRooms(rms)
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Failed to load extend stay data')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoading(false)
      })

    return () => controller.abort()
  }, [open, reservationId])

  const onCloseSafe = () => {
    if (submitting) return
    onClose()
    setStep(1)
    setNewCheckOutIso('')
    setSelectedRoomNumber('')
    setError(null)
  }

  const canRenderFlow = Boolean(draft) && Boolean(reservationId)

  const onSubmitExtend = async () => {
    if (!reservationId) return
    if (!newCheckOutIso) return

    try {
      setSubmitting(true)
      await extendReservation(reservationId, { newCheckOutDate: newCheckOutIso })
      onCloseSafe()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to extend reservation')
    } finally {
      setSubmitting(false)
    }
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
              disabled={submitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="px-8 py-8">
              <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">Loading...</div>
            </div>
          ) : error ? (
            <div className="px-8 py-8">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
            </div>
          ) : !canRenderFlow ? (
            <div className="px-8 py-8">
              <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">No reservation selected</div>
            </div>
          ) : step === 1 ? (
            <ExtendStayStep1
              value={draft!}
              newCheckOutIso={newCheckOutIso}
              onChangeNewCheckOutIso={setNewCheckOutIso}
              onCancel={onCloseSafe}
              onConfirm={() => setStep(2)}
            />
          ) : step === 2 ? (
            <ExtendStayStep2
              value={draft!}
              rooms={rooms}
              newCheckOutIso={newCheckOutIso}
              onChangeNewCheckOutIso={setNewCheckOutIso}
              selectedRoomNumber={selectedRoomNumber}
              onChangeSelectedRoomNumber={setSelectedRoomNumber}
              onCancel={onCloseSafe}
              onConfirm={() => setStep(3)}
            />
          ) : step === 3 ? (
            <ExtendStayStep3
              value={draft!}
              newCheckOutIso={newCheckOutIso}
              selectedRoomNumber={selectedRoomNumber}
              onBack={() => setStep(2)}
              onSubmit={onSubmitExtend}
              submitting={submitting}
            />
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
