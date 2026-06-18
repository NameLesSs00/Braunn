import { useState } from 'react'
import { AlertTriangle, ChevronDown } from 'lucide-react'

export type FolioInvoice = {
  guest: string
  room: string
  balance: number
  daysOverdue: number
}

type Props = {
  invoices: FolioInvoice[]
  onTransferAll: () => void
  transferred: boolean
}

const ACTION_OPTIONS = ['select', 'Transfer', 'Waive', 'Charge']

export function OpenFoliosReviewSection({ invoices, onTransferAll, transferred }: Props) {
  const [actions, setActions] = useState<Record<number, string>>(
    Object.fromEntries(invoices.map((_, i) => [i, 'select']))
  )

  const totalOverdue = invoices.reduce((sum, inv) => sum + inv.balance, 0)

  function handleActionChange(index: number, value: string) {
    setActions((prev) => ({ ...prev, [index]: value }))
  }

  return (
    <section>
      <h3 className="text-[16px] font-bold text-slate-800">Open Folios Review</h3>
      <p className="mt-0.5 text-[13px] text-slate-500">Review and action outstanding guest balances</p>

      {/* Overdue warning + Transfer button */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50/60 px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-[13px] font-semibold text-red-600">Overdue Invoices</p>
            <p className="text-[12px] text-red-500">{invoices.length} invoices require immediate attention</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onTransferAll}
          disabled={transferred}
          className={[
            'rounded-lg border px-4 py-2 text-[12px] font-semibold transition-colors',
            transferred
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              : 'border-[#0B4EA2] bg-[#0B4EA2] text-white hover:bg-[#0a3f85]',
          ].join(' ')}
        >
          Transfer All Overdue
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-[1.2fr_0.7fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Guest</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Room</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Balance</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Days Overdue</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Action</span>
        </div>

        {/* Table rows */}
        {invoices.map((inv, i) => (
          <div
            key={i}
            className="grid grid-cols-[1.2fr_0.7fr_1fr_1fr_1fr] items-center gap-2 border-b border-slate-50 px-4 py-3"
          >
            <span className="text-[13px] text-slate-700">{inv.guest}</span>
            <span className="text-[13px] text-slate-500">{inv.room}</span>
            <span className="text-[13px] font-semibold text-red-600">${inv.balance.toFixed(2)}</span>
            <span className="text-[13px] text-red-400">{inv.daysOverdue} days</span>
            <div className="relative">
              <select
                className="h-8 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-7 text-[12px] text-slate-500 outline-none transition-colors focus:border-[#0B4EA2]"
                value={actions[i]}
                onChange={(e) => handleActionChange(i, e.target.value)}
              >
                {ACTION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        ))}

        {/* Total row */}
        <div className="flex items-center justify-between bg-red-50/40 px-4 py-3">
          <span className="text-[13px] font-semibold text-red-600">Total Overdue:</span>
          <span className="text-[16px] font-bold text-red-600">${totalOverdue.toFixed(2)}</span>
        </div>
      </div>
    </section>
  )
}
