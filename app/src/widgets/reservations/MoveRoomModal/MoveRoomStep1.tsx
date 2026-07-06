import { X, Home, Sparkles } from 'lucide-react'
import type { PmsReservation } from '../../../models/PmsReservation'

type Props = {
  reservation: PmsReservation
  movementReason: string
  setMovementReason: (val: string) => void
  moveConfig: 'remaining' | 'specific'
  setMoveConfig: (val: 'remaining' | 'specific') => void
  specificDateFrom: string
  setSpecificDateFrom: (val: string) => void
  specificDateTo: string
  setSpecificDateTo: (val: string) => void
  filterFloor: string
  setFilterFloor: (val: string) => void
  filterRoomType: string
  setFilterRoomType: (val: string) => void
  filterRoomView: string
  setFilterRoomView: (val: string) => void
  selectedRoomId: number | null
  setSelectedRoomId: (val: number | null) => void
  onCancel: () => void
  onContinue: () => void
}

function formatDate(isoString?: string) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

export function MoveRoomStep1(props: Props) {
  const {
    reservation, movementReason, setMovementReason,
    moveConfig, setMoveConfig, specificDateFrom, setSpecificDateFrom,
    specificDateTo, setSpecificDateTo, filterFloor, setFilterFloor,
    filterRoomType, setFilterRoomType, filterRoomView, setFilterRoomView,
    selectedRoomId, setSelectedRoomId, onCancel, onContinue
  } = props

  return (
    <>
      <div className="bg-[#0B4EA2] px-8 py-5 relative">
        <div className="text-xl font-semibold text-white">Room Move</div>
        <div className="mt-1 text-sm text-white/90">Select a new room and configure the move details</div>
        <button
          type="button"
          className="absolute right-6 top-6 grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          onClick={onCancel}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-8 text-slate-700 space-y-8 bg-slate-50">
        {/* Reservation Details */}
        <div className="rounded-xl border border-slate-200 bg-[#F4F7FB] p-6 shadow-sm">
          <div className="text-base font-semibold text-slate-800 mb-4">Reservation Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
            <div>
              <div className="text-slate-500 mb-1">Guest Name</div>
              <div className="font-medium">{reservation.guestName || '—'}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Room Type</div>
              <div className="font-medium">{reservation.roomTypeName || '—'}</div>
            </div>
            
            <div>
              <div className="text-slate-500 mb-1">Check-in Date</div>
              <div className="font-medium">{formatDate(reservation.checkInDate)}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Room view</div>
              <div className="font-medium">Garden view</div>
            </div>

            <div>
              <div className="text-slate-500 mb-1">Check-out Date</div>
              <div className="font-medium">{formatDate(reservation.checkOutDate)}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Number of Guests</div>
              <div className="font-medium">adult : 1</div>
            </div>

            <div>
              <div className="text-slate-500 mb-1">Total Amount</div>
              <div className="font-medium">${reservation.totalAmount?.toFixed(2) || '0.00'}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Rate plan</div>
              <div className="font-medium">Breakfast</div>
            </div>

            <div>
              <div className="text-slate-500 mb-1">Booking source</div>
              <div className="font-medium">{reservation.channelName || 'Phone'}</div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">Companions</div>
              <div className="text-slate-400">No companion</div>
            </div>
          </div>
        </div>

        {/* Movement Reason */}
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-700">
            Movement Reason <span className="text-red-500">*</span>
          </div>
          <select
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
            value={movementReason}
            onChange={(e) => setMovementReason(e.target.value)}
          >
            <option value="" disabled>Select</option>
            <option value="Client request">Client request</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        {/* Move Configuration */}
        <div>
          <div className="mb-3 text-sm font-bold text-slate-800">Move Configuration</div>
          <div className="space-y-4">
            <label 
              className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${moveConfig === 'remaining' ? 'border-[#0B4EA2] bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              onClick={() => setMoveConfig('remaining')}
            >
              <div className="flex items-center gap-3">
                <div className={`grid h-4 w-4 place-items-center rounded-full border ${moveConfig === 'remaining' ? 'border-[#0B4EA2]' : 'border-slate-300'}`}>
                  {moveConfig === 'remaining' && <div className="h-2 w-2 rounded-full bg-[#0B4EA2]" />}
                </div>
                <div className="text-sm font-semibold text-slate-800">Move for Remaining Stay</div>
                <div className="text-sm text-slate-500">Guest will be moved to the new room from now until checkout ({formatDate(reservation.checkOutDate)})</div>
              </div>
            </label>

            <label 
              className={`flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${moveConfig === 'specific' ? 'border-[#0B4EA2] bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              onClick={() => setMoveConfig('specific')}
            >
              <div className="flex items-center gap-3">
                <div className={`grid h-4 w-4 place-items-center rounded-full border ${moveConfig === 'specific' ? 'border-[#0B4EA2]' : 'border-slate-300'}`}>
                  {moveConfig === 'specific' && <div className="h-2 w-2 rounded-full bg-[#0B4EA2]" />}
                </div>
                <div className="text-sm font-semibold text-slate-800">Move for Specific Dates</div>
                <div className="text-sm text-slate-500">Choose custom check-in and check-out dates for the new room</div>
              </div>
              {moveConfig === 'specific' && (
                <div className="ml-7 mt-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-600">Date From</div>
                    <input
                      type="date"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none bg-white"
                      value={specificDateFrom}
                      onChange={(e) => setSpecificDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-600">Date To</div>
                    <input
                      type="date"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none bg-white"
                      value={specificDateTo}
                      onChange={(e) => setSpecificDateTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Filter Rooms */}
        <div>
          <div className="mb-3 text-sm font-bold text-slate-800">Filter Rooms</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">Floor</div>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
              >
                <option value="" disabled>select</option>
                <option value="1">1st Floor</option>
                <option value="2">2nd Floor</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">Room Type</div>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
                value={filterRoomType}
                onChange={(e) => setFilterRoomType(e.target.value)}
              >
                <option value="" disabled>select</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">Room view</div>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none"
                value={filterRoomView}
                onChange={(e) => setFilterRoomView(e.target.value)}
              >
                <option value="" disabled>select</option>
                <option value="Sea">Sea View</option>
                <option value="Garden">Garden View</option>
              </select>
            </div>
          </div>

          {/* Mock Room Selection Card */}
          {filterFloor && filterRoomType && filterRoomView && (
            <div className="mt-8">
              <div className="mb-1 text-sm font-semibold text-slate-800">Select New Room</div>
              <div className="mb-4 text-xs text-slate-500">Available&Clean (6)</div>
              <div className="flex flex-wrap gap-4">
                {[101, 103, 104, 105].map((rm) => (
                  <label key={rm} className="relative flex cursor-pointer flex-col w-[180px] rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#0B4EA2] hover:shadow-md">
                    <input 
                      type="radio" 
                      name="selectedRoom" 
                      checked={selectedRoomId === rm} 
                      onChange={() => setSelectedRoomId(rm)}
                      className="peer absolute opacity-0" 
                    />
                    <div className="absolute inset-0 rounded-xl border border-transparent peer-checked:border-[#0B4EA2] peer-checked:bg-[#F4F9FF]"></div>
                    <div className="relative z-10 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[#0B4EA2]">
                        <Home className="h-5 w-5" />
                        <span className="text-lg font-bold">{rm}</span>
                      </div>
                      <div className="text-xs text-slate-500">Single</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm font-bold text-slate-800">$80/nt</div>
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions Step 1 */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-8 py-5">
        <button
          type="button"
          className="h-11 rounded-xl border border-[#0B4EA2] px-8 text-sm font-semibold text-[#0B4EA2] transition-colors hover:bg-blue-50"
          onClick={onCancel}
        >
          cancel
        </button>
        <button
          type="button"
          className="h-11 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#093d81]"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </>
  )
}
