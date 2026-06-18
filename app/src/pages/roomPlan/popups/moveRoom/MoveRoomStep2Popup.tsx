import { CheckCircle2, Home, X } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '../../../../shared/ui/Modal'
import type { RoomPlanBlock, RoomPlanRoom } from '../../roomPlanMock'
import type { MoveRoomStep1Data } from './MoveRoomStep1Popup'

// ---------- helpers ----------

function titleCase(v: string) {
  return v
    .trim()
    .split(/[\s_]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function formatLongDate(iso?: string) {
  if (!iso) return '-'
  const [yyyy, mm, dd] = iso.split('-')
  if (!yyyy || !mm || !dd) return '-'
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function rateByRoomType(type: RoomPlanRoom['type']) {
  if (type === 'single') return 120
  if (type === 'double') return 160
  if (type === 'suite') return 220
  return 180
}

/** Derives a mock "new room" number that differs from the current one */
function mockNewRoomNumber(currentNumber: string) {
  const n = Number(currentNumber)
  if (!Number.isFinite(n)) return '101'
  return String(n <= 101 ? n + 3 : n - 3)
}

// ---------- sub-components ----------

interface RoomCardProps {
  roomNumber: string
  roomType: string
  rate: number
  highlighted?: boolean
}

function RoomCard({ roomNumber, roomType, rate, highlighted = false }: RoomCardProps) {
  return (
    <div
      className={[
        'flex-1 rounded-xl border-2 p-4',
        highlighted
          ? 'border-[#0B4EA2] bg-[#EAF2FF]'
          : 'border-slate-200 bg-white',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <Home
          className={`h-4 w-4 ${highlighted ? 'text-[#0B4EA2]' : 'text-slate-500'}`}
        />
        <span
          className={`text-base font-bold ${highlighted ? 'text-[#0B4EA2]' : 'text-slate-800'}`}
        >
          {roomNumber}
        </span>
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{titleCase(roomType)}</div>
      <div className="mt-2 text-[12px] font-semibold text-slate-700">
        ${rate}/nt
      </div>
      <div className="mt-1 text-right">
        <span className={`text-lg ${highlighted ? 'text-[#0B4EA2]' : 'text-slate-300'}`}>✦</span>
      </div>
    </div>
  )
}

// ---------- Success banner ----------

interface SuccessBannerProps {
  onClose: () => void
}

function SuccessBanner({ onClose }: SuccessBannerProps) {
  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="relative w-[92vw] max-w-sm overflow-hidden rounded-2xl bg-[#F0FDF4] shadow-2xl">
        {/* X button */}
        <button
          type="button"
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-3 px-8 py-10">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <p className="text-center text-sm font-semibold text-slate-800">
            Room Successfully Moved
          </p>
        </div>
      </div>
    </Modal>
  )
}

// ---------- main component ----------

type Props = {
  open: boolean
  onClose: () => void
  step1Data: MoveRoomStep1Data | null
  room?: RoomPlanRoom
  block?: RoomPlanBlock
}

export function MoveRoomStep2Popup({ open, onClose, step1Data, room, block }: Props) {
  const [successOpen, setSuccessOpen] = useState(false)

  // current room values
  const currentRoomNumber = room?.number ?? '-'
  const currentRoomType = room?.type ?? 'single'
  const currentRate = room ? rateByRoomType(room.type) : 80

  // new room (derived mock)
  const newRoomNumber = mockNewRoomNumber(currentRoomNumber)
  const newRoomType = step1Data?.roomType || currentRoomType
  const newRate = rateByRoomType(newRoomType as RoomPlanRoom['type'])

  // dates
  const checkInDate =
    step1Data?.moveConfig === 'specific_dates' && step1Data.startDate
      ? formatLongDate(step1Data.startDate)
      : formatLongDate(block?.start)

  const checkOutDate =
    step1Data?.moveConfig === 'specific_dates' && step1Data.endDate
      ? formatLongDate(step1Data.endDate)
      : formatLongDate(block?.end)

  const handleConfirm = () => {
    setSuccessOpen(true)
  }

  const handleSuccessClose = () => {
    setSuccessOpen(false)
    onClose()
  }

  return (
    <>
      <Modal open={open} onClose={onClose} lockScroll closeOnBackdrop={false}>
        <div className="flex w-[94vw] max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4 bg-[#0B4EA2] px-6 py-4">
            <div>
              <div className="text-sm font-bold text-white">Confirm Room Move</div>
              <div className="mt-0.5 text-[11px] text-white/75">
                Please review the details before confirming
              </div>
            </div>
            <button
              type="button"
              className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/15"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-6 py-5">
            <div className="space-y-5">

              {/* ── Guest Information ── */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-[12px] font-semibold text-slate-700">
                  Guest Information
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500">Name:</span>
                    <span className="text-[12px] font-bold text-slate-800">
                      {block?.title ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-500">Confirmation ID:</span>
                    <span className="text-[12px] font-semibold text-slate-700">
                      {block?.id ?? '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Room Change Summary ── */}
              <div>
                <div className="mb-3 text-[12px] font-semibold text-slate-700">
                  Room Change Summary
                </div>

                <div className="flex items-center gap-3">
                  {/* Current room */}
                  <RoomCard
                    roomNumber={currentRoomNumber}
                    roomType={currentRoomType}
                    rate={currentRate}
                    highlighted={false}
                  />

                  {/* "To" badge */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-500 shadow-sm">
                    To
                  </div>

                  {/* New room */}
                  <RoomCard
                    roomNumber={newRoomNumber}
                    roomType={newRoomType}
                    rate={newRate}
                    highlighted
                  />
                </div>
              </div>

              {/* ── Duration ── */}
              <div>
                <div className="mb-3 text-[12px] font-semibold text-slate-700">Duration</div>

                <div className="flex items-center gap-3">
                  {/* Check-in */}
                  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] text-slate-400">Check-in Date</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-800">
                      {checkInDate}
                    </div>
                  </div>

                  {/* "To" badge */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-500 shadow-sm">
                    To
                  </div>

                  {/* Check-out */}
                  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] text-slate-400">Check-out Date</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-800">
                      {checkOutDate}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              className="h-10 w-32 rounded-xl border border-[#0B4EA2] text-sm font-semibold text-[#0B4EA2] hover:bg-[#EAF2FF]"
              onClick={onClose}
            >
              cancel
            </button>
            <button
              type="button"
              className="h-10 w-40 rounded-xl bg-[#0B4EA2] text-sm font-semibold text-white hover:bg-[#0a3f8a]"
              onClick={handleConfirm}
            >
              Confirm Move
            </button>
          </div>

        </div>
      </Modal>

      {/* ── Success banner ── */}
      {successOpen && <SuccessBanner onClose={handleSuccessClose} />}
    </>
  )
}
