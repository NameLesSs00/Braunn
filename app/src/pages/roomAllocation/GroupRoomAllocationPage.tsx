import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Search, Sparkles, Users } from 'lucide-react'
import { routes } from '../../shared/lib/routes'

type Guest = {
  id: number
  name: string
  roomType: string
  roomNumber?: string
}

type Room = {
  id: number
  number: string
  floor: string
  type: string
  preAssignedTo?: string
}

const guests: Guest[] = [
  { id: 1, name: 'Michael Brown', roomType: 'Double' },
  { id: 2, name: 'Michael Brown', roomType: 'Double' },
  { id: 3, name: 'Michael Brown', roomType: 'Double' },
  { id: 4, name: 'Michael Brown', roomType: 'Double' },
  { id: 5, name: 'Michael Brown', roomType: 'Double' },
  { id: 6, name: 'Michael Brown', roomType: 'Double' },
  { id: 7, name: 'Michael Brown', roomType: 'Double' },
  { id: 8, name: 'Sarah Johnson', roomType: 'Double', roomNumber: '105' },
]

const rooms: Room[] = [
  { id: 101, number: '101', floor: 'Floor 1', type: 'Single' },
  { id: 102, number: '102', floor: 'Floor 1', type: 'Single' },
  { id: 103, number: '103', floor: 'Floor 1', type: 'Single' },
  { id: 104, number: '104', floor: 'Floor 1', type: 'Single' },
  { id: 105, number: '105', floor: 'Floor 1', type: 'Single', preAssignedTo: 'Sarah Johnson' },
  { id: 106, number: '106', floor: 'Floor 1', type: 'Single' },
  { id: 107, number: '107', floor: 'Floor 1', type: 'Single' },
  { id: 108, number: '108', floor: 'Floor 1', type: 'Single' },
  { id: 109, number: '109', floor: 'Floor 1', type: 'Single', preAssignedTo: 'Sarah Johnson' },
]

function GuestRow({ guest }: { guest: Guest }) {
  const isAssigned = Boolean(guest.roomNumber)

  return (
    <button
      type="button"
      className="flex min-h-[74px] w-full items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 text-left transition-colors hover:border-[#0B4EA2]/30 hover:bg-[#F8FBFF]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
        <Users className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-800">{guest.name}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{guest.roomType}</span>
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {isAssigned ? (
          <>
            <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-sm font-medium text-[#075CFF]">
              Room {guest.roomNumber}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#075CFF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2D7DFF]" />
              Pre-Assigned
            </span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Not Assigned
          </span>
        )}
      </span>
    </button>
  )
}

function RoomCard({ room }: { room: Room }) {
  return (
    <button
      type="button"
      className="min-h-[146px] rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[26px] font-bold leading-none text-slate-800">{room.number}</div>
        <div className="mt-1 inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Vacant Clean
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-500">{room.floor}</div>
      <div className="mt-2 text-base text-slate-700">{room.type}</div>

      {room.preAssignedTo ? (
        <div className="mt-7 w-[78%] rounded bg-[#D9E8FF] px-2 py-1 text-xs text-[#075CFF]">
          Pre-assigned: {room.preAssignedTo}
        </div>
      ) : null}
    </button>
  )
}

export function GroupRoomAllocationPage() {
  const [query, setQuery] = useState('')

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rooms
    return rooms.filter((room) => room.number.includes(q) || room.type.toLowerCase().includes(q))
  }, [query])

  const assignedCount = guests.filter((guest) => guest.roomNumber).length
  const unassignedCount = guests.length - assignedCount

  const selectClass =
    'h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-500 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10'

  return (
    <div className="pb-10">
      <div className="mb-5 px-1">
        <Link
          to={routes.roomAllocation}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Room Allocation
        </Link>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="text-[24px] font-bold text-slate-800">Group Room Allocation</h2>
            <div className="mt-2 flex flex-wrap items-center gap-7 text-sm text-slate-500">
              <span>Corporate Group - ABC Inc.</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>12/18/2025 - 12/22/2025</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="font-semibold text-emerald-600">{assignedCount} Assigned</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="font-semibold text-orange-600">{unassignedCount} Unassigned</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#0B4EA2] bg-white px-4 text-sm font-semibold text-[#0B4EA2] transition-colors hover:bg-[#EEF4FF]"
            >
              <Sparkles className="h-4 w-4" />
              Auto Assign Rooms
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#0B4EA2] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#093d81]"
            >
              Confirm Allocation
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[396px_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="mb-8 text-[15px] text-slate-800">Select a guest then choose an available room</p>
            <h3 className="mb-4 text-base font-bold text-slate-800">Guests List ({guests.length})</h3>
            <div className="space-y-5">
              {guests.map((guest) => (
                <GuestRow key={guest.id} guest={guest} />
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1.4fr)_minmax(140px,0.85fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)]">
              <div className="relative self-end">
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-10 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
                  placeholder="Search room number..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {['Room Type', 'Floor', 'Room Status'].map((label) => (
                <label key={label} className="space-y-2">
                  <span className="block text-xs font-medium text-slate-700">{label}</span>
                  <span className="relative block">
                    <select className={selectClass} defaultValue="">
                      <option value="">select</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </span>
                </label>
              ))}
            </div>

            <h3 className="mt-8 text-base font-semibold uppercase text-slate-500">
              Available Rooms ({filteredRooms.length})
            </h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
