import { X, ChevronDown } from 'lucide-react'

interface AddRoomTypePopupProps {
  onClose: () => void;
}

export function AddRoomTypePopup({ onClose }: AddRoomTypePopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 fade-in p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] scale-in">
        {/* Header */}
        <div className="bg-[#004bb4] text-white px-6 py-5 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Add Room Type</h2>
            <p className="text-blue-100 text-sm mt-1">Create a new room type with pricing and amenities</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-5">Basic Information</h3>
            <div className="grid grid-cols-2 gap-6 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Deluxe Suite" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type Code</label>
                <input 
                  type="text" 
                  placeholder="e.g., DLX" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea 
                placeholder="Brief description of the room type" 
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
          </section>

          {/* Occupancy */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-5">Occupancy</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Adults</label>
                <input 
                  type="number" 
                  defaultValue={2}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Children</label>
                <input 
                  type="number" 
                  defaultValue={0}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Occupancy</label>
                <input 
                  type="number" 
                  defaultValue={2}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-[#fafafa] text-slate-500 font-medium"
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* Room Details */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-5">Room Details</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Room view</label>
              <div className="relative">
                <select 
                  defaultValue="" 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-slate-500 font-medium"
                >
                  <option value="" disabled>select</option>
                  <option value="city">City View</option>
                  <option value="sea">Sea View</option>
                  <option value="garden">Garden View</option>
                </select>
                <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </section>

          {/* Status */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-5">Status</h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-6 rounded-full flex items-center p-0.5 cursor-pointer transition-colors bg-[#004bb4]">
                <div className="w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform translate-x-5"></div>
              </div>
              <span className="text-sm font-semibold text-slate-800">Active - Visible in booking and pricing</span>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-5 bg-[#fbfcfd] flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button className="px-6 py-2.5 bg-[#004bb4] text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-[0_4px_10px_-2px_rgba(0,75,180,0.5)]">
            save Room Type
          </button>
        </div>
      </div>
    </div>
  )
}
