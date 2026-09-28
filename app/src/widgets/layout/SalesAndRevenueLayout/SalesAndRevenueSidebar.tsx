import { TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'

export function SalesAndRevenueSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <Link to={routes.systems} className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          <span className="text-lg font-bold text-slate-800">Sales & Revenue</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Sidebar links will go here */}
      </div>
    </aside>
  )
}
