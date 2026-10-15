import { NavLink, useNavigate } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'
import { IoHomeOutline } from 'react-icons/io5'
import { FiTruck, FiShoppingCart, FiCreditCard, FiCalendar, FiFileText, FiRepeat } from 'react-icons/fi'
import { LayoutGrid } from 'lucide-react'
import type { IconType } from 'react-icons'

type NavItem = {
  to: string
  label: string
  icon: IconType
}

const navItems: NavItem[] = [
  { to: routes.purchase.dashboard, label: 'Overview', icon: IoHomeOutline },
  { to: routes.purchase.suppliers, label: 'Suppliers', icon: FiTruck },
  { to: routes.purchase.supplierPurchases, label: 'Supplier Purchases', icon: FiShoppingCart },
  { to: routes.purchase.advances, label: 'Advances', icon: FiCreditCard },
  { to: routes.purchase.installments, label: 'Installments', icon: FiCalendar },
  { to: routes.purchase.transactions, label: 'Transactions', icon: FiFileText },
  { to: routes.purchase.transfers, label: 'Main Inventory', icon: FiRepeat },
]

function PurchaseSidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'relative grid grid-cols-[44px_1fr] items-center',
          isActive ? 'text-[#0B4EA2]' : 'text-slate-700',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative grid h-14 w-11 place-items-center bg-[#0B4EA2]">
            <item.icon className="h-5 w-5 text-white" />
          </div>

          <div
            className={[
              'relative flex h-14 items-center px-5 text-[15px] transition-colors',
              isActive ? 'font-medium' : 'bg-white hover:bg-slate-50',
            ].join(' ')}
          >
            {isActive ? (
              <span className="absolute inset-y-2 left-0 right-0 rounded-lg bg-[#EEF4FF]" aria-hidden="true" />
            ) : null}
            {isActive ? (
              <span
                className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"
                aria-hidden="true"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '8px solid #EEF4FF',
                }}
              />
            ) : null}
            <span className="relative truncate">{item.label}</span>
          </div>
        </>
      )}
    </NavLink>
  )
}

export function PurchaseSidebar() {
  const navigate = useNavigate()

  return (
    <aside
      className="h-full w-[260px] shadow-sm flex flex-col"
      style={{
        background: 'linear-gradient(to right, #0B4EA2 0 44px, #ffffff 44px 100%)',
      }}
    >
      {/* Logo area */}
      <div className="grid grid-cols-[44px_1fr] flex-shrink-0">
        <div className="bg-transparent" />
        <div className="flex flex-col justify-center px-6 py-5 border-b border-slate-100">
          <img src="/assets/Asset 9 1.svg" alt="Braun" className="h-10 w-auto" />
          <p className="mt-1 text-[11px] font-medium text-[#0B4EA2]">Purchase Department</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
        <nav className="flex flex-col mt-2">
          {navItems.map((item) => (
            <PurchaseSidebarLink key={item.to} item={item} />
          ))}
        </nav>
      </div>

      {/* Back to System Selection */}
      <div className="flex-shrink-0 grid grid-cols-[44px_1fr] border-t border-transparent">
        <div className="bg-[#0B4EA2]" />
        <button
          type="button"
          onClick={() => navigate(routes.systems)}
          className="flex items-center gap-2 px-5 py-4 text-[13px] font-semibold text-[#0B4EA2] hover:bg-[#EEF4FF] transition-colors w-full text-left"
        >
          <LayoutGrid className="h-4 w-4 shrink-0" />
          Back to System Selection
        </button>
      </div>
    </aside>
  )
}
