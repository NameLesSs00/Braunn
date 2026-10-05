import type { PmsRoom } from '../../../../models/PmsRoom'

type Props = {
  rooms: PmsRoom[]
}

export function RoomManagementTable({ rooms }: Props) {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* Scrollable table container */}
      <div className="flex-1 overflow-auto rounded-t-xl">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="sticky top-0 z-10 bg-slate-50 text-[13px] font-semibold text-slate-700 shadow-sm">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Room Number</th>
              <th className="px-6 py-4 border-b border-slate-200">Room Type Name</th>
              <th className="px-6 py-4 border-b border-slate-200">Floor</th>
              <th className="px-6 py-4 border-b border-slate-200">Ownership Type</th>
              <th className="px-6 py-4 border-b border-slate-200">Management Type</th>
              <th className="px-6 py-4 border-b border-slate-200">Owner Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No rooms found matching your criteria.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr
                  key={room.id}
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {room.roomNumber}
                  </td>
                  <td className="px-6 py-4">
                    {room.roomTypeName || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {room.floor}
                  </td>
                  <td className="px-6 py-4">
                    {room.ownershipType === 'HotelOwned' ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Hotel Owned
                      </span>
                    ) : room.ownershipType === 'OwnerOwned' ? (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        Owner Owned
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {room.managementType === 'HotelManaged' ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Hotel Managed
                      </span>
                    ) : room.managementType === 'OwnerManaged' ? (
                      <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                        Owner Managed
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {room.ownerName ? (
                      <span className="text-slate-800">{room.ownerName}</span>
                    ) : (
                      <span className="text-slate-400 italic">Hotel Owned</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
