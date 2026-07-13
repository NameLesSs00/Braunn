import { NavLink } from 'react-router-dom'

import { routes } from '../../../shared/lib/routes'
import { IconImage } from '../../../shared/ui/IconImage'
import { IoHomeOutline } from "react-icons/io5";
import type { IconType } from 'react-icons';
import { FaRegCalendar ,FaPoll } from "react-icons/fa";
import { PiSquaresFourLight } from "react-icons/pi";
import { MdGroup } from "react-icons/md";
import { LuUserX } from "react-icons/lu";
import { GiMagicBroom } from "react-icons/gi";
import { RiServiceBellLine } from "react-icons/ri";
import { IoMdListBox } from "react-icons/io";
import { FaBed , FaArrowTrendUp } from "react-icons/fa6";
type NavItem = {
  to: string
  label: string
  iconSrc: IconType | string
}

const mainNavItems: NavItem[] = [
  { to: routes.dashboard, label: 'Dashboard', iconSrc: IoHomeOutline },
  { to: routes.reservations, label: 'Reservations', iconSrc: FaRegCalendar },
  { to: routes.groupReservations, label: 'Group Reservations', iconSrc: MdGroup },
  { to: routes.roomPlan, label: 'Room Plan', iconSrc: PiSquaresFourLight },
  { to: routes.guests, label: 'Guests', iconSrc: MdGroup },
  { to: routes.reports, label: 'Reports', iconSrc: FaPoll },
]

const secondaryNavItems: NavItem[] = [
  { to: routes.complaints, label: 'Complaints', iconSrc: LuUserX },
  { to: routes.housekeeping, label: 'Housekeeping', iconSrc: GiMagicBroom },
  { to: routes.servicesRequests, label: 'Services & Requests', iconSrc: RiServiceBellLine },
  { to: routes.inHouseList, label: 'In House list', iconSrc: IoMdListBox },
  { to: routes.roomAllocation, label: 'Room Allocation', iconSrc: FaBed },
  { to: routes.salesRevenue.dashboard, label: 'Sales & Revenue', iconSrc: FaArrowTrendUp },
]

function SidebarLink({ item }: { item: NavItem }) {
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
            <IconImage
              src={item.iconSrc}
              alt={item.label}
              className="h-5 w-5 brightness-0 invert"
            />
          </div>

          <div
            className={[
              'relative flex h-14 items-center px-5 text-[15px] transition-colors',
              isActive ? 'font-medium' : 'bg-white hover:bg-slate-50',
            ].join(' ')}
          >
            {isActive ? <span className="absolute inset-y-2 left-0 right-0 rounded-lg bg-[#EEF4FF]" aria-hidden="true" /> : null}
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

 
export function Sidebar() {
  return (
    <aside
      className="h-full w-[260px] shadow-sm flex flex-col"
      style={{
        background: 'linear-gradient(to right, #0B4EA2 0 44px, #ffffff 44px 100%)',
      }}
    >
      <div className="grid grid-cols-[44px_1fr] flex-shrink-0">
        <div className="bg-transparent" />
        <div className="flex items-center px-6 py-6 border-b border-transparent">
          <img src="/assets/Asset 9 1.svg" alt="Braun" className="h-10 w-auto" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300 pb-4">
        <nav className="flex flex-col">
          {mainNavItems.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>

        <nav className="mt-2 flex flex-col">
          {secondaryNavItems.map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  )
}

