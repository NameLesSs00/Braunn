import { NavLink, useLocation } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'

const tabs = [
  { label: 'Dashboard', to: routes.salesRevenue.dashboard },
  { label: 'Rate Calendar', to: routes.salesRevenue.rateCalendar },
  { label: 'Room Types', to: routes.salesRevenue.roomTypes },
  { label: 'Pricing', to: routes.salesRevenue.pricing },
  { label: 'Discounts', to: routes.salesRevenue.discounts },
  { label: 'Corporate Account', to: routes.salesRevenue.corporateAccount },
  { label: 'Group contracts', to: routes.salesRevenue.groupContracts },
  { label: 'production Report', to: routes.salesRevenue.productionReport },
  { label: 'Rates & Packages', to: routes.salesRevenue.packages },
]

export function TabNav() {
  const location = useLocation()
  const isActiveTab = (to: string) => location.pathname === to

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={[
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            isActiveTab(tab.to)
              ? 'bg-[#0B4EA2] text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          ].join(' ')}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
