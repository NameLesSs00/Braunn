import { useEffect, useMemo, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { getRoomsAvailability, getRooms } from '../../../shared/apis/roomsApi'
import { getHkmReceptionAssignments } from '../../../shared/HKshared/api/hkmReceptionAssignmentsApi'

import { StatCard } from '../../housekeeping/components/StatCard'
import { RoomStatusHKTab } from './components/RoomStatusHKTab'
import { mapHousekeepingStatus } from '../../housekeeping/utils/helpers'
import type { Room, RoomStatus } from '../../housekeeping/utils/types'

const getTodayStr = () => new Date().toISOString().slice(0, 10)
const getOffsetDateStr = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function RoomStatusHKPage() {
  const dispatch = useAppDispatch()
  const roomTypes = useAppSelector((s: any) => s.roomTypes.items)

  const [startDate, setStartDate] = useState(getTodayStr)
  const [endDate, setEndDate] = useState(() => getOffsetDateStr(2))
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    void dispatch(fetchRoomTypes())
  }, [dispatch])

  const loadRoomsData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [availRes, catalogRes, assignmentsRes] = await Promise.allSettled([
        getRoomsAvailability({ StartDate: startDate, EndDate: endDate, IncludeDirty: true }),
        getRooms({ pageSize: 1000 }),
        getHkmReceptionAssignments({ PageSize: 200 }),
      ])

      const availRooms = availRes.status === 'fulfilled' ? availRes.value : []
      const catalogRooms = catalogRes.status === 'fulfilled' ? catalogRes.value.items : []
      const assignments = assignmentsRes.status === 'fulfilled' ? assignmentsRes.value.items : []

      const catalogMap = new Map(catalogRooms.map((r) => [r.id, r]))
      const assignmentMap = new Map(assignments.map((a) => [a.roomId, a]))

      if (availRooms.length > 0) {
        setRooms(
          availRooms.map((ar) => {
            const cat = catalogMap.get(ar.roomId)
            const typeMatch = roomTypes.find(
              (rt: any) => rt.id === ar.roomTypeId || rt.name?.toLowerCase() === ar.roomTypeName?.toLowerCase()
            )
            const assignment = assignmentMap.get(ar.roomId)

            let status: RoomStatus = 'Available'
            const hkRaw = ar.housekeepingStatus
            if (
              hkRaw === 2 ||
              hkRaw === '2' ||
              String(hkRaw).toLowerCase() === 'dirty'
            ) {
              status = 'Dirty'
            } else if (
              hkRaw === 3 ||
              hkRaw === '3' ||
              String(hkRaw).toLowerCase() === 'inprogress' ||
              Boolean(assignment)
            ) {
              status = 'Cleaning'
            } else {
              status = 'Available'
            }

            return {
              id: ar.roomId,
              number: ar.roomNumber,
              type: ar.roomTypeName,
              floor: cat?.floor ?? 1,
              status,
              capacity: typeMatch ? typeMatch.maxGuests : '---',
              rate: ar.basePrice ?? 0,
            }
          })
        )
      } else {
        setRooms(
          catalogRooms.map((r) => {
            const typeMatch = roomTypes.find((rt: any) => rt.id === r.roomTypeId)
            const assignment = assignmentMap.get(r.id)
            let status = mapHousekeepingStatus(r.status)
            if (assignment) status = 'Cleaning'
            return {
              id: r.id,
              number: r.roomNumber,
              type: r.roomTypeName,
              floor: r.floor,
              status,
              capacity: typeMatch ? typeMatch.maxGuests : '---',
              rate: 0,
            }
          })
        )
      }
    } catch (err) {
      console.error('Failed to load room availability for housekeeping:', err)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate, roomTypes])

  useEffect(() => {
    void loadRoomsData()
  }, [loadRoomsData])

  const stats = useMemo(
    () => ({
      available: rooms.filter((r) => r.status === 'Available').length,
      dirty:     rooms.filter((r) => r.status === 'Dirty').length,
      cleaning:  rooms.filter((r) => r.status === 'Cleaning').length,
    }),
    [rooms]
  )

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Status</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage room cleanliness by inspection period
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-200 w-fit">
          <Calendar className="h-4 w-4" />
          <span>Period: {startDate} to {endDate}</span>
        </div>
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
          sub="Awaiting cleaning assignment"
          bg="border-rose-200 bg-rose-50"
          iconBg="bg-rose-500 text-white"
          icon={<AlertCircle className="h-4 w-4 text-white" />}
          textColor="text-rose-700"
          subColor="text-rose-500"
        />
        <StatCard
          count={stats.cleaning}
          label="Cleaning"
          sub="Assignment in progress"
          bg="border-blue-200 bg-blue-50"
          iconBg="bg-blue-500 text-white"
          icon={<Clock className="h-4 w-4 text-white" />}
          textColor="text-blue-700"
          subColor="text-blue-500"
        />
      </div>

      {/* Room grid tab with Date Period Picker & Filters */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100">
        <div className="p-6">
          <RoomStatusHKTab
            rooms={rooms}
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
            isLoading={isLoading}
            onRefresh={loadRoomsData}
          />
        </div>
      </div>
    </div>
  )
}
