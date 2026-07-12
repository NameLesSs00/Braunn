import { AlertTriangle, CheckCircle2 } from 'lucide-react'

import type { EvaluateLateCheckoutResponse } from '../../../models/PmsReservation'
import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'

type Props = {
  evaluation: EvaluateLateCheckoutResponse | null
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
  if (Array.isArray(value)) return value.length ? value.join(', ') : emptyText
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

export function LateCheckoutEvaluationStep({ evaluation, loading, error, onNext, onBack }: Props) {
  const currency = evaluation?.currency || 'EUR'

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600">
        Evaluating late check-out policy...
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
        No late check-out evaluation is available.
      </div>
    )
  }

  const summaryItems = [
    ['Room Number', valueOrNA(evaluation.roomNumber)],
    ['Room Type', valueOrNA(evaluation.roomTypeName)],
    ['Rate Plan Code', valueOrNA(evaluation.ratePlanCode)],
    ['Currency', valueOrNA(evaluation.currency)],
    ['Scheduled Check-out', formatDateTime(evaluation.scheduledCheckoutDateTime)],
    ['Actual Check-out', formatDateTime(evaluation.actualCheckoutDateTime)],
    ['Late Check-out Band', valueOrNA(evaluation.lateCheckoutBand)],
    ['Discounts', `${valueOrNA(evaluation.percentage)}%`],
    ['Nightly Rate Before Tax', formatAmount(evaluation.nightlyRateBeforeTax, currency)],
    ['Tax Amount', formatAmount(evaluation.taxAmount, currency)],
    ['Charge Before Tax', formatAmount(evaluation.chargeBeforeTax, currency)],
    ['Charge After Tax', formatAmount(evaluation.chargeAfterTax, currency)],
    ['Existing Outstanding Balance', formatAmount(evaluation.existingOutstandingBalance, currency)],
    ['Estimated Remaining Balance', formatAmount(evaluation.estimatedRemainingBalanceAfterPosting, currency)],
    ['Allowed', valueOrNA(evaluation.isAllowed)],
    ['Requires Manual Approval', valueOrNA(evaluation.requiresManualApproval)],
    ['Policy Code', valueOrNA(evaluation.policyCode)],
    ['Policy Name', valueOrNA(evaluation.policyName)],
    ['Pricing Source', valueOrNA(evaluation.pricingSource)],
    ['Booked Nightly Rate', formatAmount(evaluation.bookedNightlyRate, currency)],
    ['Dynamic Nightly Rate', formatAmount(evaluation.dynamicNightlyRate, currency)],
    ['Occupancy Adults', valueOrNA(evaluation.occupancyAdults)],
    ['Occupancy Children', valueOrNA(evaluation.occupancyChildren)],
    ['Occupancy Child Ages', valueOrNA(evaluation.occupancyChildAges)],
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
          <div className="font-bold">{evaluation.isAllowed ? 'Late check-out is allowed' : 'Late check-out is not allowed'}</div>
          <div className="mt-1 text-[13px]">
            Required payment: {formatAmount(evaluation.estimatedRemainingBalanceAfterPosting, currency)}
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

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Charge Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-[12px]">
            <thead className="bg-[#EAF2FF] text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Charge Type</th>
                <th className="px-4 py-3 font-semibold">Nightly Rate</th>
                <th className="px-4 py-3 font-semibold">Percentage</th>
                <th className="px-4 py-3 font-semibold">Before Tax</th>
                <th className="px-4 py-3 font-semibold">Tax</th>
                <th className="px-4 py-3 font-semibold">After Tax</th>
                <th className="px-4 py-3 font-semibold">Posted</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.breakdown?.length ? (
                evaluation.breakdown.map((item, index) => (
                  <tr key={`${item.date}-${item.chargeType ?? 'charge'}-${index}`} className={index % 2 ? 'bg-[#F4F9FF]' : 'bg-white'}>
                    <td className="px-4 py-3 font-medium text-slate-800">{valueOrNA(item.date)}</td>
                    <td className="px-4 py-3 text-slate-600">{valueOrNA(item.chargeType)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatAmount(item.nightlyRateBeforeTax, currency)}</td>
                    <td className="px-4 py-3 text-slate-600">{valueOrNA(item.percentage)}%</td>
                    <td className="px-4 py-3 text-slate-600">{formatAmount(item.amountBeforeTax, currency)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatAmount(item.taxAmount, currency)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{formatAmount(item.amountAfterTax, currency)}</td>
                    <td className="px-4 py-3 text-slate-600">{valueOrNA(item.alreadyPosted)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    N/A
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
