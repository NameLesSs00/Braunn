import { CheckCircle } from 'lucide-react'
import type { OperationItem } from '../types'

type Props = {
  items: OperationItem[]
}

export function OperationsReviewSection({ items }: Props) {
  return (
    <section>
      <h3 className="text-[16px] font-bold text-slate-800">Operations Review</h3>
      <p className="mt-0.5 text-[13px] text-slate-500">Verify all operations are completed</p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3"
          >
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-[13px] font-semibold text-slate-800">{item.label}</p>
              <p className="text-[12px] text-slate-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
