import { X, Building, Users, Calendar, Utensils, CheckCircle2 } from 'lucide-react'

interface InclusionDetailsPopupProps {
  onClose: () => void
  data?: {
    room: string
    inclusion: string
    adultSupplement: string
    childSupplement: string
    status: string
  }
}

export function InclusionDetailsPopup({ onClose, data }: InclusionDetailsPopupProps) {
  // Use provided data or fallback to a default example
  const displayData = data || {
    room: 'Double Room',
    inclusion: 'Half Board (HB)',
    adultSupplement: '35',
    childSupplement: '18',
    status: 'Active'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in scale-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-[#004bb4]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Inclusion Details</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{displayData.inclusion}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-400">
                <Building className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Room Type</span>
              </div>
              <p className="text-[15px] font-bold text-slate-800">{displayData.room}</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Status</span>
              </div>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                {displayData.status}
              </span>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              <div className="pr-4">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase">Adult Supplement</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800">${displayData.adultSupplement}</span>
                  <span className="text-xs text-slate-400 font-medium">/night</span>
                </div>
              </div>
              <div className="pl-6">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase">Child Supplement</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[#10b981]">${displayData.childSupplement}</span>
                  <span className="text-xs text-slate-400 font-medium">/night</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Validity Period</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
              <div className="text-center flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">From</p>
                <p className="text-sm font-bold text-slate-700">Jan 01, 2025</p>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-4" />
              <div className="text-center flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">To</p>
                <p className="text-sm font-bold text-slate-700">Dec 31, 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 text-sm font-bold text-white bg-[#004bb4] hover:bg-blue-800 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-200"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}
