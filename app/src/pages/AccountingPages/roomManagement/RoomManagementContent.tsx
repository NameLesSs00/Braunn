import { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchPmsRooms } from '../../../features/pmsRooms/pmsRoomsSlice'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { RoomManagementTable } from './components/RoomManagementTable'
import type { RoomOwnershipType, RoomManagementType } from '../../../models/Room'

export function RoomManagementContent() {
  const dispatch = useAppDispatch()
  
  // Select data from the shared pmsRooms slice
  const {
    items,
    status,
    error,
    totalPages
  } = useAppSelector((state) => state.pmsRooms)

  // Local state for filters
  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [ownershipType, setOwnershipType] = useState<RoomOwnershipType | ''>('')
  const [managementType, setManagementType] = useState<RoomManagementType | ''>('')
  const [floor, setFloor] = useState<number | ''>('')
  const [roomTypeId, setRoomTypeId] = useState<string>('')

  // Room types for dropdown
  const { items: roomTypesList } = useAppSelector((state) => state.roomTypes)

  useEffect(() => {
    dispatch(fetchRoomTypes())
  }, [dispatch])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedSearch !== search) {
        setDebouncedSearch(search)
        setPageNumber(1) // Reset page on new search
      }
    }, 400)
    return () => clearTimeout(handler)
  }, [search, debouncedSearch])

  // Fetch data when filters change
  useEffect(() => {
    dispatch(fetchPmsRooms({
      pageNumber,
      pageSize: 10,
      search: debouncedSearch || undefined,
      ownershipType: ownershipType || undefined,
      managementType: managementType || undefined,
      floor: floor !== '' ? floor : undefined,
      roomTypeId: roomTypeId || undefined
    }))
  }, [dispatch, pageNumber, debouncedSearch, ownershipType, managementType, floor, roomTypeId])

  const handleOwnershipChange = (val: string) => {
    setOwnershipType(val as RoomOwnershipType | '')
    setPageNumber(1)
  }

  const handleManagementChange = (val: string) => {
    setManagementType(val as RoomManagementType | '')
    setPageNumber(1)
  }

  const hasPreviousPage = pageNumber > 1
  const hasNextPage = pageNumber < totalPages

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 flex h-full flex-col pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Room Management</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage room allocations, ownership details, and management types.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
          />
        </div>

        {/* Ownership Type Filter */}
        <div className="w-full max-w-[200px]">
          <select
            value={ownershipType}
            onChange={(e) => handleOwnershipChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
          >
            <option value="">All Ownerships</option>
            <option value="HotelOwned">Hotel Owned</option>
            <option value="OwnerOwned">Owner Owned</option>
          </select>
        </div>

        {/* Management Type Filter */}
        <div className="w-full max-w-[200px]">
          <select
            value={managementType}
            onChange={(e) => handleManagementChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
          >
            <option value="">All Managements</option>
            <option value="HotelManaged">Hotel Managed</option>
            <option value="OwnerManaged">Owner Managed</option>
          </select>
        </div>

        {/* Room Type Filter */}
        <div className="w-full max-w-[200px]">
          <select
            value={roomTypeId}
            onChange={(e) => {
              setRoomTypeId(e.target.value)
              setPageNumber(1)
            }}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
          >
            <option value="">All Room Types</option>
            {roomTypesList.map(rt => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
        </div>

        {/* Floor Filter */}
        <div className="w-full max-w-[150px]">
          <input
            type="number"
            placeholder="Floor"
            value={floor}
            onChange={(e) => {
              setFloor(e.target.value === '' ? '' : Number(e.target.value))
              setPageNumber(1)
            }}
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
        {status === 'loading' && items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-slate-500">Loading rooms...</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-rose-500">Error: {error}</p>
          </div>
        ) : (
          <>
            <RoomManagementTable rooms={items} />

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                <p className="text-sm text-slate-600">
                  Page <span className="font-semibold text-slate-900">{pageNumber}</span> of{' '}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPageNumber(p => p - 1)}
                    disabled={!hasPreviousPage}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPageNumber(p => p + 1)}
                    disabled={!hasNextPage}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
