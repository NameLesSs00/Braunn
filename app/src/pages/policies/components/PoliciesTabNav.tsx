import { NavLink, useLocation } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'
import { Clock, ArrowRightLeft, Moon, CalendarPlus, Ban } from 'lucide-react'

const tabs = [
  { id: 'cancellation',           label: 'Cancellation',           to: routes.policies.corporateCancellation, Icon: Ban },
  { id: 'early-checkout',         label: 'Early Checkout',         to: routes.policies.earlyCheckout,        Icon: Clock },
  { id: 'room-change',            label: 'Room Change',            to: routes.policies.roomChange,            Icon: ArrowRightLeft },
  { id: 'late-checkout',          label: 'Late Checkout',          to: routes.policies.lateCheckout,          Icon: Moon },
  { id: 'extend-stay',            label: 'Extend Stay',            to: routes.policies.extendStay,            Icon: CalendarPlus },
]

export function PoliciesTabNav() {
  const location = useLocation()

  return (
    <div className="flex w-full items-center justify-between border-b border-slate-200 overflow-x-auto bg-slate-50/50 rounded-t-xl mt-4">
      {tabs.map((tab) => {
        const Icon = tab.Icon
        const isActive = location.pathname === tab.to

        return (
          <NavLink
            key={tab.id}
            to={tab.to}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-[14px] font-semibold transition-colors relative whitespace-nowrap ${
              isActive
                ? 'bg-white text-[#0B4EA2] border-b-[3px] border-[#0B4EA2] shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-b-[3px] border-transparent'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </NavLink>
        )
      })}
    </div>
  )
}
