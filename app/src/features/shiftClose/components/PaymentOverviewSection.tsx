import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import type { PaymentOverview } from '../types'

type Props = {
  data: PaymentOverview
  onCountedAmountChange: (value: number) => void
}

export function PaymentOverviewSection({ data, onCountedAmountChange }: Props) {
  const [countedInput, setCountedInput] = useState(String(data.countedAmount))

  function handleCountedChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setCountedInput(val)
    const num = Number(val)
    if (!isNaN(num)) onCountedAmountChange(num)
  }

  return (
    <section>
      <h3 className="text-[16px] font-bold text-slate-800">Payment Overview</h3>
      <p className="mt-0.5 text-[13px] text-slate-500">Verify all payment amounts match</p>

      {/* System Total vs Counted */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] text-slate-400">System Total</p>
          <p className="mt-1 text-[20px] font-bold text-slate-800">${data.systemTotal.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border-2 border-[#BEDBFF] bg-white px-4 py-3">
          <p className="text-[11px] text-[##4A5565] font-medium">Counted Amount (Editable)</p>
          <input
            type="text"
            className="mt-1 w-full bg-transparent text-[20px] font-bold text-slate-800 outline-none"
            value={countedInput}
            onChange={handleCountedChange}
          />
        </div>
      </div>

      {/* Balanced badge */}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        <span className="text-[13px] font-medium text-emerald-700">Balanced</span>
      </div>

      {/* All Payment Methods Summary */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-slate-700">All Payment Methods Summary</p>
        </div>
        <div className="grid grid-cols-4 gap-y-2 px-4 py-3">
          {data.methods.map((m) => (
            <div key={m.label}>
              <p className="text-[11px] text-slate-400">{m.label}</p>
              <p className="text-[13px] font-semibold text-slate-700">${m.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-slate-700">Total:</p>
          <p className="text-[16px] font-bold text-slate-800">${data.total.toFixed(2)}</p>
        </div>
      </div>
    </section>
  )
}
