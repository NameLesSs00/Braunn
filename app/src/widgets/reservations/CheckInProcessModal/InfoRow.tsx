export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <div className="w-36 shrink-0 text-[12px] text-slate-500">{label}</div>
      <div className="min-w-0 text-[13px] font-medium text-slate-800 truncate" title={value || '—'}>
        {value || '—'}
      </div>
    </div>
  )
}
