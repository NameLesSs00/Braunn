import { useState, useMemo } from 'react'
import { Search, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import type { Room, RoomStatus, StatusFilter } from '../utils/types'
import { RoomCard } from './RoomCard'
import { Pill } from './Pill'

interface RoomStatusTabProps {
  rooms: Room[]
  onStatusChange: (id: string, status: RoomStatus) => void
}

export function RoomStatusTab({ rooms, onStatusChange }: RoomStatusTabProps) {
  const [roomQuery, setRoomQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All Rooms')

  const filteredRooms = useMemo(() => {
    let result = [...rooms]
    const q = roomQuery.trim().toLowerCase()
    if (q) result = result.filter((r) => r.number.includes(q))
    if (statusFilter !== 'All Rooms') result = result.filter((r) => r.status === statusFilter)
    return result
  }, [rooms, roomQuery, statusFilter])

  return (
    <div className="space-y-5">
      {/* Search + filter pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <input
            className="h-10 w-full rounded-full bg-[#F3F5FF] px-5 pr-11 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search room number..."
            value={roomQuery}
            onChange={(e) => setRoomQuery(e.target.value)}
          />
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-5">
          <Pill active={statusFilter === 'All Rooms'} onClick={() => setStatusFilter('All Rooms')}>
            All Rooms
          </Pill>
          <Pill active={statusFilter === 'Clean'} onClick={() => setStatusFilter('Clean')}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Clean
          </Pill>
          <Pill active={statusFilter === 'Dirty'} onClick={() => setStatusFilter('Dirty')}>
            <AlertCircle className="h-3.5 w-3.5" /> Dirty
          </Pill>
          <Pill active={statusFilter === 'In Progress'} onClick={() => setStatusFilter('In Progress')}>
            <Clock className="h-3.5 w-3.5" /> In Progress
          </Pill>
        </div>
      </div>

      {/* Room cards grid */}
      {filteredRooms.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">
          No rooms match your search
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}
