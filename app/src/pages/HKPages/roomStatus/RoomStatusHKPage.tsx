import { useEffect, useMemo } from 'react'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchAllRooms } from '../../../features/housekeeping/housekeepingSlice'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { useState } from 'react'

import { StatCard } from '../../housekeeping/components/StatCard'
import { RoomStatusHKTab } from './components/RoomStatusHKTab'
import { mapHousekeepingStatus } from '../../housekeeping/utils/helpers'
import type { Room } from '../../housekeeping/utils/types'

export function RoomStatusHKPage() {
  const dispatch = useAppDispatch()
  const pmsRooms = useAppSelector((s: any) => s.housekeeping.pmsRooms)
  const roomTypes = useAppSelector((s: any) => s.roomTypes.items)

  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    void dispatch(fetchAllRooms())
    void dispatch(fetchRoomTypes())
  }, [dispatch])

  useEffect(() => {
    if (!pmsRooms || pmsRooms.length === 0) {
      setRooms([])
      return
    }
    setRooms(
      pmsRooms.map((r: any) => {
        const typeMatch = roomTypes.find((rt: any) => rt.id === r.roomTypeId)
        return {
          id: r.id,
          number: r.roomNumber,
          type: r.roomTypeName,
          floor: r.floor,
          status: mapHousekeepingStatus(r.status),
          capacity: typeMatch ? typeMatch.maxGuests : '---',
        }
      }),
    )
  }, [pmsRooms, roomTypes])

  const stats = useMemo(
    () => ({
      available:   rooms.filter((r) => r.status === 'Available').length,
      dirty:       rooms.filter((r) => r.status === 'Dirty').length,
      cleaning:    rooms.filter((r) => r.status === 'Cleaning').length,
    }),
    [rooms],
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Room Status</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor and manage all room statuses</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          count={stats.available}
          label="Available"
          sub="Ready for guests"
          bg="border-emerald-200 bg-emerald-50"
          iconBg="bg-emerald-500 text-white"
          icon={<CheckCircle2 className="h-4 w-4 text-white" />}
          textColor="text-emerald-700"
          subColor="text-emerald-500"
        />
        <StatCard
          count={stats.dirty}
          label="Dirty"
          sub="Awaiting cleaning"
          bg="border-rose-200 bg-rose-50"
          iconBg="bg-rose-500 text-white"
          icon={<AlertCircle className="h-4 w-4 text-white" />}
          textColor="text-rose-700"
          subColor="text-rose-500"
        />
        <StatCard
          count={stats.cleaning}
          label="Cleaning"
          sub="Being cleaned"
          bg="border-blue-200 bg-blue-50"
          iconBg="bg-blue-500 text-white"
          icon={<Clock className="h-4 w-4 text-white" />}
          textColor="text-blue-700"
          subColor="text-blue-500"
        />
      </div>

      {/* Room grid */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="p-6">
          <RoomStatusHKTab rooms={rooms} />
        </div>
      </div>
    </div>
  )
}
