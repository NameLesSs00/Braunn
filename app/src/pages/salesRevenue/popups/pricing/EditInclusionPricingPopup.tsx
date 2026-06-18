import { X, Save, Calendar } from 'lucide-react'

interface EditInclusionPricingPopupProps {
  onClose: () => void
}

export function EditInclusionPricingPopup({ onClose }: EditInclusionPricingPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#004bb4]">
          <h2 className="text-xl font-bold text-white tracking-wide">Edit Inclusion Pricing</h2>
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
              <select 
                defaultValue="Half Board (HB)"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-slate-50 cursor-not-allowed"
                disabled
              >
                <option>Half Board (HB)</option>
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Room Type</label>
              <select 
                defaultValue="Double Room"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-slate-50 cursor-not-allowed"
                disabled
              >
                <option>Double Room</option>
              </select>
            </div>

            {/* Adult Supplement */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Adult Supplement (PP)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-semibold">$</span>
                <input 
                  type="number" 
                  defaultValue={35}
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
                  defaultValue={18}
                  className="w-full border border-slate-200 rounded-lg pl-[34px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="status" defaultChecked className="w-4 h-4 text-[#004bb4] focus:ring-[#004bb4]" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="status" className="w-4 h-4 text-[#004bb4] focus:ring-[#004bb4]" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">Inactive</span>
                </label>
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
            <Save className="w-4 h-4" />
            Update Rates
          </button>
        </div>
      </div>
    </div>
  )
}
