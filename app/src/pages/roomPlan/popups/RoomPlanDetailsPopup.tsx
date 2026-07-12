import { Clock, Eye, LogIn, LogOut, X } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'
import { CheckInProcessPopup } from '../../reservations/pupops/CheckInProcessPopup'
import { CheckOutProcessPopup, type CheckoutMode } from '../../reservations/checkout/CheckOutProcessPopup'

import type { RoomPlanBlock, RoomPlanRoom } from '../roomPlanMock'
import type { PmsReservation } from '../../../models/PmsReservation'

type Props = {
  open: boolean
  onClose: () => void
  onViewReservation: () => void
  room?: RoomPlanRoom
  block?: RoomPlanBlock
  focusDate: Date
  mode: 'check_in' | 'check_out'
  onRefresh: () => void
}

function titleCase(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
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

function formatUsDate(isoValue?: string) {
  if (!isoValue) return '-'
  const d = parseIsoDate(isoValue)
  if (!d) return '-'
  return d.toLocaleDateString('en-US')
}

function localIsoDate(date: Date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function RoomPlanDetailsPopup({ open, onClose, onViewReservation, room, block, focusDate, mode, onRefresh }: Props) {
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [checkInReservationId, setCheckInReservationId] = useState<string | null>(null)
  const [checkOutOpen, setCheckOutOpen] = useState(false)
  const [checkOutReservation, setCheckOutReservation] = useState<PmsReservation | null>(null)
  const [checkOutMode, setCheckOutMode] = useState<CheckoutMode>('regular')

  const checkoutDate = block?.checkOutDate ?? block?.end ?? ''
  const today = localIsoDate()
  const isCheckoutDueToday = Boolean(checkoutDate) && checkoutDate === today
  const isLateCheckout = Boolean(checkoutDate) && checkoutDate < today
  const primaryText =
    mode === 'check_out'
      ? isLateCheckout
        ? 'Late Check-out'
        : isCheckoutDueToday
          ? 'Check-Out'
        : 'Early Check-out'
      : 'Check-in'
  const primaryBtnClassName =
    mode === 'check_out'
      ? 'bg-rose-500 hover:bg-rose-600'
      : 'bg-emerald-600 hover:bg-emerald-700'
  const PrimaryIcon = mode === 'check_out' ? LogOut : LogIn
  const alreadyCheckedIn =
    (room?.currentRoomStatus ?? '').replace(/[\s_-]/g, '').toLowerCase() === 'checkedin'
  const checkoutReservation: PmsReservation | null =
    block?.reservationId
      ? {
          id: block.reservationId,
          guestName: block.title,
          roomNumber: room?.number ?? null,
          roomTypeName: room?.type ?? '',
          checkInDate: block.checkInDate ?? block.start,
          checkOutDate: block.checkOutDate ?? block.end,
          status: block.reservationStatus ?? room?.currentRoomStatus ?? '',
          totalAmount: 0,
          paidAmount: 0,
          channelName: null,
        }
      : null

  return (
    <>
    <Modal open={open} onClose={onClose} lockScroll={false}>
      <div className="w-[94vw] max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#0B4EA2] px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-white">Room {room?.number ?? ''}</div>
            <div className="mt-1 text-[12px] text-white/80">
              {focusDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <div className="rounded-xl bg-[#EAF2FF] p-4">
              <div className="text-[12px] font-semibold text-slate-700">Room Information</div>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-[12px] text-slate-700">
                <div>
                  <div className="text-[11px] text-slate-500">Room Number</div>
                  <div className="font-semibold">Room {room?.number ?? '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Room Type</div>
                  <div className="font-semibold">{room ? titleCase(room.type) : '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Floor</div>
                  <div className="font-semibold">Floor {room?.floor ?? '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Status</div>
                  <div className="font-semibold text-emerald-700">{room ? room.status.replace('_', ' ') : '-'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#EAF2FF] p-4">
              <div className="text-[12px] font-semibold text-slate-700">Reservation Details</div>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 text-[12px] text-slate-700">
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Guest Name</div>
                  <div className="font-semibold text-slate-800">{block?.title ?? '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Payment Status</div>
                  <div
                    className={[
                      'mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold',
                      block?.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : block?.paymentStatus === 'Partial'
                          ? 'bg-blue-50 text-[#0B4EA2]'
                          : 'bg-amber-50 text-amber-700',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'inline-block h-2 w-2 rounded-full',
                        block?.paymentStatus === 'Paid'
                          ? 'bg-emerald-500'
                          : block?.paymentStatus === 'Partial'
                            ? 'bg-[#0B4EA2]'
                            : 'bg-amber-500',
                      ].join(' ')}
                    />
                    {block?.paymentStatus ?? 'Pending'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Check-in</div>
                  <div className="font-semibold">{formatUsDate(block?.checkInDate ?? block?.start)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Check-out</div>
                  <div className="font-semibold">{formatUsDate(block?.checkOutDate ?? block?.end)}</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] text-sm font-semibold text-white"
              onClick={() => {
                onClose()
                onViewReservation()
              }}
            >
              <Eye className="h-4 w-4" />
              view reservation
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-500"
                onClick={onClose}
              >
                cancel
              </button>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#0B4EA2] bg-white text-sm font-semibold text-[#0B4EA2]"
                onClick={() => {}}
              >
                <Clock className="h-4 w-4" />
                Extend stay
              </button>
            </div>

            {!(mode === 'check_in' && alreadyCheckedIn) ? <button
              type="button"
              className={[
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white',
                primaryBtnClassName,
              ].join(' ')}
              onClick={() => {
                if (mode === 'check_in') {
                  setCheckInReservationId(block?.reservationId ?? null)
                  onClose()
                  setCheckInOpen(true)
                } else {
                  setCheckOutReservation(checkoutReservation)
                  setCheckOutMode(isLateCheckout ? 'late' : isCheckoutDueToday ? 'regular' : 'early')
                  onClose()
                  setCheckOutOpen(true)
                }
              }}
            >
              <PrimaryIcon className="h-4 w-4" />
              {primaryText}
            </button> : null}
          </div>
        </div>
      </div>
    </Modal>

      <CheckInProcessPopup
        open={checkInOpen}
        onClose={() => {
          setCheckInOpen(false)
          setCheckInReservationId(null)
        }}
        reservationId={checkInReservationId}
        onSuccess={onRefresh}
      />

      <CheckOutProcessPopup
        open={checkOutOpen}
        onClose={() => {
          setCheckOutOpen(false)
          setCheckOutReservation(null)
          setCheckOutMode('regular')
        }}
        reservation={checkOutReservation}
        mode={checkOutMode}
        onSuccess={onRefresh}
      />

    </>
  )
}
