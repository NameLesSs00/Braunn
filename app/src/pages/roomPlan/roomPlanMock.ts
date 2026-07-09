export type RoomType = 'single' | 'double' | 'suite' | 'deluxe'

export type RoomStatus = 'available' | 'confirmed' | 'checked_in' | 'maintained' | 'cleaning' | 'dirty'

export type BookingType = '' | 'Direct' | 'OTA' | 'Corporate'

export type HousekeepingStatus = 'clean' | 'dirty'

export type RoomView = 'sea_view' | 'pool_view' | 'city_view' | 'garden_view'

export type RoomPlanRoom = {
  id: string
  number: string
  type: RoomType
  status: RoomStatus
  floor: string
  bookingType: BookingType
  housekeeping: HousekeepingStatus
  view: RoomView
}

export type RoomPlanBlockType = 'reservation' | 'cleaning' | 'maintenance'

export type RoomPlanBlock = {
  id: string
  reservationId?: string
  reservationStatus?: string | null
  roomId: string
  type: RoomPlanBlockType
  title: string
  subtitle?: string
  checkInDate?: string
  checkOutDate?: string
  start: string // ISO date (YYYY-MM-DD)
  end: string // ISO date (YYYY-MM-DD), inclusive
}

const pad2 = (n: number) => String(n).padStart(2, '0')

const iso = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const seededRand = (seed: number) => {
  let s = seed
  return () => {
    // xorshift32
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 10000) / 10000
  }
}

export function makeMockRooms(total: number): RoomPlanRoom[] {
  const types: RoomType[] = ['single', 'double', 'suite', 'deluxe']
  const statuses: RoomStatus[] = ['available', 'confirmed', 'checked_in', 'maintained', 'cleaning', 'dirty']
  const bookingTypes: BookingType[] = ['Direct', 'OTA', 'Corporate']
  const housekeeping: HousekeepingStatus[] = ['clean', 'dirty']
  const views: RoomView[] = ['sea_view', 'pool_view', 'city_view', 'garden_view']

  const rooms: RoomPlanRoom[] = []
  for (let i = 0; i < total; i += 1) {
    const roomNumber = 101 + i
    const floor = String(Math.floor(roomNumber / 100))
    const r = seededRand(roomNumber * 99991)

    rooms.push({
      id: String(roomNumber),
      number: String(roomNumber),
      type: types[Math.floor(r() * types.length)]!,
      status: statuses[Math.floor(r() * statuses.length)]!,
      floor,
      bookingType: bookingTypes[Math.floor(r() * bookingTypes.length)]!,
      housekeeping: housekeeping[Math.floor(r() * housekeeping.length)]!,
      view: views[Math.floor(r() * views.length)]!,
    })
  }

  return rooms
}

export function makeMockBlocks(rooms: RoomPlanRoom[], anchorDate = new Date(2026, 0, 1)): RoomPlanBlock[] {
  const guestNames = ['Emma Johnson', 'John Smith', 'Olivia Davis', 'Michael Brown', 'William Wilson', 'Noah Miller']

  const blocks: RoomPlanBlock[] = []

  for (let i = 0; i < rooms.length; i += 1) {
    const room = rooms[i]!
    const r = seededRand(Number(room.number) * 1337)

    // ~35% rooms have a reservation block around the anchor week
    if (r() < 0.35) {
      const startOffset = Math.floor(r() * 5) - 2 // -2..2
      const len = 1 + Math.floor(r() * 3) // 1..3
      const start = new Date(anchorDate)
      start.setDate(start.getDate() + startOffset)
      const end = new Date(start)
      end.setDate(end.getDate() + len)

      const guest = guestNames[Math.floor(r() * guestNames.length)]!
      blocks.push({
        id: `res-${room.id}`,
        roomId: room.id,
        type: 'reservation',
        title: guest,
        subtitle: `${start.toLocaleString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`,
        start: iso(start),
        end: iso(end),
      })
    }

    // Some rooms have cleaning/maintenance banners
    if (r() < 0.15) {
      const start = new Date(anchorDate)
      start.setDate(start.getDate() + Math.floor(r() * 4) - 1)
      const end = new Date(start)
      end.setDate(end.getDate() + Math.floor(r() * 2))

      blocks.push({
        id: `clean-${room.id}`,
        roomId: room.id,
        type: 'cleaning',
        title: 'Cleaning',
        start: iso(start),
        end: iso(end),
      })
    }

    if (r() < 0.1) {
      const start = new Date(anchorDate)
      start.setDate(start.getDate() + Math.floor(r() * 3) - 1)
      const end = new Date(start)
      end.setDate(end.getDate() + 4)

      blocks.push({
        id: `maint-${room.id}`,
        roomId: room.id,
        type: 'maintenance',
        title: 'Maintenance',
        start: iso(start),
        end: iso(end),
      })
    }
  }

  return blocks
}
