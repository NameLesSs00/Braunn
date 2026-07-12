import { Home, Loader2, Sparkles, X } from 'lucide-react'

import type { PmsReservation, RoomChangeType } from '../../../models/PmsReservation'
import type { RoomAvailability } from '../../../models/Room'
import type { RoomType } from '../../../models/RoomType'
import type { MoveRoomContext } from './MoveRoomModal'
import { formatMoney } from '../CheckInProcessModal/utils'

type Props = {
  reservation: PmsReservation
  context: MoveRoomContext
  roomTypes: RoomType[]
  roomTypesLoading: boolean
  rooms: RoomAvailability[]
  roomsLoading: boolean
  roomsError: string | null
  loadingContext: boolean
  contextError: string | null
  changeType: RoomChangeType
  setChangeType: (value: RoomChangeType) => void
  selectedRoomTypeId: string
  setSelectedRoomTypeId: (value: string) => void
  selectedRoomId: string | null
  setSelectedRoomId: (value: string | null) => void
  evaluating: boolean
  evaluationError: string | null
  onCancel: () => void
  onContinue: () => void
}

const changeTypeOptions: Array<{ value: RoomChangeType; label: string }> = [
  { value: 'OperationalMove', label: 'Operational Move' },
  { value: 'Upgrade', label: 'Upgrade' },
  { value: 'Downgrade', label: 'Downgrade' },
]

function formatDate(isoString?: string | null) {
  if (!isoString) return 'N/A'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-[13px] font-semibold text-slate-800">{value || 'N/A'}</div>
    </div>
  )
}

export function MoveRoomStep1({
  reservation,
  context,
  roomTypes,
  roomTypesLoading,
  rooms,
  roomsLoading,
  roomsError,
  loadingContext,
  contextError,
  changeType,
  setChangeType,
  selectedRoomTypeId,
  setSelectedRoomTypeId,
  selectedRoomId,
  setSelectedRoomId,
  evaluating,
  evaluationError,
  onCancel,
  onContinue,
}: Props) {
  const canContinue = Boolean(context.reservationRoomId && selectedRoomId && changeType) && !evaluating && !loadingContext

  return (
    <>
      <div className="relative bg-[#0B4EA2] px-8 py-5">
        <div className="text-xl font-semibold text-white">Room Change</div>
        <div className="mt-1 text-sm text-white/90">Select a room and evaluate the policy before confirming</div>
        <button
          type="button"
          className="absolute right-6 top-6 grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          onClick={onCancel}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 bg-slate-50 p-8 text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 text-sm font-bold text-slate-800">Reservation Details</div>
          {loadingContext ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading reservation details...
            </div>
          ) : contextError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{contextError}</div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
              <InfoItem label="Guest Name" value={reservation.guestName || 'N/A'} />
              <InfoItem label="Current Room" value={context.currentRoomNumber || reservation.roomNumber || 'N/A'} />
              <InfoItem label="Current Room Type" value={context.currentRoomTypeName || reservation.roomTypeName || 'N/A'} />
              <InfoItem label="Effective Date" value={formatDate(context.effectiveDate)} />
              <InfoItem label="Check-out Date" value={formatDate(context.checkoutDate)} />
              <InfoItem label="Booking Source" value={reservation.channelName || reservation.bookingSource || 'N/A'} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Change Type</label>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
              value={changeType}
              onChange={(event) => setChangeType(event.target.value as RoomChangeType)}
            >
              {changeTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Room Type</label>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#0B4EA2]"
              value={selectedRoomTypeId}
              onChange={(event) => setSelectedRoomTypeId(event.target.value)}
              disabled={roomTypesLoading}
            >
              <option value="">{roomTypesLoading ? 'Loading room types...' : 'Select room type'}</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-1 text-sm font-bold text-slate-800">Select New Room</div>
          <div className="mb-4 text-xs text-slate-500">
            Availability is checked from {formatDate(context.effectiveDate)} to {formatDate(context.checkoutDate)}.
          </div>

          {!selectedRoomTypeId ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Select a room type to load available rooms.
            </div>
          ) : roomsLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading available rooms...
            </div>
          ) : roomsError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{roomsError}</div>
          ) : rooms.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No available rooms match this room type and date range.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <label
                  key={room.roomId}
                  className={[
                    'relative flex cursor-pointer flex-col rounded-xl border bg-white p-4 transition-all hover:border-[#0B4EA2] hover:shadow-md',
                    selectedRoomId === room.roomId ? 'border-[#0B4EA2] bg-[#F4F9FF]' : 'border-slate-200',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="selectedRoom"
                    checked={selectedRoomId === room.roomId}
                    onChange={() => setSelectedRoomId(room.roomId)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 text-[#0B4EA2]">
                    <Home className="h-5 w-5" />
                    <span className="text-lg font-bold">{room.roomNumber || 'N/A'}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500">{room.roomTypeName || 'N/A'}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-800">{formatMoney(room.basePrice || 0, reservation.currency || 'EUR')}/nt</div>
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {evaluationError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{evaluationError}</div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-8 py-5">
        <button
          type="button"
          className="h-11 rounded-xl border border-[#0B4EA2] px-8 text-sm font-semibold text-[#0B4EA2] transition-colors hover:bg-blue-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#093d81] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onContinue}
          disabled={!canContinue}
        >
          {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {evaluating ? 'Evaluating...' : 'Continue'}
        </button>
      </div>
    </>
  )
}
