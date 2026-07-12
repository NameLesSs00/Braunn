import type { ExecuteExtendStayResponse } from '../../../../../models/PmsReservation'

type Props = {
  result: ExecuteExtendStayResponse | null
  onDone: () => void
}

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function amount(value: number | null | undefined) {
  if (value === null || value === undefined) return 'N/A'
  return Number(value).toFixed(2)
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <div className="text-slate-600">{label}</div>
      <div className="text-right font-semibold text-slate-800">{value}</div>
    </div>
  )
}

export function ExtendStayStep3({ result, onDone }: Props) {
  return (
    <>
      <div className="bg-[#0B4EA2] px-8 py-5">
        <div className="text-xl font-semibold text-white">Extend Stay Complete</div>
        <div className="mt-1 text-sm text-white/90">The extend stay process is done successfully</div>
      </div>

      <div className="bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-extrabold text-slate-800">Extend stay process is done successfully</h3>
          <div className="mt-5 divide-y divide-slate-100">
            <Row label="Old Check-out" value={formatDate(result?.oldCheckoutDate)} />
            <Row label="New Check-out" value={formatDate(result?.newCheckoutDate)} />
            <Row label="Additional Nights" value={String(result?.additionalNights ?? 0)} />
            <Row label="Additional Charge" value={amount(result?.additionalCharge)} />
            <Row label="Remaining Balance" value={amount(result?.remainingBalance)} />
            <Row label="Payment Status" value={result?.paymentStatus || 'N/A'} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-slate-200 bg-white px-8 py-5">
        <button
          type="button"
          className="h-11 rounded-xl bg-[#0B4EA2] px-10 text-sm font-semibold text-white transition-colors hover:bg-[#093d81]"
          onClick={onDone}
        >
          Done
        </button>
      </div>
    </>
  )
}
