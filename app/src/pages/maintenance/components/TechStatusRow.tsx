import { UserRound } from 'lucide-react'

type Props = {
  name: string
  jobs: number
  color: 'yellow' | 'green' | 'gray'
}

const colors = {
  yellow: 'bg-yellow-400',
  green: 'bg-emerald-500',
  gray: 'bg-slate-400',
}

export function TechStatusRow({ name, jobs, color }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
        {name
          .split(' ')
          .map((part) => part[0])
          .slice(0, 2)
          .join('')}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-800">{name}</div>
        <div className="text-xs text-slate-500">{jobs} active jobs</div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className={['h-2.5 w-2.5 rounded-full', colors[color]].join(' ')} />
        <UserRound className="h-3.5 w-3.5 text-slate-400" />
      </div>
    </div>
  )
}
