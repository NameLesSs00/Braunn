import { LuClipboardList } from 'react-icons/lu'
import { IoTimeOutline } from 'react-icons/io5'
import { IoCheckmarkCircleOutline } from 'react-icons/io5'
import { MdOutlineWarningAmber } from 'react-icons/md'

type CardVariant = 'light' | 'blue' | 'dark'

type Card = {
  label: string
  value: number | string
  icon: React.ReactNode
  variant: CardVariant
}

const cards: Card[] = [
  {
    label: 'Total Requests Today',
    value: 127,
    icon: <LuClipboardList className="h-6 w-6" />,
    variant: 'light',
  },
  {
    label: 'Active Orders',
    value: 45,
    icon: <IoTimeOutline className="h-6 w-6" />,
    variant: 'blue',
  },
  {
    label: 'Completed Orders',
    value: 82,
    icon: <IoCheckmarkCircleOutline className="h-6 w-6" />,
    variant: 'light',
  },
  {
    label: 'Low Stock Items',
    value: 5,
    icon: <MdOutlineWarningAmber className="h-6 w-6" />,
    variant: 'dark',
  },
]

const variantStyles: Record<CardVariant, { card: string; icon: string; label: string; value: string }> = {
  light: {
    card: 'bg-white border border-slate-100 shadow-sm',
    icon: 'bg-slate-100 text-slate-500',
    value: 'text-slate-800',
    label: 'text-slate-500',
  },
  blue: {
    card: 'bg-[#0B4EA2] shadow-md',
    icon: 'bg-white/20 text-white',
    value: 'text-white',
    label: 'text-white/80',
  },
  dark: {
    card: 'bg-[#0a3d82] shadow-md',
    icon: 'bg-white/20 text-red-300',
    value: 'text-white',
    label: 'text-white/80',
  },
}

export function SummaryCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => {
        const styles = variantStyles[card.variant]
        return (
          <div key={card.label} className={`rounded-2xl p-5 ${styles.card}`}>
            <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${styles.icon}`}>
              {card.icon}
            </div>
            <div className={`text-3xl font-bold ${styles.value}`}>{card.value}</div>
            <div className={`mt-1 text-[13px] ${styles.label}`}>{card.label}</div>
          </div>
        )
      })}
    </div>
  )
}
