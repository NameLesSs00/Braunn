import { X, Calendar as CalendarIcon, ChevronDown, Save, Euro } from 'lucide-react'
 
import { Modal } from '../../../../shared/ui/Modal'

interface EditContractPopupProps {
  onClose: () => void;
  companyName: string;
}

export function EditContractPopup({ onClose, companyName }: EditContractPopupProps) {
  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-[#004bb4] p-6 text-white flex items-start justify-between rounded-t-xl shrink-0">
          <div>
            <h2 className="text-xl font-bold">Edit Contract Terms</h2>
            <p className="text-blue-100 mt-1 text-sm">{companyName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Contract Period */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
              <CalendarIcon className="w-5 h-5 text-[#004bb4]" />
              <h3>Contract Period</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="MM/DD/YY" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 cursor-pointer"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="MM/DD/YY" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 cursor-pointer"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Pricing Terms */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
              <Euro className="w-5 h-5 text-[#004bb4]" />
              <h3>Pricing Terms</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Negotiated Rate (per night)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                  <input 
                    type="number" 
                    placeholder="" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {/* Fake Native Spin Buttons for visual fidelity to design */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 cursor-pointer">
                    <ChevronDown className="w-3 h-3 rotate-180 mb-[-2px]" />
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    defaultValue="15" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Credit Limit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                  <input 
                    type="number" 
                    defaultValue="50000" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 cursor-pointer">
                    <ChevronDown className="w-3 h-3 rotate-180 mb-[-2px]" />
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Terms</label>
                <div className="relative">
                  <select className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                    <option>Net 15 day</option>
                    <option>Net 30 day</option>
                    <option>Net 60 day</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cancellation Policy</label>
              <div className="relative">
                <select className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
                  <option>Flexible (24h free cancellation)</option>
                  <option>Strict (No refund)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#004bb4] text-white rounded-xl hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

      </div>
    </Modal>
  )
}
