import { X, Home, Sparkles } from 'lucide-react'
import type { PmsReservation } from '../../../models/PmsReservation'

type Props = {
  reservation: PmsReservation
  movementReason: string
  moveConfig: 'remaining' | 'specific'
  specificDateFrom: string
  specificDateTo: string
  filterRoomType: string
  selectedRoomId: number | null
  notes: string
  setNotes: (val: string) => void
  onCancel: () => void
  onConfirm: () => void
}

function formatDate(isoString?: string) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

export function MoveRoomStep2(props: Props) {
  const {
    reservation, movementReason, moveConfig, specificDateFrom, specificDateTo,
    filterRoomType, selectedRoomId, notes, setNotes, onCancel, onConfirm
  } = props

  return (
    <>
      <div className="bg-[#0B4EA2] px-8 py-5 relative">
        <div className="text-xl font-semibold text-white">Confirm Room Move</div>
        <div className="mt-1 text-sm text-white/90">Please review the details before confirming</div>
        <button
          type="button"
          className="absolute right-6 top-6 grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          onClick={onCancel}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-8 text-slate-700 space-y-8 bg-slate-50">
        {/* Guest Information */}
        <div className="rounded-xl border border-slate-200 bg-[#F4F7FB] p-6 shadow-sm">
          <div className="text-base font-semibold text-slate-800 mb-4">Guest Information</div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm max-w-lg">
            <div className="text-slate-500">Name:</div>
            <div className="font-bold text-slate-800">{reservation.guestName || '—'}</div>
            <div className="text-slate-500">Confirmation ID:</div>
            <div className="font-bold text-slate-800">r1</div>
          </div>
        </div>

        {/* Movement Reason */}
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-800">Movement Reason</div>
          <select disabled className="appearance-none h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 outline-none cursor-default">
            <option>{movementReason}</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-800">
            {movementReason === 'Maintenance' ? 'Additional Notes' : 'Notes'}
          </div>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 outline-none placeholder:text-slate-400"
            placeholder="change view"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Room Change Summary */}
        <div>
          <div className="mb-3 text-sm font-semibold text-slate-800">Room Change Summary</div>
          <div className="flex items-center gap-6 max-w-3xl">
            {/* Old Room Card */}
            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-2 text-slate-400">
                <Home className="h-5 w-5" />
                <span className="text-xl font-bold text-slate-800">{reservation.roomNumber || '104'}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{reservation.roomTypeName || 'Single'}</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800">${reservation.totalAmount || 80}/nt</div>
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">To</div>

            {/* New Room Card */}
            <div className="flex-1 rounded-xl border border-[#0B4EA2] bg-[#F4F9FF] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#0B4EA2]">
                <Home className="h-5 w-5" />
                <span className="text-xl font-bold">{selectedRoomId}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{filterRoomType || 'Single'}</div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800">
                  ${movementReason === 'Maintenance' ? (reservation.totalAmount || 80) : 200}/nt
                </div>
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <div className="mb-3 text-sm font-semibold text-slate-800">Duration</div>
          <div className="flex items-center gap-6 max-w-3xl">
            <div className="flex-1">
              <div className="text-sm text-slate-500">Check-in Date</div>
              <div className="font-semibold text-slate-800">{formatDate(moveConfig === 'specific' ? specificDateFrom : reservation.checkInDate)}</div>
            </div>
            
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">To</div>

            <div className="flex-1">
              <div className="text-sm text-slate-500">Check-out Date</div>
              <div className="font-semibold text-slate-800">{formatDate(moveConfig === 'specific' ? specificDateTo : reservation.checkOutDate)}</div>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        {movementReason !== 'Maintenance' && (
          <div className="rounded-xl border border-red-400 bg-white p-6 shadow-sm">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Current Room Price:</span>
                <span className="font-bold text-slate-800">${reservation.totalAmount || 80}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">New Room Price:</span>
                <span className="font-bold text-slate-800">$200/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Price Difference per Night:</span>
                <span className="font-bold text-red-500">+$120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Number of Nights:</span>
                <span className="font-bold text-slate-800">3</span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between">
                <span className="text-base text-slate-800">Total Additional Amount:</span>
                <span className="text-base font-bold text-red-500">+$360</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                * Guest will be charged an additional $360 for the room upgrade
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Actions Step 2 */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5">
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
          onClick={onConfirm}
        >
          Confirm Move
        </button>
      </div>
    </>
  )
}
