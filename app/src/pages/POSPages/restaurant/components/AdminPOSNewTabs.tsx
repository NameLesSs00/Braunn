import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Scale, Layers, Utensils, Ticket, BarChart3 } from 'lucide-react'
import { routes } from '../../../../shared/lib/routes'
import { SettingsUnitsTab } from './settings/units/SettingsUnitsTab'
import { SettingsMaterialsTab } from './settings/materials/SettingsMaterialsTab'
import { SettingsMealsTab } from './settings/meals/SettingsMealsTab'
import { ProductsTab as ProductsManagementTab } from './products/ProductsTab'
import { CouponSalesTab, CouponsListTab } from './coupons/CouponsListTab'
import { WarehouseManagementTab } from './warehouse/WarehouseTab'

export function SettingsTab() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Units', path: routes.pos.admin.settings.units, icon: Scale },
    { label: 'Materials', path: routes.pos.admin.settings.materials, icon: Layers },
    { label: 'Meals', path: routes.pos.admin.settings.meals, icon: Utensils },
  ]

  // Default redirect if exactly on the root settings path
  if (location.pathname === routes.pos.admin.settings.root || location.pathname === routes.pos.admin.settings.root + '/') {
    return <Navigate to={routes.pos.admin.settings.units} replace />
  }

  return (
    <div className="flex h-full flex-col bg-[#F6F8FC] px-8 pt-8 pb-10">
      <div className="flex w-full items-center justify-between overflow-x-auto rounded-t-xl border-b border-slate-200 bg-slate-50/50">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={[
                'relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-[3px] px-4 py-3.5 text-[14px] font-semibold transition-colors',
                isActive
                  ? 'border-[#004bb4] bg-white text-[#004bb4] shadow-sm'
                  : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="flex-1 rounded-b-xl border border-slate-200 border-t-0 bg-white p-8 shadow-sm">
        {location.pathname.startsWith(routes.pos.admin.settings.units) && <SettingsUnitsTab />}
        {location.pathname.startsWith(routes.pos.admin.settings.materials) && <SettingsMaterialsTab />}
        {location.pathname.startsWith(routes.pos.admin.settings.meals) && <SettingsMealsTab />}
      </div>
    </div>
  )
}

export function ProductsTab() {
  return <ProductsManagementTab />
}

export function WarehouseTab() {
  return <WarehouseManagementTab />
}

export function CouponsTab() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { label: 'Coupons', path: routes.pos.admin.coupons.list, icon: Ticket },
    { label: 'Coupon Sales', path: routes.pos.admin.coupons.sales, icon: BarChart3 },
  ]

  if (location.pathname === routes.pos.admin.coupons.root || location.pathname === routes.pos.admin.coupons.root + '/') {
    return <Navigate to={routes.pos.admin.coupons.list} replace />
  }

  return (
    <div className="flex h-full flex-col bg-[#F6F8FC] px-8 pt-8 pb-10">
      <div className="flex w-full items-center justify-between overflow-x-auto rounded-t-xl border-b border-slate-200 bg-slate-50/50">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path)
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={[
                'relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-[3px] px-4 py-3.5 text-[14px] font-semibold transition-colors',
                isActive
                  ? 'border-[#004bb4] bg-white text-[#004bb4] shadow-sm'
                  : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
      <div className="flex-1 rounded-b-xl border border-slate-200 border-t-0 bg-white p-8 shadow-sm">
        {location.pathname.startsWith(routes.pos.admin.coupons.list) && <CouponsListTab />}
        {location.pathname.startsWith(routes.pos.admin.coupons.sales) && <CouponSalesTab />}
      </div>
    </div>
  )
}
