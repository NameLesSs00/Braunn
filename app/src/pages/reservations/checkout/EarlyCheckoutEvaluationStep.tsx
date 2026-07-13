import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import type { EvaluateEarlyCheckoutResponse } from '../../../models/PmsReservation'
import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'

type Props = {
  evaluation: EvaluateEarlyCheckoutResponse | null
  loading: boolean
  error: string | null
  onNext: () => void
  onBack: () => void
}

const emptyText = 'N/A'

function valueOrNA(value: unknown) {
  if (value === null || value === undefined) return emptyText
  if (typeof value === 'string') return value.trim() ? value : emptyText
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return emptyText
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function formatAmount(value: number | null | undefined, currency?: string | null) {
  if (value === null || value === undefined) return emptyText
  return formatMoney(value, currency || 'EUR')
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 break-words text-[13px] font-semibold text-slate-800">{value}</div>
    </div>
  )
}

export function EarlyCheckoutEvaluationStep({ evaluation, loading, error, onNext, onBack }: Props) {
  const currency = evaluation?.currency || 'EUR'

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
        Evaluating early check-out policy...
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="h-12 rounded-xl border border-[#0B4EA2] px-16 text-sm font-semibold text-[#0B4EA2]"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
        No early check-out evaluation is available.
      </div>
    )
  }

  const remaining = Math.max(0, Number(evaluation.estimatedRemainingBalanceAfterCredit) || 0)
  const refund = Math.max(0, Number(evaluation.suggestedRefundAmount) || 0)
  const summaryItems = [
    ['Room Number', valueOrNA(evaluation.roomNumber)],
    ['Room Type', valueOrNA(evaluation.roomTypeName)],
    ['Scheduled Check-out', formatDateTime(evaluation.scheduledCheckoutDateTime)],
    ['Actual Check-out', formatDateTime(evaluation.actualCheckoutDateTime)],
    ['Unused Nights', valueOrNA(evaluation.unusedNights)],
    ['Policy Code', valueOrNA(evaluation.policyCode)],
    ['Policy Name', valueOrNA(evaluation.policyName)],
    ['Percentage', `${valueOrNA(evaluation.percentage)}%`],
    ['Active Charge Total', formatAmount(evaluation.activeChargeTotal, currency)],
    ['Net Paid Amount', formatAmount(evaluation.netPaidAmount, currency)],
    ['Credit Amount', formatAmount(evaluation.creditAmount, currency)],
    ['Charge Total After Credit', formatAmount(evaluation.estimatedChargeTotalAfterCredit, currency)],
    ['Remaining Balance After Credit', formatAmount(evaluation.estimatedRemainingBalanceAfterCredit, currency)],
    ['Maximum Refundable Amount', formatAmount(evaluation.maximumRefundableAmount, currency)],
    ['Suggested Refund Amount', formatAmount(evaluation.suggestedRefundAmount, currency)],
    ['Currency', valueOrNA(evaluation.currency)],
    ['Allowed', valueOrNA(evaluation.isAllowed)],
    ['Requires Manual Approval', valueOrNA(evaluation.requiresManualApproval)],
  ]

  return (
    <div className="space-y-6">
      <div
        className={[
          'flex items-start gap-3 rounded-xl border px-5 py-4 text-sm',
          evaluation.isAllowed
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
            : 'border-rose-100 bg-rose-50 text-rose-700',
        ].join(' ')}
      >
        {evaluation.isAllowed ? <CheckCircle2 className="mt-0.5 h-5 w-5" /> : <AlertTriangle className="mt-0.5 h-5 w-5" />}
        <div>
          <div className="font-bold">{evaluation.isAllowed ? 'Early check-out is allowed' : 'Early check-out is not allowed'}</div>
          <div className="mt-1 text-[13px]">
            Amount due: {formatAmount(remaining, currency)}
            {refund > 0 ? ` · Suggested refund: ${formatAmount(refund, currency)}` : ''}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Evaluation Details
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
          {summaryItems.map(([label, value]) => (
            <InfoItem key={label} label={label} value={value} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-xl border border-[#0B4EA2] px-16 text-sm font-semibold text-[#0B4EA2]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!evaluation.isAllowed}
          className="h-12 rounded-xl bg-[#0B4EA2] px-12 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
