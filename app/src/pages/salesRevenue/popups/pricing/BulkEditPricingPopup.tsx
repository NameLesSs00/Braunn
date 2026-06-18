import { X, Calendar, Plus, Minus } from 'lucide-react'

interface BulkEditPricingPopupProps {
  onClose: () => void
}

export function BulkEditPricingPopup({ onClose }: BulkEditPricingPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#004bb4]">
          <h2 className="text-xl font-bold text-white tracking-wide">Bulk Edit Pricing</h2>
          <button 
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Select Room Types */}
          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-3">Select Room Types</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center border border-slate-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-[14px] font-medium text-slate-700">Standard Room</span>
              </label>
              <label className="flex items-center border border-slate-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-[14px] font-medium text-slate-700">Deluxe Suite</span>
              </label>
              <label className="flex items-center border border-slate-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-[14px] font-medium text-slate-700">Single Room</span>
              </label>
              <label className="flex items-center border border-slate-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-[14px] font-medium text-slate-700">Family Suite</span>
              </label>
              <label className="flex items-center border border-slate-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-[14px] font-medium text-slate-700">Executive Suite</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* Valid From */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Valid From</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="text" 
                  defaultValue="1/12/2025"
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
                  type="text" 
                  defaultValue="1/30/2025"
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Adjustment Types (Actions) */}
          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-2">Adjustment Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button className="flex items-center justify-center gap-2 border-[1.5px] border-[#10b981] bg-[#ecfdf5] text-[#10b981] rounded-lg px-4 py-2.5 font-semibold text-[14px] transition-colors">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Increase
              </button>
              <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 rounded-lg px-4 py-2.5 font-semibold text-[14px] hover:bg-slate-50 transition-colors">
                <Minus className="w-4 h-4" strokeWidth={2.5} />
                Decrease
              </button>
              <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-600 rounded-lg px-4 py-2.5 font-semibold text-[14px] hover:bg-slate-50 transition-colors">
                Set Fixed Price
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* Adjustment Value */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Adjustment Value</label>
              <input 
                type="number" 
                defaultValue={10}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
              />
            </div>

            {/* Adjustment Type (Second Dropdown) */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Adjustment Type</label>
              <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white cursor-pointer">
                <option>Percentage %</option>
                <option>Fixed Amount $</option>
              </select>
            </div>
          </div>

          {/* Preview Box */}
          <div className="bg-[#f8fafc] border border-blue-100 rounded-xl p-5 mt-2 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-700 mb-2">Preview</h3>
            <p className="text-[14px] font-medium text-slate-600 leading-relaxed">
              Will increase prices for <strong className="text-[#004bb4]">1 room type(s)</strong> by <strong className="text-[#004bb4]">10%</strong> from <strong className="text-[#004bb4]">2025-12-01</strong> to <strong className="text-[#004bb4]">2025-12-31</strong>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white flex justify-end gap-3 mt-1">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#004bb4] hover:bg-blue-800 rounded-lg transition-colors shadow-sm"
          >
            Add Pricing
          </button>
        </div>
      </div>
    </div>
  )
}
