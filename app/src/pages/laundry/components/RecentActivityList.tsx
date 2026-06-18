import { IoCheckmarkCircleOutline, IoTimeOutline } from 'react-icons/io5'
import { LuClipboardList } from 'react-icons/lu'
import { MdOutlineWarningAmber } from 'react-icons/md'
import type { ReactNode } from 'react'

type ActivityType = 'completed' | 'created' | 'alert' | 'delivered' | 'available' | 'assigned'

type Activity = {
  type: ActivityType
  title: string
  subtitle: string
  time: string
  ref: string
}

const activities: Activity[] = [
  { type: 'completed', title: 'Request Completed', subtitle: 'Room 302 - Sarah Johnson', time: '2 min ago', ref: 'LR-2847' },
  { type: 'created',   title: 'New Request Created', subtitle: 'Room 510 - Michael Chen',  time: '5 min ago', ref: 'LR-2848' },
  { type: 'alert',     title: 'Low Stock Alert',      subtitle: 'Detergent - Below minimum level', time: '8 min ago',  ref: 'INV-143' },
  { type: 'delivered', title: 'Request Delivered',    subtitle: 'Room 205 - Emma Wilson',   time: '12 min ago', ref: 'LR-2846' },
  { type: 'available', title: 'Machine Available',    subtitle: '- Washer #5 ready',        time: '15 min ago', ref: 'MCH-05' },
  { type: 'assigned',  title: 'Request Assigned',     subtitle: 'Room 708 to John Smith',   time: '18 min ago', ref: 'LR-2845' },
]

function ActivityIcon({ type }: { type: ActivityType }): ReactNode {
  switch (type) {
    case 'completed':
    case 'delivered':
      return <IoCheckmarkCircleOutline className="h-5 w-5 text-emerald-500" />
    case 'created':
    case 'assigned':
      return <LuClipboardList className="h-5 w-5 text-blue-500" />
    case 'alert':
      return <MdOutlineWarningAmber className="h-5 w-5 text-amber-500" />
    case 'available':
      return <IoTimeOutline className="h-5 w-5 text-slate-400" />
    default:
      return <IoTimeOutline className="h-5 w-5 text-slate-400" />
  }
}

export function RecentActivityList() {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#0B4EA2]">Recent Activity</h2>
          <p className="mt-0.5 text-[13px] text-slate-400">Latest updates from your operations</p>
        </div>
        <button
          type="button"
          className="text-[13px] font-semibold text-[#0B4EA2] transition-opacity hover:opacity-70"
        >
          View All
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col divide-y divide-slate-100">
        {activities.map((item) => (
          <div key={item.ref} className="flex items-center gap-3 py-3.5">
            <div className="flex-shrink-0">
              <ActivityIcon type={item.type} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-slate-800">{item.title}</span>
                <span className="text-[11px] text-slate-400">· {item.time}</span>
              </div>
              <div className="mt-0.5 text-[12px] text-slate-500">{item.subtitle}</div>
            </div>

            <div className="flex-shrink-0 text-[12px] font-medium text-slate-400">{item.ref}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
