import { Clock, CalendarCheck, Users, DollarSign, UserCircle, CheckCircle, ArrowRightLeft } from 'lucide-react'
import type { ShiftOverview } from '../types'

type Props = {
  data: ShiftOverview
}

export function ShiftOverviewSection({ data }: Props) {
  const stats = [
    { icon: CalendarCheck, label: 'Reservations', value: data.reservations },
    { icon: Users,         label: 'Check-ins',    value: data.checkIns },
    { icon: ArrowRightLeft,label: 'Check-outs',   value: data.checkOuts },
    { icon: DollarSign,    label: 'Revenue',      value: `$${data.revenue}` },
  ]

  return (
    <section>
      <h3 className="text-[16px] font-bold text-slate-800">Shift Overview</h3>
      <p className="mt-0.5 text-[13px] text-slate-500">Review your shift information before closing</p>

      {/* Employee card */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0B4EA2]">
          <UserCircle className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-slate-800">{data.name}</p>
          <p className="text-[12px] text-slate-500">{data.role}</p>
        </div>
      </div>

      {/* Start / End */}
      <div className="mt-2 flex items-center gap-6 pl-1">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
          <Clock className="h-3.5 w-3.5 text-[#0B4EA2]" />
          Start: {data.startTime}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
          <Clock className="h-3.5 w-3.5 text-[#0B4EA2]" />
          End: {data.endTime}
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center">
            <div className="mx-auto mb-1 flex items-center justify-center gap-1 text-slate-400">
              <s.icon className="h-3.5 w-3.5" />
              <span className="text-[11px]">{s.label}</span>
            </div>
            <p className="text-[18px] font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
