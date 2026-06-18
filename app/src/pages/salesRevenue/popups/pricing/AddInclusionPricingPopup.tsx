import { X, Plus, Calendar } from 'lucide-react'

interface AddInclusionPricingPopupProps {
  onClose: () => void
}

export function AddInclusionPricingPopup({ onClose }: AddInclusionPricingPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#004bb4]">
          <h2 className="text-xl font-bold text-white tracking-wide">Add Inclusions Pricing</h2>
          <button 
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* Inclusion Type */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Inclusion Type (Meal Plan)</label>
              <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white">
                <option>Bed Only (RO)</option>
                <option>Bed & Breakfast (BB)</option>
                <option>Half Board (HB)</option>
                <option>Full Board (FB)</option>
                <option>All Inclusive (AI)</option>
                <option>Ultra All Inclusive (UAI)</option>
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Room Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white">
                <option>All Room Types</option>
                <option>Single Room</option>
                <option>Double Room</option>
                <option>Twin Room</option>
                <option>Triple Room</option>
                <option>Suite</option>
              </select>
            </div>

            {/* Adult Supplement */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Adult Supplement (PP)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-semibold">$</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg pl-[34px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Child Supplement */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Child Supplement (PP)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-semibold">$</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-lg pl-[34px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Valid From</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="date" 
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Valid To */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Valid To</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="date" 
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#004bb4] hover:bg-blue-800 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Inclusion Rate
          </button>
        </div>
      </div>
    </div>
  )
}
