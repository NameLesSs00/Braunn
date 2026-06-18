import { Download } from 'lucide-react'

const roomTypes = [
  { name: 'Deluxe Suite', revenue: '€28,350', roomsSold: '45/50', occupancy: 90 },
  { name: 'Standard Double', revenue: '€35,240', roomsSold: '68/80', occupancy: 85 },
  { name: 'Single Room', revenue: '€18,720', roomsSold: '52/70', occupancy: 74 },
  { name: 'Family Suite', revenue: '€14,940', roomsSold: '18/25', occupancy: 72 },
]

export function RoomTypePerformance() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Room Type Performance</h3>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {roomTypes.map((room) => (
          <div key={room.name} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div>
              <div className="text-sm font-medium text-slate-800">{room.name}</div>
              <div className="mt-1 text-xs text-slate-500">{room.roomsSold} rooms sold</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">{room.revenue}</div>
              <div className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                {room.occupancy}% occupied
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
