import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { routes } from '../../../shared/lib/routes'

export function PurchaseSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-100 px-6">
        <Link to={routes.systems} className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-orange-600" />
          <span className="text-lg font-bold text-slate-800">Purchase</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Sidebar links will go here */}
      </div>
    </aside>
  )
}
