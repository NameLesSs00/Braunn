import { LuClipboardList } from 'react-icons/lu'
import { IoTimeOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'
import { MdOutlineShoppingBasket, MdOutlineCameraAlt } from 'react-icons/md'
import type { RequestStatus } from './RequestsTable'

type StatusCard = {
  label: string
  count: number
  sub: string
  icon: React.ReactNode
  labelColor: string
  status: RequestStatus | 'all'
}

const cards: StatusCard[] = [
  {
    label: 'All Requests',
    count: 45,
    sub: 'Total',
    icon: <LuClipboardList className="h-5 w-5 text-[#0B4EA2]" />,
    labelColor: 'text-[#0B4EA2]',
    status: 'all',
  },
  {
    label: 'Pending',
    count: 15,
    sub: 'Requests',
    icon: <IoTimeOutline className="h-5 w-5 text-[#0B4EA2]" />,
    labelColor: 'text-[#0B4EA2]',
    status: 'Pending',
  },
  {
    label: 'In progress',
    count: 20,
    sub: 'Request',
    icon: <MdOutlineCameraAlt className="h-5 w-5 text-[#0B4EA2]" />,
    labelColor: 'text-[#0B4EA2]',
    status: 'In Progress',
  },
  {
    label: 'Ready to deliver',
    count: 8,
    sub: 'Request',
    icon: <MdOutlineShoppingBasket className="h-5 w-5 text-[#0B4EA2]" />,
    labelColor: 'text-[#0B4EA2]',
    status: 'Ready for Delivery',
  },
  {
    label: 'Completed',
    count: 5,
    sub: 'Request',
    icon: <IoCheckmarkCircleOutline className="h-5 w-5 text-[#0B4EA2]" />,
    labelColor: 'text-[#0B4EA2]',
    status: 'Completed',
  },
]

export function RequestsStatusCards() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {cards.map((card) => {
        return (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
              {card.icon}
            </div>
            <div>
              <div className={`text-[12px] font-semibold ${card.labelColor}`}>{card.label}</div>
              <div className="text-[22px] font-bold leading-tight text-slate-800">{card.count}</div>
              <div className="text-[11px] text-slate-400">{card.sub}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
