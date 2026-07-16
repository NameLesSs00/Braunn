import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, CreditCard, MapPin } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchPmsReservationById } from '../../features/pms/pmsSlice'
import { routes } from '../../shared/lib/routes'
import { AllocateRoomModal } from '../../widgets/roomAllocation/AllocateRoomModal'

function getDifferenceInDays(date1: string, date2: string): number {
  if (!date1 || !date2) return 0
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export function RoomAllocationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  
  const reservation = useAppSelector((s) => s.pms.selected)
  const status = useAppSelector((s) => s.pms.detailStatus)
  
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      void dispatch(fetchPmsReservationById(id))
    }
  }, [dispatch, id])

  if (status === 'loading') {
    return <div className="p-8 text-center text-slate-500">Loading reservation...</div>
  }

  if (!reservation) {
    return <div className="p-8 text-center text-slate-500">Reservation not found.</div>
  }

  const reservationRooms = reservation.reservationRooms ?? []
  const hasTopLevelRoom = Boolean(reservation.roomNumber && reservation.roomNumber !== 'N/A')
  const requiredRoomCount = reservationRooms.length || 1
  const assignedRoomCount = reservationRooms.length
    ? reservationRooms.filter((room) => Boolean(room.roomId || (room.roomNumber && room.roomNumber !== 'N/A'))).length
    : hasTopLevelRoom ? 1 : 0
  const isAllocated = assignedRoomCount === requiredRoomCount
  const paymentStatus = reservation.paidAmount >= reservation.totalAmount ? 'Fully Paid' : reservation.paidAmount > 0 ? 'deposit paid' : 'Unpaid'
  const nights = getDifferenceInDays(reservation.checkInDate, reservation.checkOutDate)

  return (
    <div className="w-full flex flex-col pt-2 pb-10">
      {/* Header Section */}
      <div className="mb-6">
        <Link
          to={routes.roomAllocation}
          className="inline-flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Room Allocation
        </Link>
      </div>

      <div className="mb-8 border-b border-[#E5E7EB] pb-6">
        <h1 className="text-[24px] font-bold text-slate-800 tracking-tight">Reservation Details</h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium text-[#1D4ED8]">
            {reservation.status.toLowerCase()}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-[12px] font-medium text-[#059669]">
            {paymentStatus.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 items-start">
        {/* Left Column (Cards) */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Guest Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 flex items-center gap-3 text-[15px] font-bold text-slate-800">
              <Users className="h-4 w-4 text-slate-500" />
              Guest Information
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <div className="mb-1 text-[12px] text-slate-500">Guest Name</div>
                <div className="text-[14px] font-medium text-slate-800">{reservation.guestName}</div>
              </div>
              <div>
                <div className="mb-1 text-[12px] text-slate-500">Email</div>
                <div className="text-[14px] font-medium text-slate-800">{reservation.guest?.email || '—'}</div>
              </div>
              <div>
                <div className="mb-1 text-[12px] text-slate-500">Phone</div>
                <div className="text-[14px] font-medium text-slate-800">{reservation.guest?.phone || '—'}</div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 flex items-center gap-3 text-[15px] font-bold text-slate-800">
              <Calendar className="h-4 w-4 text-slate-500" />
              Stay Details
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="mb-1 text-[12px] text-slate-500">Check-In</div>
                <div className="text-[14px] font-medium text-slate-800">{reservation.checkInDate.split('T')[0]}</div>
              </div>
              <div>
                <div className="mb-1 text-[12px] text-slate-500">Check-Out</div>
                <div className="text-[14px] font-medium text-slate-800">{reservation.checkOutDate.split('T')[0]}</div>
              </div>
              <div>
                <div className="mb-1 text-[12px] text-slate-500">Nights</div>
                <div className="text-[14px] font-medium text-slate-800">{nights} nights</div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 flex items-center gap-3 text-[15px] font-bold text-slate-800">
              <CreditCard className="h-4 w-4 text-slate-500" />
              Payment Summary
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-500">Total Amount</span>
                <span className="text-[14px] font-bold text-slate-800">${reservation.totalAmount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-slate-500">Payment Status</span>
                <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-[12px] font-medium text-[#059669]">
                  {paymentStatus.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Room Allocation */}
        <div className="w-[320px] shrink-0 xl:w-[380px]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 min-h-[400px]">
            <h2 className="mb-8 flex items-start gap-3 text-[16px] font-bold text-slate-800">
              <MapPin className="h-4 w-4 text-slate-500 mt-1" />
              <div className="leading-[1.2]">
                Room<br />Allocation
              </div>
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="mb-1 text-[12px] text-slate-500">Room Type</div>
                <div className="text-[14px] font-medium text-slate-800">{reservation.roomTypeName || '—'}</div>
              </div>
              
              <div>
                <div className="mb-2 text-[12px] text-[#6B7280]">Allocation Status</div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F3F4F6] px-3 py-1.5 text-[12px] font-medium text-[#4B5563]">
                  <span className={`h-1.5 w-1.5 rounded-full ${isAllocated ? 'bg-[#10B981]' : 'bg-[#9CA3AF]'}`} />
                  {isAllocated ? `Allocated (${assignedRoomCount}/${requiredRoomCount})` : `Missing Rooms (${assignedRoomCount}/${requiredRoomCount})`}
                </div>
              </div>

              {reservationRooms.length > 0 ? (
                <div className="space-y-2">
                  <div className="mb-1 text-[12px] text-slate-500">Required Rooms</div>
                  {reservationRooms.map((room, index) => (
                    <div key={room.reservationRoomId} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-semibold text-slate-700">Room {index + 1}</span>
                        <span className="text-[12px] font-semibold text-slate-500">{room.roomNumber || 'Not assigned'}</span>
                      </div>
                      <div className="mt-1 text-[12px] text-slate-500">{room.roomTypeName || reservation.roomTypeName || 'Room Type'}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full rounded-lg bg-[#0B4EA2] py-2.5 text-[14px] font-medium text-white transition-all hover:bg-[#093d81] active:scale-[0.98]"
                  onClick={() => setModalOpen(true)}
                >
                  {isAllocated ? 'Manage Rooms' : 'Allocate Rooms'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <AllocateRoomModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAssigned={() => {
            if (id) void dispatch(fetchPmsReservationById(id))
          }}
          reservation={reservation}
        />
      )}
    </div>
  )
}
