type Props = {
  label: string
  value: string
  trend?: string
}

export function StatCard({ label, value, trend }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-bold text-slate-800">{value}</div>
      {trend ? <div className="mt-2 text-sm text-emerald-600">{trend}</div> : null}
    </div>
  )
}
