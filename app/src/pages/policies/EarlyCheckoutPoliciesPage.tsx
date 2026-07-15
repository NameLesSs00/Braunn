import { PoliciesTabNav } from './components/PoliciesTabNav'
import { Clock } from 'lucide-react'

export function EarlyCheckoutPoliciesPage() {
  return (
    <div className="flex flex-col gap-0">
      <PoliciesTabNav />
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4 mt-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-600">Early Checkout Policies</p>
          <p className="text-sm mt-1 text-slate-400">This section is coming soon.</p>
        </div>
      </div>
    </div>
  )
}
