import { NavLink } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'
import { translateAppText } from '../../../shared/lib/appTranslation'
import { IoHomeOutline, IoSettingsOutline } from 'react-icons/io5'
import { FiUsers, FiClock, FiCalendar, FiLogOut, FiBriefcase, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import type { IconType } from 'react-icons'

type NavItem = {
  to: string
  label: string
  icon: IconType
}

const navItems: NavItem[] = [
  { to: routes.hrm.dashboard, label: 'Overview', icon: IoHomeOutline },
  { to: routes.hrm.employees, label: 'Employees', icon: FiUsers },
  { to: routes.hrm.shiftManagement, label: 'Shift Management', icon: FiClock },
  { to: routes.hrm.attendance, label: 'Attendance', icon: FiCalendar },
  { to: routes.hrm.leaveManagement, label: 'Leave Management', icon: FiLogOut },
  { to: routes.hrm.departments, label: 'Departments', icon: FiBriefcase },
  { to: routes.hrm.salaryIncrements, label: 'Salary Increments', icon: FiTrendingUp },
  { to: routes.hrm.payroll, label: 'Payroll', icon: FiDollarSign },
  { to: routes.hrm.setting.root, label: 'Setting', icon: IoSettingsOutline },
]

function HRMSidebarLink({ item }: { item: NavItem }) {
  const label = translateAppText(item.label)

  return (
    <NavLink
      to={item.to}
      aria-label={label}
      title={label}
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
            {/* @ts-ignore */}
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
            <span className="relative truncate">{label}</span>
          </div>
        </>
      )}
    </NavLink>
  )
}

export function HRMSidebar() {
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
          <p className="mt-1 text-[11px] font-medium text-[#0B4EA2]">{translateAppText('HRM Department')}</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
        <nav className="flex flex-col mt-2">
          {navItems.map((item) => (
            <HRMSidebarLink key={item.to} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
