import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { FaBed , FaBuilding , FaHome, FaRegCalendar , FaRegClock  } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { IconImage } from '../../shared/ui/IconImage'

import { CheckInTodayModal } from './modals/CheckInTodayModal'
import { CheckOutTodayModal } from './modals/CheckOutTodayModal'
import { InHouseMonthModal } from './modals/InHouseMonthModal'
import { SearchReservationModal } from './modals/SearchReservationModal'
import { IconType } from 'react-icons'
import { FiLogIn } from "react-icons/fi";
import { CgLogOut } from "react-icons/cg";
import { GoSearch } from "react-icons/go";
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import { fetchDailyDashboard } from '../../features/dashboard/dashboardSlice'

function localIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

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
  const dispatch = useAppDispatch()
  const daily = useAppSelector((state) => state.dashboard.daily)
  const dashboardStatus = useAppSelector((state) => state.dashboard.status)
  const dashboardError = useAppSelector((state) => state.dashboard.error)
  const [now, setNow] = useState(() => new Date())
  const [checkInTodayOpen, setCheckInTodayOpen] = useState(false)
  const [checkOutTodayOpen, setCheckOutTodayOpen] = useState(false)
  const [inHouseMonthOpen, setInHouseMonthOpen] = useState(false)
  const [searchReservationOpen, setSearchReservationOpen] = useState(false)

  const dashboardDate = useMemo(() => localIsoDate(now), [now])
  const loading = dashboardStatus === 'loading'
  const revenueTotal = useMemo(
    () => daily?.revenueByPaymentMethod?.reduce((total, item) => total + item.amount, 0) ?? 0,
    [daily]
  )

  useEffect(() => {
    const request = dispatch(fetchDailyDashboard(dashboardDate))
    return () => request.abort()
  }, [dashboardDate, dispatch])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <>
      <div className="space-y-6">
      <div className="rounded-2xl bg-[#EAF2FF] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <IconImage src={FaRegCalendar} alt="Calendar" className="h-4 w-4" />
              {now.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <IconImage src={FaRegClock} alt="Clock" className="h-4 w-4" />
              {now.toLocaleTimeString('en-US')}
            </div>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            Morning shift (6:00AM-2:00PM)
          </div>
        </div>
      </div>

      {dashboardStatus === 'failed' ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {dashboardError || 'Unable to load dashboard data.'}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          title="Available Room"
          value={loading ? '—' : String(daily?.availableRooms.total ?? 0)}
          iconBgClassName="bg-emerald-100"
          icon={FaBed}
        >
          
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {(daily?.availableRooms.byRoomType ?? []).map((roomType) => (
              <div key={roomType.roomTypeId}>{roomType.roomTypeName || 'Unknown'} {roomType.count}</div>
            ))}
          </div>
        </StatCard>

        <StatCard
          title="Occupied Rooms"
          value={loading ? '—' : String(daily?.occupiedRooms.total ?? 0)}
          iconBgClassName="bg-indigo-100"
          icon={FaBuilding}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {(daily?.occupiedRooms.byRoomType ?? []).map((roomType) => (
              <div key={roomType.roomTypeId}>{roomType.roomTypeName || 'Unknown'} {roomType.count}</div>
            ))}
          </div>
        </StatCard>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[#B07A20]">
                {loading ? '—' : (daily?.actualCheckIns ?? 0) + (daily?.actualCheckOuts ?? 0)}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-800">Today&apos;s</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-50">
              <IconImage src={FaRegCalendar} alt="Today" className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <div>Expected Check-ins</div>
              <div className="font-semibold text-slate-800">{daily?.expectedCheckIns ?? 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Actual Check-ins</div>
              <div className="font-semibold text-emerald-700">{daily?.actualCheckIns ?? 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Expected Check-outs</div>
              <div className="font-semibold text-slate-800">{daily?.expectedCheckOuts ?? 0}</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Actual Check-outs</div>
              <div className="font-semibold text-indigo-700">{daily?.actualCheckOuts ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-[#9A1E1E]">
                {loading ? '—' : formatAmount(revenueTotal)}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-800">Total Revenue</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-50">
              <IconImage src={FaArrowTrendUp} alt="Dollar" className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {(daily?.revenueByPaymentMethod ?? []).map((payment) => (
              <div key={payment.paymentMethod ?? 'Unknown'} className="flex items-center justify-between">
                <div>{payment.paymentMethod || 'Unknown'}</div>
                <div className="font-semibold text-slate-800">{formatAmount(payment.amount)}</div>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <div>Refunds</div>
              <div className="font-semibold text-rose-700">{formatAmount(daily?.refundsTotal ?? 0)}</div>
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
            title="In House list"
            iconSrc={FaHome}
            iconClassName="text-blue-500"
            onClick={() => {
              setInHouseMonthOpen(true)
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
      </div>


      <CheckInTodayModal open={checkInTodayOpen} onClose={() => setCheckInTodayOpen(false)} />
      <CheckOutTodayModal open={checkOutTodayOpen} onClose={() => setCheckOutTodayOpen(false)} />
      <InHouseMonthModal open={inHouseMonthOpen} onClose={() => setInHouseMonthOpen(false)} />
      <SearchReservationModal open={searchReservationOpen} onClose={() => setSearchReservationOpen(false)} />
    </>
  )
}
