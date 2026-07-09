import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'

import type { RoomPlanRoom, RoomStatus } from '../roomPlanMock'

type Props = {
  open: boolean
  onClose: () => void
  room?: RoomPlanRoom
  date: Date
  endDate?: Date
  onAddReservation: () => void
}

function titleCase(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function dayTitle(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function RoomPlanEmptyCellPopup({ open, onClose, room, date, endDate, onAddReservation }: Props) {
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('available')

  const initialStatus = useMemo(() => room?.status ?? 'available', [room?.status])

  useEffect(() => {
    if (!open) return
    setRoomStatus(initialStatus)
  }, [initialStatus, open])

  return (
    <Modal open={open} onClose={onClose} lockScroll={false}>
      <div className="relative w-[94vw] max-w-2xl translate-y-10 overflow-y-auto rounded-2xl bg-white shadow-xl max-h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <div>
            <div className="text-lg font-semibold text-white">Room {room?.number ?? '—'}</div>
            <div className="mt-1 text-xs text-white/90">
              {dayTitle(date)}
              {endDate && (
                <>
                  <span className="mx-2 text-white/50">→</span>
                  {dayTitle(endDate)}
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-xl bg-[#EEF6FF] p-4">
            <div className="mb-3 text-sm font-semibold text-slate-800">Room Information</div>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
              <div>
                <div className="text-xs text-slate-500">Room Number</div>
                <div className="font-medium">Room {room?.number ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Room Type</div>
                <div className="font-medium">{room ? titleCase(room.type) : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Floor</div>
                <div className="font-medium">Floor {room?.floor ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Status</div>
                <div className="font-medium text-emerald-600">{roomStatus}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-slate-700">Room Status</div>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                value={roomStatus}
                onChange={(e) => setRoomStatus(e.target.value as RoomStatus)}
              >
                <option value="available">available</option>
                <option value="confirmed">confirmed</option>
                <option value="checked_in">checked_in</option>
                <option value="cleaning">cleaning</option>
                <option value="maintained">maintained</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-slate-700">Room Maintenance</div>
            <textarea
              className="h-12 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder="write a description"
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-slate-700">Additional text</div>
            <textarea
              className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder="write a description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600"
              onClick={onClose}
            >
              cancel
            </button>
            <button type="button" className="h-11 rounded-xl border border-[#0B4EA2] bg-white text-sm font-semibold text-[#0B4EA2]">
              Ok
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] text-sm font-semibold text-white"
            onClick={() => {
              onClose()
              onAddReservation()
            }}
          >
            <span className="text-lg leading-none">+</span>
            add reservation
          </button>
        </div>
      </div>
    </Modal>
  )
}
