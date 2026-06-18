import { X, Users, Maximize } from 'lucide-react'

interface ViewRoomTypePopupProps {
  onClose: () => void;
  // room: any; // Would take room object in real implementation
}

export function ViewRoomTypePopup({ onClose }: ViewRoomTypePopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 fade-in p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-in">
        {/* Header */}
        <div className="bg-[#004bb4] text-white px-6 py-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Standard Room</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                Active
              </span>
            </div>
            <p className="text-blue-100 mt-2">Comfortable standard room with modern amenities</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-slate-800 font-bold mb-1">Room Type Name</p>
              <p className="text-slate-500">Standard Room</p>
            </div>
            <div>
              <p className="text-slate-800 font-bold mb-1">Status</p>
              <p className="text-slate-500">Active</p>
            </div>
          </div>

          <div>
            <p className="text-slate-800 font-bold mb-1">Description</p>
            <p className="text-slate-500 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Occupancy Card */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
              <Users className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <p className="text-slate-500 text-sm mb-1">Max Occupancy</p>
                <p className="text-slate-800 font-bold">2 Adults</p>
              </div>
            </div>

            {/* Room Code Card */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 flex items-start gap-4">
              <span className="text-orange-500 font-bold mt-0.5 uppercase tracking-wide">STD</span>
              <div>
                <p className="text-slate-500 text-sm mb-1">Room Type Code</p>
                <p className="text-slate-800 font-bold">STD</p>
              </div>
            </div>

            {/* Room View Card */}
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-5 flex items-start gap-4">
              <Maximize className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <p className="text-slate-500 text-sm mb-1">Room view</p>
                <p className="text-slate-800 font-bold">sea view</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
