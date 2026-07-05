import { useEffect, useState, useMemo } from 'react'
import { X, Search, Loader2, ChevronDown } from 'lucide-react'
import { Modal } from '../../shared/ui/Modal'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchRooms, fetchRoomsAvailability } from '../../features/rooms/roomsSlice'
import { assignRoom } from '../../features/ops/opsSlice'
import type { PmsReservationDetails } from '../../models/PmsReservation'

type Props = {
  open: boolean
  onClose: () => void
  reservation: PmsReservationDetails
}

export function AllocateRoomModal({ open, onClose, reservation }: Props) {
  const dispatch = useAppDispatch()
  const rooms = useAppSelector((s) => s.rooms.items)
  const roomsAvailability = useAppSelector((s) => s.rooms.availability)
  const roomsAvailabilityStatus = useAppSelector((s) => s.rooms.availabilityStatus)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('select')
  const [selectedFloor, setSelectedFloor] = useState('select')
  const [selectedStatus, setSelectedStatus] = useState('select')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    if (open) {
      void dispatch(fetchRooms())
      void dispatch(fetchRoomsAvailability({
        StartDate: reservation.checkInDate.split('T')[0],
        EndDate: reservation.checkOutDate.split('T')[0],
        RoomTypeId: ''
      }))
      setSelectedRoomId(null)
      setSearchQuery('')
      setSelectedRoomType('select')
      setSelectedFloor('select')
      setSelectedStatus('select')
    }
  }, [open, dispatch, reservation.checkInDate, reservation.checkOutDate])

  const filteredRooms = useMemo(() => {
    if (roomsAvailabilityStatus !== 'succeeded') return []
    const availableRoomIds = new Set(roomsAvailability.map(r => r.roomId))
    let result = rooms.filter(r => availableRoomIds.has(r.id))

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(r => r.roomNumber.toLowerCase().includes(q))
    }
    if (selectedRoomType !== 'select') {
      result = result.filter(r => r.roomTypeName?.toLowerCase().includes(selectedRoomType.toLowerCase()))
    }
    if (selectedFloor !== 'select') {
      result = result.filter(r => r.roomNumber.startsWith(selectedFloor))
    }
    return result
  }, [rooms, roomsAvailability, roomsAvailabilityStatus, searchQuery, selectedRoomType, selectedFloor])

  const handleAssign = async () => {
    if (!selectedRoomId) return
    setIsAssigning(true)
    const room = rooms.find(r => r.id === selectedRoomId)
    try {
      await dispatch(assignRoom({
        reservationId: reservation.id,
        roomNumber: room?.roomNumber || ''
      })).unwrap()
      onClose()
    } catch (e) {
      alert('Failed to assign room: ' + e)
    } finally {
      setIsAssigning(false)
    }
  }

  const formatDate = (dateStr: string) => dateStr ? dateStr.replace('T', ' ').split(' ')[0] : '—'

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="flex flex-col bg-white overflow-hidden rounded-2xl pointer-events-auto"
        style={{ width: 'min(1100px, calc(100vw - 32px))', height: 'min(88vh, 900px)' }}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-8 py-5">
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>Allocate Room</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Reservation summary */}
          <div className="mx-6 mt-6 mb-6 rounded-xl bg-slate-50 px-6 py-5 border border-slate-100">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 16 }}>
              RESERVATION DETAILS
            </p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 3 }}>Guest Name</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{reservation.guestName}</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 3 }}>Room Type</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{reservation.roomTypeName || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 3 }}>Check-In</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{formatDate(reservation.checkInDate)}</p>
              </div>
              <div>
                <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 3 }}>Check-Out</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{formatDate(reservation.checkOutDate)}</p>
              </div>
            </div>
          </div>

          {/* Filters row */}
          <div className="mx-6 mb-6 grid gap-3 items-end" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            {/* Search - no label so we push it down to align with dropdowns */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'transparent', marginBottom: 4, userSelect: 'none' }}>_</p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search room number..."
                  style={{ height: 40, fontSize: 13, color: '#374151', borderRadius: 8, border: '1px solid #E5E7EB', paddingLeft: 36, paddingRight: 12, width: '100%', outline: 'none', backgroundColor: 'white' }}
                />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Room Type</p>
              <div className="relative">
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  style={{ height: 40, width: '100%', fontSize: 13, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, paddingLeft: 12, paddingRight: 32, outline: 'none', appearance: 'none', backgroundColor: 'white' }}
                >
                  <option value="select">select</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Floor */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Floor</p>
              <div className="relative">
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  style={{ height: 40, width: '100%', fontSize: 13, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, paddingLeft: 12, paddingRight: 32, outline: 'none', appearance: 'none', backgroundColor: 'white' }}
                >
                  <option value="select">select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Room Status */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Room Status</p>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ height: 40, width: '100%', fontSize: 13, color: '#374151', border: '1px solid #E5E7EB', borderRadius: 8, paddingLeft: 12, paddingRight: 32, outline: 'none', appearance: 'none', backgroundColor: 'white' }}
                >
                  <option value="select">select</option>
                  <option value="Vacant Clean">Vacant Clean</option>
                  <option value="Vacant Dirty">Vacant Dirty</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Available Rooms label */}
          <div className="mx-6 mb-4 flex items-center justify-between">
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', color: '#6B7280' }}>
              AVAILABLE ROOMS ({filteredRooms.length})
            </p>
            {roomsAvailabilityStatus === 'loading' && (
              <span className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: 13 }}>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </span>
            )}
          </div>

          {/* Room cards grid */}
          <div className="mx-6 mb-6 grid grid-cols-2 gap-3">
            {filteredRooms.map((room) => {
              const isSelected = selectedRoomId === room.id
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                  className="relative text-left transition-all"
                  style={{
                    borderRadius: 12,
                    border: isSelected ? '2px solid #1E3A8A' : '2px solid #A7F3D0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#ECFDF5',
                    padding: '16px 16px 16px 16px',
                    height: 130,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{room.roomNumber}</span>
                    <div className="flex items-center gap-1.5">
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>Vacant Clean</span>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 2 }}>Floor {room.roomNumber.charAt(0)}</p>
                    <p style={{ fontSize: 14, color: '#374151' }}>{room.roomTypeName || 'Standard'}</p>
                  </div>

                  {isSelected && (
                    <div
                      className="absolute bottom-3 right-3 flex items-center justify-center"
                      style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#1E3A8A' }}
                    >
                      <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}

            {filteredRooms.length === 0 && roomsAvailabilityStatus === 'succeeded' && (
              <div className="col-span-2 py-12 text-center" style={{ color: '#9CA3AF', fontSize: 14 }}>
                No available rooms match your criteria.
              </div>
            )}

            {roomsAvailabilityStatus === 'idle' || roomsAvailabilityStatus === 'loading' ? (
              <div className="col-span-2 py-12 text-center" style={{ color: '#9CA3AF', fontSize: 14 }}>
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-300" />
                Fetching available rooms...
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 px-8 py-4"
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isAssigning}
            style={{ padding: '9px 20px', fontSize: 14, fontWeight: 500, color: '#6B7280', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: 'white', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedRoomId || isAssigning}
            style={{
              padding: '9px 24px',
              fontSize: 14,
              fontWeight: 500,
              color: 'white',
              borderRadius: 8,
              border: 'none',
              backgroundColor: selectedRoomId && !isAssigning ? '#1E3A8A' : '#CBD5E1',
              cursor: selectedRoomId && !isAssigning ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isAssigning ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</> : 'Confirm Selection'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
