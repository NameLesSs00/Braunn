import { useState, useRef } from 'react'
import { MoreVertical, Users, BadgeDollarSign } from 'lucide-react'
import type { Room, RoomStatus } from '../utils/types'
import { roomStatusTheme, roomStatusIcon } from '../utils/helpers'

const STATUS_OPTIONS: RoomStatus[] = ['Clean', 'Dirty', 'In Progress', 'Maintenance']

interface RoomCardProps {
  room: Room
  onStatusChange: (id: string, status: RoomStatus) => void
}

export function RoomCard({ room, onStatusChange }: RoomCardProps) {
  const theme = roomStatusTheme(room.status)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <div className={`flex flex-col rounded-2xl border-2 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${theme.card}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-slate-800">Room {room.number}</span>
        <div className="relative">
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-8 z-10 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Set status
              </div>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] hover:bg-slate-50 ${s === room.status ? 'font-semibold text-[#0B4EA2]' : 'text-slate-700'}`}
                  onClick={() => {
                    onStatusChange(room.id, s)
                    setMenuOpen(false)
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sub-info */}
      <div className="mt-1 text-[12px] text-slate-500">
        {room.type} - Floor {room.floor}
      </div>

      {/* Status badge */}
      <div className={`mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold ${theme.icon}`}>
        {roomStatusIcon(room.status)}
        {room.status}
      </div>

      {/* Details */}
      <div className="mt-4 space-y-1.5 text-[12px]">
        <div className="flex items-center justify-between text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Capacity:
          </span>
          <span className="font-semibold text-slate-700">{room.capacity === '---' ? '---' : `${room.capacity} guests`}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span className="flex items-center gap-1.5">
            <BadgeDollarSign className="h-3.5 w-3.5" /> Rate:
          </span>
          <span className="font-semibold text-slate-700">{room.rate === '---' ? '---' : `$${room.rate}/night`}</span>
        </div>
      </div>

      {/* Update button */}
      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        onClick={() => setMenuOpen((v) => !v)}
      >
        Update Status
      </button>
    </div>
  )
}
