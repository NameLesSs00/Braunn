import { useState } from 'react'
import { Users, UserPlus, CheckCircle2 } from 'lucide-react'
import type { Room } from '../../../housekeeping/utils/types'
import { roomStatusTheme, roomStatusIcon } from '../../../housekeeping/utils/helpers'
import { AssignRoomModal } from './AssignRoomModal'
import { getHkmReceptionAssignments, completeHkmReceptionAssignment } from '../../../../shared/HKshared/api/hkmReceptionAssignmentsApi'
import { useAppDispatch } from '../../../../store/hooks'
import { fetchAllRooms } from '../../../../features/housekeeping/housekeepingSlice'

interface RoomCardHKProps {
  room: Room
}

export function RoomCardHK({ room }: RoomCardHKProps) {
  const theme = roomStatusTheme(room.status)
  const dispatch = useAppDispatch()
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  const handleMarkCompleted = async () => {
    setIsCompleting(true)
    try {
      // Find the assignment for this room
      const res = await getHkmReceptionAssignments({ PageSize: 200 })
      // Assuming the most recent one for this room is the active one
      const assignment = res.items.find(a => a.roomId === room.id)
      
      if (!assignment) {
        alert('Could not find active assignment for this room.')
        setIsCompleting(false)
        return
      }

      await completeHkmReceptionAssignment(assignment.id)
      // Refresh room statuses
      dispatch(fetchAllRooms())
    } catch (e: any) {
      console.error('Failed to complete room:', e)
      alert(e.message || 'Failed to complete assignment')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <>
      <div className={`flex flex-col rounded-2xl border-2 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${theme.card}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-800">Room {room.number}</span>
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
        <div className="mt-4 space-y-1.5 text-[12px] flex-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Capacity:
            </span>
            <span className="font-semibold text-slate-700">{room.capacity === '---' ? '---' : `${room.capacity} guests`}</span>
          </div>
        </div>

        {/* Actions based on status */}
        <div className="mt-4">
          {room.status === 'Dirty' && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-[13px] font-bold text-rose-700 transition-colors hover:bg-rose-100"
              onClick={() => setIsAssignModalOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Assign Room
            </button>
          )}

          {room.status === 'Cleaning' && (
            <button
              type="button"
              disabled={isCompleting}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-[13px] font-bold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
              onClick={handleMarkCompleted}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isCompleting ? 'Completing...' : 'Mark as Completed'}
            </button>
          )}
          
          {room.status === 'Available' && (
            <div className="py-2.5 text-center text-[13px] font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
              Ready
            </div>
          )}
        </div>
      </div>

      <AssignRoomModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        roomId={room.id}
        roomNumber={room.number}
      />
    </>
  )
}
