import { useEffect, useMemo, useState } from 'react'
import { Sparkles, ClipboardList, Plus, Wrench, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchHousekeepingRooms } from '../../features/housekeeping/housekeepingSlice'
import { fetchLostAndFoundItems } from '../../features/HKfeatures/lostAndFound/lostAndFoundSlice'

// Components
import { StatCard } from './components/StatCard'
import { RoomStatusTab } from './components/RoomStatusTab'

// Shared FoundsAndLost components
import { LostFoundGrid } from '../HKPages/foundsAndLost/components/LostFoundGrid'
import { LostFoundControls } from '../HKPages/foundsAndLost/components/LostFoundControls'
import { LostFoundStats } from '../HKPages/foundsAndLost/components/LostFoundStats'
import { AddLostFoundModal } from '../HKPages/foundsAndLost/components/modals/AddLostFoundModal'
import { ItemDetailsModal } from '../HKPages/foundsAndLost/components/modals/ItemDetailsModal'
import type { LostAndFoundReadDto } from '../../models/HKmodels/LostAndFound'

// Utils
import { ROOMS } from './utils/mockData'
import { mapHousekeepingStatus } from './utils/helpers'
import type { Room, RoomStatus, TabKey } from './utils/types'

export function HousekeepingPage() {
  // Tab state
  const [tab, setTab] = useState<TabKey>('roomStatus')

  // Redux & external data
  const dispatch = useAppDispatch()
  const housekeepingRooms = useAppSelector((s: any) => s.housekeeping.rooms)
  const { items, totalCount, status: lostFoundStatus } = useAppSelector((state: any) => state.lostAndFound)

  // Room Status state
  const [rooms, setRooms] = useState<Room[]>(ROOMS)

  // Lost & Found filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'All' | 'unclaimed' | 'claimed'>('All')
  
  // Modals state
  const [isAddLostItemOpen, setIsAddLostItemOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LostAndFoundReadDto | null>(null)

  // Fetch rooms when tab changes
  useEffect(() => {
    if (tab !== 'roomStatus') return
    void dispatch(fetchHousekeepingRooms(undefined))
  }, [dispatch, tab])

  // Fetch lost and found items when tab changes
  useEffect(() => {
    if (tab !== 'lostItems') return
    
    // Determine the IsClaimed boolean based on the segment filter
    const isClaimedParam = filter === 'All' ? undefined : filter === 'claimed';
    
    // Fetch data whenever query or filter changes
    dispatch(fetchLostAndFoundItems({
      PageNumber: 1,
      PageSize: 50,
      Search: searchQuery || undefined,
      IsClaimed: isClaimedParam,
    }));
  }, [dispatch, tab, searchQuery, filter])

  // Sync redux data to local state
  useEffect(() => {
    if (!housekeepingRooms || housekeepingRooms.length === 0) return

    setRooms(
      housekeepingRooms.map((r: any) => ({
        id: r.roomId,
        number: r.roomNumber,
        type: r.roomTypeName,
        floor: r.floor,
        status: mapHousekeepingStatus(r.housekeepingStatus),
        capacity: '---',
        rate: '---',
      })),
    )
  }, [housekeepingRooms])

  // Calculate room statistics
  const stats = useMemo(() => ({
    clean:       rooms.filter((r) => r.status === 'Clean').length,
    dirty:       rooms.filter((r) => r.status === 'Dirty').length,
    inProgress:  rooms.filter((r) => r.status === 'In Progress').length,
    maintenance: rooms.filter((r) => r.status === 'Maintenance').length,
  }), [rooms])

  // Handle room status changes
  const handleStatusChange = (id: string, status: RoomStatus) => {
    // In a real app, this would persist to backend
    // For now, rooms array is not updated since it's mock data
    console.log(`Status change for room ${id}: ${status}`)
  }

  const unclaimedCount = items?.filter((i: any) => !i.isClaimed).length || 0;
  const claimedCount = items?.filter((i: any) => i.isClaimed).length || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Housekeeping</h1>
        <p className="mt-1 text-sm text-slate-500">Manage rooms and track lost & found items</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          count={stats.clean}
          label="Clean"
          sub="Ready to occupy"
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
          count={stats.inProgress}
          label="In Progress"
          sub="Being cleaned"
          bg="border-blue-200 bg-blue-50"
          iconBg="bg-blue-500 text-white"
          icon={<Clock className="h-4 w-4 text-white" />}
          textColor="text-blue-700"
          subColor="text-blue-500"
        />
        <StatCard
          count={stats.maintenance}
          label="Maintenance"
          sub="Under repair"
          bg="border-orange-200 bg-orange-50"
          iconBg="bg-orange-500 text-white"
          icon={<Wrench className="h-4 w-4 text-white" />}
          textColor="text-orange-700"
          subColor="text-orange-500"
        />
      </div>

      {/* Tabs + content */}
      <div className="rounded-2xl bg-white shadow-sm">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6">
          <div className="flex">
            {(
              [
                { key: 'roomStatus', label: 'Room Status',  Icon: Sparkles      },
                { key: 'lostItems',  label: 'Lost Items',   Icon: ClipboardList },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={[
                  'inline-flex items-center gap-2 border-b-2 px-1 py-4 mr-6 text-sm font-semibold transition-colors',
                  tab === key
                    ? 'border-[#0B4EA2] text-[#0B4EA2]'
                    : 'border-transparent text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Lost Items CTA */}
          {tab === 'lostItems' && (
            <button
              type="button"
              onClick={() => setIsAddLostItemOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a3f85] transition-colors"
            >
              <Plus className="h-4 w-4" />
              add item
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Room Status Tab */}
          {tab === 'roomStatus' && (
            <RoomStatusTab rooms={rooms} onStatusChange={handleStatusChange} />
          )}

          {/* Lost Items Tab */}
          {tab === 'lostItems' && (
            <div className="flex flex-col gap-6">
              <LostFoundStats 
                totalCount={totalCount} 
                unclaimedCount={unclaimedCount}
                claimedCount={claimedCount}
              />
              
              <LostFoundControls 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filter={filter}
                setFilter={setFilter}
              />
              
              {lostFoundStatus === 'loading' ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B4EA2]"></div>
                </div>
              ) : (
                <LostFoundGrid 
                  items={items || []}
                  onItemClick={(item) => setSelectedItem(item)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ItemDetailsModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <AddLostFoundModal
        isOpen={isAddLostItemOpen}
        onClose={() => setIsAddLostItemOpen(false)}
      />
    </div>
  )
}
