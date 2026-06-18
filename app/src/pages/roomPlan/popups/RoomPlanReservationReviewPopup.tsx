import { useMemo } from 'react'

import { Modal } from '../../../shared/ui/Modal'

import type { ReservationDraft } from '../../../features/reservations/draftSlice'
import { Step4ReviewPage } from '../../../widgets/reservations/NewReservationModal/steps/step4/Step4ReviewPage'
import { computePricing } from '../../../widgets/reservations/NewReservationModal/steps/step4/pricing'

import type { RoomPlanBlock, RoomPlanRoom } from '../roomPlanMock'

type Props = {
  open: boolean
  onClose: () => void
  room?: RoomPlanRoom
  block?: RoomPlanBlock
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

function formatUsDateFromIso(iso?: string) {
  if (!iso) return ''
  const d = parseIsoDate(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-US')
}

function nightsBetween(startIso?: string, endIso?: string) {
  if (!startIso || !endIso) return 1
  const s = parseIsoDate(startIso)
  const e = parseIsoDate(endIso)
  if (!s || !e) return 1
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000)
  return Math.max(1, diff)
}

function titleCase(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export function RoomPlanReservationReviewPopup({ open, onClose, room, block }: Props) {
  const draft = useMemo<ReservationDraft>(() => {
    const checkInDate = formatUsDateFromIso(block?.start)
    const checkOutDate = formatUsDateFromIso(block?.end)

    const [firstName = '', surName = ''] = (block?.title ?? '').split(' ')

    return {
      bookingSource: room ? titleCase(room.bookingType) : '',

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

      checkInDate,
      checkOutDate,
      nights: String(nightsBetween(block?.start, block?.end)),

      adultCount: 1,
      childCount: 0,
      infantCount: 0,

      rooms: [
        {
          id: 0,
          roomType: room ? titleCase(room.type) : '',
          roomView: '',
          roomCount: 1,
          roomNumbers: room?.number ? [room.number] : [],
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
      paidAmount: '',
      coupon: '',

      otherPayments: [],
    } as unknown as ReservationDraft
  }, [block?.end, block?.start, block?.title, room])

  const nights = useMemo(() => {
    const n = Number.parseInt(draft.nights, 10)
    return Number.isFinite(n) && n > 0 ? n : 1
  }, [draft.nights])

  const pricing = useMemo(() => computePricing(draft, nights), [draft, nights])

  const guestsTotal = draft.adultCount + draft.childCount + draft.infantCount

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div className="text-lg font-semibold text-white">Reservation Details</div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 px-8 pb-8 pt-7">
          <Step4ReviewPage
            value={draft}
            onChange={() => {}}
            guestsTotal={guestsTotal}
            pricing={pricing}
            onOpenCheckIn={() => {}}
            onOpenExtendStay={() => {}}
          />
        </div>
      </div>
    </Modal>
  )
}
