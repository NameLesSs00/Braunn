import { NavLink } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'
import { IoHomeOutline } from 'react-icons/io5'
import { FiCalendar, FiUsers, FiMapPin, FiClipboard, FiAlertCircle, FiTool, FiShoppingBag } from 'react-icons/fi'
import { BsBuilding } from 'react-icons/bs'
import { MdOutlineCleaningServices, MdOutlineTrendingUp } from 'react-icons/md'
import type { IconType } from 'react-icons'

type NavItem = {
  to: string
  label: string
  icon: IconType
}

const navItems: NavItem[] = [
  { to: routes.dashboard, label: 'Dashboard', icon: IoHomeOutline },
  { to: routes.reservations, label: 'Reservations', icon: FiCalendar },
  { to: routes.groupReservations, label: 'Group Reservations', icon: FiUsers },
  { to: routes.roomPlan, label: 'Room Plan', icon: FiMapPin },
  { to: routes.guests, label: 'Guests', icon: FiUsers },
  { to: routes.reports, label: 'Reports', icon: FiClipboard },
  { to: routes.complaints, label: 'Complaints', icon: FiAlertCircle },
  { to: routes.housekeeping, label: 'Housekeeping', icon: MdOutlineCleaningServices },
  { to: routes.servicesRequests, label: 'Services & Requests', icon: FiShoppingBag },
  { to: routes.maintenance.requests, label: 'Maintenance', icon: FiTool },
  { to: routes.inHouseList, label: 'In House list', icon: BsBuilding },
  { to: routes.roomAllocation, label: 'Room Allocation', icon: FiMapPin },
  { to: routes.salesRevenue.dashboard, label: 'Sales & Revenue', icon: MdOutlineTrendingUp },
]

function PMSSidebarLink({ item }: { item: NavItem }) {
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

export function PMSSidebar() {
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
          <p className="mt-1 text-[11px] font-medium text-[#0B4EA2]">Property Management</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
        <nav className="flex flex-col mt-2">
          {navItems.map((item) => (
            <PMSSidebarLink key={item.to} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  )
}

// Named alias export for DashboardLayout
export { PMSSidebar as Sidebar }

// Default export if needed
export default PMSSidebar
