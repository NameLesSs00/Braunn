import { DollarSign, TrendingUp, Users, Building2 } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBgClass,
}: {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ElementType
  iconBgClass: string
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${iconBgClass}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <span
          className={[
            'text-sm font-medium',
            changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600',
          ].join(' ')}
        >
          {change}
        </span>
      </div>
      <div className="mt-4">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 text-xl font-semibold text-slate-800">
          <AnimatedCounter valueStr={value} />
        </div>
      </div>
    </div>
  )
}

export const defaultStats = [
  {
    title: 'Total Revenue',
    value: '€124,850',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: DollarSign,
    iconBgClass: 'bg-blue-500',
  },
  {
    title: 'Total Reservations',
    value: '1,280',
    change: '+9%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    iconBgClass: 'bg-emerald-500',
  },
  {
    title: 'Occupancy Rate',
    value: '78.5%',
    change: '+5.3%',
    changeType: 'positive' as const,
    icon: Users,
    iconBgClass: 'bg-violet-500',
  },
  {
    title: 'Corporate Revenue',
    value: '€45,230',
    change: '+15.8%',
    changeType: 'positive' as const,
    icon: Building2,
    iconBgClass: 'bg-orange-500',
  },
]
