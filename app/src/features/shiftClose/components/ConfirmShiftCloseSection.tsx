import { Info, CheckCircle, AlertCircle } from 'lucide-react'

type SummaryRow = {
  label: string
  value: string
  highlight?: boolean
}

type Props = {
  cashierName: string
  openingCash: number
  totalCash: number
  countedCash: number
  paymentBalanced: boolean
}

export function ConfirmShiftCloseSection({
  cashierName,
  openingCash,
  totalCash,
  countedCash,
  paymentBalanced,
}: Props) {
  const differenceAmount = countedCash - totalCash

  const rows: SummaryRow[] = [
    { label: 'Cashier', value: cashierName },
    { label: 'Opening Cash Amount', value: `$${openingCash.toFixed(2)}` },
    { label: 'System Expected Cash', value: `$${totalCash.toFixed(2)}` },
    { label: 'Actual Counted Cash', value: `$${countedCash.toFixed(2)}` },
    { label: 'Difference Amount', value: `$${differenceAmount.toFixed(2)}` },
  ]

  return (
    <div className="flex flex-col items-center">
      {/* Icon */}
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#EEF4FF]">
        <Info className="h-8 w-8 text-[#0B4EA2]" />
      </div>

      {/* Title */}
      <h3 className="mt-4 text-[18px] font-bold text-slate-800">Confirm Shift Close</h3>
      <p className="mt-1 max-w-sm text-center text-[13px] leading-relaxed text-slate-500">
        Please review the summary before closing your shift. This action will finalize all transactions.
      </p>

      {/* Summary table */}
      <div className="mt-6 w-full">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-slate-100 px-4 py-3"
          >
            <span className="text-[13px] text-slate-600">{row.label}</span>
            <span className="text-[13px] font-semibold text-slate-800">{row.value}</span>
          </div>
        ))}

        {/* Payment Status – highlighted */}
        <div className={["flex items-center justify-between border-b px-4 py-3", paymentBalanced ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/50"].join(" ")}>
          <span className="text-[13px] text-slate-600">Payment Status</span>
          <span className={["inline-flex items-center gap-1 text-[13px] font-semibold", paymentBalanced ? "text-emerald-600" : "text-red-600"].join(" ")}>
            {paymentBalanced ? (
                <><CheckCircle className="h-4 w-4" /> All Balanced</>
            ) : (
                <><AlertCircle className="h-4 w-4" /> Unbalanced Difference</>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
