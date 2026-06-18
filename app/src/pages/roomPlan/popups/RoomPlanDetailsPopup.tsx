import { Ban, Clock, Eye, LogIn, LogOut, MoreHorizontal, Move, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'
import { CheckInProcessPopup } from '../../reservations/pupops/CheckInProcessPopup'
import { MoveRoomStep1Popup } from './moveRoom/MoveRoomStep1Popup'
import type { MoveRoomStep1Data } from './moveRoom/MoveRoomStep1Popup'
import { MoveRoomStep2Popup } from './moveRoom/MoveRoomStep2Popup'

import type { RoomPlanBlock, RoomPlanRoom } from '../roomPlanMock'

type Props = {
  open: boolean
  onClose: () => void
  onViewReservation: () => void
  room?: RoomPlanRoom
  block?: RoomPlanBlock
  focusDate: Date
  mode: 'check_in' | 'check_out'
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

function rateByRoomType(roomType: RoomPlanRoom['type']) {
  if (roomType === 'single') return 120
  if (roomType === 'double') return 160
  if (roomType === 'suite') return 220
  return 180
}

export function RoomPlanDetailsPopup({ open, onClose, onViewReservation, room, block, focusDate, mode }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [moveRoomOpen, setMoveRoomOpen] = useState(false)
  const [moveStep2Open, setMoveStep2Open] = useState(false)
  const [moveStep1Data, setMoveStep1Data] = useState<MoveRoomStep1Data | null>(null)

  useEffect(() => {
    if (!open) return
    setMenuOpen(false)
  }, [open])

  useEffect(() => {
    if (!menuOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', onMouseDown)
    return () => window.removeEventListener('mousedown', onMouseDown)
  }, [menuOpen])

  const primaryText = mode === 'check_out' ? 'Check-Out' : 'Check-in'
  const primaryBtnClassName =
    mode === 'check_out'
      ? 'bg-rose-500 hover:bg-rose-600'
      : 'bg-emerald-600 hover:bg-emerald-700'
  const PrimaryIcon = mode === 'check_out' ? LogOut : LogIn

  return (
    <>
    <Modal open={open} onClose={onClose} lockScroll={false}>
      <div className="w-[94vw] max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
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
            <div className="flex justify-end">
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                  aria-label="More"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {menuOpen ? (
                  <div
                    className="absolute right-0 top-9 z-10 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Ban className="h-4 w-4 text-slate-600" />
                      cancel Reservation
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4 text-slate-600" />
                      Early Check out
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-[12px] text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setMenuOpen(false)
                        onClose()
                        setMoveRoomOpen(true)
                      }}
                    >
                      <Move className="h-4 w-4 text-slate-600" />
                      Move Room
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

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
                  <div className="text-[11px] text-[#0B4EA2]">Check-out</div>
                  <div className="font-semibold">{formatUsDate(block?.end)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Check-in</div>
                  <div className="font-semibold">{formatUsDate(block?.start)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Rate</div>
                  <div className="font-semibold">{room ? `$${rateByRoomType(room.type)}` : '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Guests</div>
                  <div className="font-semibold">1</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#0B4EA2]">Source</div>
                  <div className="font-semibold">{room ? titleCase(room.bookingType) : '-'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[11px] text-[#0B4EA2]">Payment Status</div>
                  <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#B07A20]">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#F5A524]" />
                    deposit
                  </div>
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

            <button
              type="button"
              className={[
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white',
                primaryBtnClassName,
              ].join(' ')}
              onClick={() => {
                if (mode === 'check_in') {
                  onClose()
                  setCheckInOpen(true)
                }
              }}
            >
              <PrimaryIcon className="h-4 w-4" />
              {primaryText}
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <CheckInProcessPopup
      open={checkInOpen}
      onClose={() => setCheckInOpen(false)}
      reservationId={block?.id ?? null}
    />

    <MoveRoomStep1Popup
      open={moveRoomOpen}
      onClose={() => setMoveRoomOpen(false)}
      onContinue={(data) => {
        setMoveStep1Data(data)
        setMoveRoomOpen(false)
        setMoveStep2Open(true)
      }}
      room={room}
      block={block}
    />

    <MoveRoomStep2Popup
      open={moveStep2Open}
      onClose={() => setMoveStep2Open(false)}
      step1Data={moveStep1Data}
      room={room}
      block={block}
    />
    </>
  )
}
