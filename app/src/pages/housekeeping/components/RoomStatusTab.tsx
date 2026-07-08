import { useState, useMemo } from 'react'
import { Search, CheckCircle2, AlertCircle, Clock, Wrench, Home, Key } from 'lucide-react'
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
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('All')

  const uniqueRoomTypes = useMemo(() => {
    const types = new Set(rooms.map((r) => r.type).filter(Boolean))
    return Array.from(types).sort()
  }, [rooms])

  const filteredRooms = useMemo(() => {
    let result = [...rooms]
    const q = roomQuery.trim().toLowerCase()
    if (q) result = result.filter((r) => r.number.includes(q))
    if (roomTypeFilter !== 'All') result = result.filter((r) => r.type === roomTypeFilter)
    if (statusFilter !== 'All Rooms') result = result.filter((r) => r.status === statusFilter)
    return result
  }, [rooms, roomQuery, statusFilter, roomTypeFilter])

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

        {/* Room Type Filter */}
        <select
          value={roomTypeFilter}
          onChange={(e) => setRoomTypeFilter(e.target.value)}
          className="h-10 rounded-full bg-[#F3F5FF] px-4 pr-10 text-sm text-slate-700 outline-none border-none appearance-none"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
        >
          <option value="All">All Room Types</option>
          {uniqueRoomTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-5">
          <Pill active={statusFilter === 'All Rooms'} onClick={() => setStatusFilter('All Rooms')}>
            All Rooms
          </Pill>
          <Pill active={statusFilter === 'Available'} onClick={() => setStatusFilter('Available')}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Available
          </Pill>
          <Pill active={statusFilter === 'Confirmed'} onClick={() => setStatusFilter('Confirmed')}>
            <Home className="h-3.5 w-3.5" /> Confirmed
          </Pill>
          <Pill active={statusFilter === 'CheckedIn'} onClick={() => setStatusFilter('CheckedIn')}>
            <Key className="h-3.5 w-3.5" /> CheckedIn
          </Pill>
          <Pill active={statusFilter === 'Dirty'} onClick={() => setStatusFilter('Dirty')}>
            <AlertCircle className="h-3.5 w-3.5" /> Dirty
          </Pill>
          <Pill active={statusFilter === 'Cleaning'} onClick={() => setStatusFilter('Cleaning')}>
            <Clock className="h-3.5 w-3.5" /> Cleaning
          </Pill>
          <Pill active={statusFilter === 'Maintenance'} onClick={() => setStatusFilter('Maintenance')}>
            <Wrench className="h-3.5 w-3.5" /> Maintenance
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
