import { ShiftStartInfo } from '../types'
import { IconImage } from '../../../shared/ui/IconImage'
import { IoPerson } from "react-icons/io5";
type Props = {
  data: ShiftStartInfo
}

export function ShiftStartOverviewSection({ data }: Props) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
          <IconImage src={IoPerson} alt="User" className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-slate-800">{data.name}</h3>
          <p className="text-[13px] text-slate-500">{data.role}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Shift Type</p>
            <p className="text-[14px] font-bold text-emerald-600">{data.shiftType}</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Start Time</p>
            <p className="text-[14px] font-bold text-slate-700">{data.startTime}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
