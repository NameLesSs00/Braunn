import { useState, type ReactNode } from 'react'
import { FaBed , FaBuilding ,FaRegCalendar , FaRegClock  } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IconImage } from '../../shared/ui/IconImage'

import { CheckInTodayModal } from './modals/CheckInTodayModal'
import { CheckOutTodayModal } from './modals/CheckOutTodayModal'
import { SearchReservationModal } from './modals/SearchReservationModal'
import { IconType } from 'react-icons'
import { NewReservationModal } from '../../widgets/reservations/NewReservationModal/NewReservationModal'
import { FiLogIn } from "react-icons/fi";
import { CgLogOut } from "react-icons/cg";
import { GoSearch } from "react-icons/go";
  //to be removed
import { CheckInProcessPopup } from '../reservations/pupops/CheckInProcessPopup'

import { MdAddCircleOutline } from "react-icons/md";
interface StatCardProps {
  title: string
  value: string
  iconBgClassName: string
  iconSrc?: string // Now optional
  icon?: IconType // Accepts a React Icon component
  children?: ReactNode
}

function StatCard({
  title,
  value,
  iconBgClassName,
  iconSrc,
  icon: IconComponent, // Rename to capitalized so React can render it as a component
  children,
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-800">{value}</div>
          <div className="mt-1 text-sm font-semibold text-slate-800">{title}</div>
        </div>
        <div className={[
          'grid h-10 w-10 place-items-center rounded-full',
          iconBgClassName,
        ].join(' ')}>
          {/* 1. If an icon component is passed, render it */}
          {IconComponent ? (
            <IconComponent  />
          ) : iconSrc ? (
            /* 2. Otherwise, fall back to the traditional image src */
            <IconImage src={iconSrc} alt={title} className="h-5 w-5" />
          ) : null}
        </div>
      </div>

      {children ? <div className="mt-4 text-xs text-slate-500">{children}</div> : null}
    </div>
  )
}

interface QuickActionProps {
  title: string
  iconSrc: string | IconType 
  onClick?: () => void
  iconClassName?: string
}

function QuickAction({ title, iconSrc, onClick, iconClassName = '' }: QuickActionProps) {
  return (
    <button
      type="button"
      className="flex h-[110px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-white px-4 shadow-sm hover:bg-slate-50"
      aria-label={title}
      onClick={onClick}
    >
      <IconImage src={iconSrc} alt={title} className={`h-10 w-10 object-contain ${iconClassName}`} />
      <div className="text-center text-sm font-semibold text-slate-700">{title}</div>
    </button>
  )
}

export function DashboardPage() {
  const [checkInTodayOpen, setCheckInTodayOpen] = useState(false)
  const [checkOutTodayOpen, setCheckOutTodayOpen] = useState(false)
  const [newReservationOpen, setNewReservationOpen] = useState(false)
  const [searchReservationOpen, setSearchReservationOpen] = useState(false)
  //to be removed

  return (
    <>
      <div className="space-y-6">
      <div className="rounded-2xl bg-[#EAF2FF] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <IconImage src={FaRegCalendar} alt="Calendar" className="h-4 w-4" />
              Sunday , December 21.2025
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <IconImage src={FaRegClock} alt="Clock" className="h-4 w-4" />
              12:01:34 PM
            </div>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Morning shift (6:00AM-2:00PM)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          title="Available Room"
          value="20"
          iconBgClassName="bg-emerald-100"
          icon={FaBed}
        >
          
          <div className="grid grid-cols-2 gap-y-2">
            <div>Single 6</div>
            <div>Double 3</div>
            <div>Trible 2</div>
            <div>Suite 4</div>
            <div>Deluxe 7</div>
          </div>
        </StatCard>

        <StatCard
          title="Occupied Rooms"
          value="5"
          iconBgClassName="bg-indigo-100"
          icon={FaBuilding}
        >
          <div className="grid grid-cols-2 gap-y-2">
            <div>Single 2</div>
            <div>Double 1</div>
            <div>Trible 0</div>
            <div>Suite 0</div>
            <div>Deluxe 2</div>
          </div>
        </StatCard>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[#B07A20]">30</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">Today&apos;s</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-50">
              <IconImage src={FaRegCalendar} alt="Today" className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <div>Check-ins</div>
              <div className="font-semibold text-slate-800">15</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Check-Out</div>
              <div className="font-semibold text-slate-800">15</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[#9A1E1E]">$2,270</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">Total Revenue</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-50">
              <IconImage src={FaArrowTrendUp} alt="Dollar" className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <div>Cash</div>
              <div className="font-semibold text-slate-800">$1500</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Bank transfer</div>
              <div className="font-semibold text-slate-800">$770</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 text-sm font-semibold text-slate-700">Quick action</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            title="Arrivals"
            iconSrc={FiLogIn}
            iconClassName="text-green-500"
            onClick={() => {
              setCheckInTodayOpen(true)
            }}
          />
          <QuickAction
            title="Departures"
            iconSrc={CgLogOut}
            iconClassName="text-rose-500"
            onClick={() => {
              setCheckOutTodayOpen(true)
            }}
          />
          <QuickAction
            title="Add booking"
            iconSrc={MdAddCircleOutline}
            iconClassName="text-blue-500"
            onClick={() => {
              setNewReservationOpen(true)
            }}
          />
          <QuickAction
            title="Search booking"
            iconSrc={GoSearch}
            onClick={() => {
              setSearchReservationOpen(true)
            }}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="text-sm font-semibold text-slate-800">Today's Activity</div>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <IconImage src={FiLogIn} alt="Pending Check-ins" className="h-5 w-5 text-green-500" />
            <div className="text-sm font-medium text-slate-800">Pending Check-ins (1)</div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-emerald-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-800">Emma Johnson</div>
              <div className="mt-1 text-sm text-slate-600">Room 104</div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white"
              
            >
              <IconImage src={FiLogIn} alt="Check in" className="h-4 w-4" />
              check in
            </button>
          </div>
        </div>
        

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <IconImage src={CgLogOut} alt="Pending Check-outs" className="h-5 w-5 text-rose-500" />
            <div className="text-sm font-medium text-slate-800">Pending Check-outs (1)</div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl bg-rose-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-800">Emma Johnson</div>
              <div className="mt-1 text-sm text-slate-600">Room 104</div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white"
            >
              <IconImage src={CgLogOut} alt="Check out" className="h-4 w-4" />
              check out
            </button>
          </div>
        </div>
      </div>
      </div>


      <CheckInTodayModal open={checkInTodayOpen} onClose={() => setCheckInTodayOpen(false)} />
      <CheckOutTodayModal open={checkOutTodayOpen} onClose={() => setCheckOutTodayOpen(false)} />
      <NewReservationModal open={newReservationOpen} onClose={() => setNewReservationOpen(false)} />
      <SearchReservationModal open={searchReservationOpen} onClose={() => setSearchReservationOpen(false)} />
    </>
  )
}
