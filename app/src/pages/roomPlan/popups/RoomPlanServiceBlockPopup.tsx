import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'

import type { RoomPlanBlock, RoomPlanRoom, RoomStatus } from '../roomPlanMock'

type Props = {
  open: boolean
  onClose: () => void
  room?: RoomPlanRoom
  block?: RoomPlanBlock
  date: Date
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

function formatIsoToInput(iso?: string) {
  if (!iso) return ''
  return iso
}

export function RoomPlanServiceBlockPopup({ open, onClose, room, block, date }: Props) {
  const derivedStatus = useMemo<RoomStatus>(() => {
    if (block?.type === 'maintenance') return 'maintained'
    if (block?.type === 'cleaning') return 'cleaning'
    return room?.status ?? 'available'
  }, [block?.type, room?.status])

  const [roomStatus, setRoomStatus] = useState<RoomStatus>('available')
  const [durationFrom, setDurationFrom] = useState('')
  const [durationTo, setDurationTo] = useState('')
  const [department, setDepartment] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [reason, setReason] = useState('')
  const [additionalText, setAdditionalText] = useState('')

  useEffect(() => {
    if (!open) return

    setRoomStatus(derivedStatus)
    setDurationFrom(formatIsoToInput(block?.start))
    setDurationTo(formatIsoToInput(block?.end))

    if (block?.type === 'maintenance') {
      setDepartment('Maintenance')
      setServiceType('Electrical')
    } else if (block?.type === 'cleaning') {
      setDepartment('Housekeeping')
      setServiceType('Deep Cleaning')
    } else {
      setDepartment('')
      setServiceType('')
    }

    setReason('')
    setAdditionalText('')
  }, [block?.end, block?.start, block?.type, derivedStatus, open])

  const title = block?.type === 'maintenance' ? 'Maintenance' : block?.type === 'cleaning' ? 'Cleaning' : 'Room'

  return (
    <Modal open={open} onClose={onClose} lockScroll={false}>
      <div className="relative w-[94vw] max-w-xl translate-y-10 overflow-y-auto rounded-2xl bg-white shadow-xl max-h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <div>
            <div className="text-lg font-semibold text-white">Room {room?.number ?? '—'}</div>
            <div className="mt-1 text-xs text-white/90">{dayTitle(date)}</div>
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
                <div className={['font-medium', block?.type === 'maintenance' ? 'text-rose-600' : 'text-indigo-700'].join(' ')}>
                  {title}
                </div>
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
                <option value="dirty">dirty</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-[12px] font-medium text-slate-700">Duration From</div>
              <div className="relative">
                <input
                  type="date"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                  value={durationFrom}
                  onChange={(e) => setDurationFrom(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 text-[12px] font-medium text-slate-700">Duration To</div>
              <div className="relative">
                <input
                  type="date"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                  value={durationTo}
                  onChange={(e) => setDurationTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-slate-700">Assign Department</div>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Housekeeping">Housekeeping</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-slate-700">{titleCase(title)} Type</div>
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Deep Cleaning">Deep Cleaning</option>
                <option value="Standard Cleaning">Standard Cleaning</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-slate-700">{titleCase(title)} Reason *</div>
            <textarea
              className="h-16 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder={block?.type === 'maintenance' ? 'Power outage in room' : 'write a description'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-slate-700">Additional text</div>
            <textarea
              className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder="write a description"
              value={additionalText}
              onChange={(e) => setAdditionalText(e.target.value)}
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
            <button type="button" className="h-11 rounded-xl bg-[#0B4EA2] text-sm font-semibold text-white">
              Ok
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
