import { AlertTriangle, Loader2 } from 'lucide-react'

import type { EvaluateExtendStayResponse, ExtendStayUnavailableDate } from '../../../../../models/PmsReservation'

type Props = {
  evaluation: EvaluateExtendStayResponse | null
  manualNightlyRate: number
  submitError: string | null
  submitting: boolean
  onBack: () => void
  onCancel: () => void
  onConfirm: () => void
}

const hiddenKeys = new Set([
  'id',
  'reservationId',
  'reservationRoomId',
  'policyId',
  'roomTypeId',
  'assignedRoomId',
  'mealPlanId',
  'chargeIds',
  'warnings',
])

function valueOrNA(value: unknown) {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string') return value.trim() ? value : 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function amount(value: number | null | undefined, currency?: string | null) {
  if (value === null || value === undefined) return 'N/A'
  return `${Number(value).toFixed(2)} ${currency || ''}`.trim()
}

function SummaryItem({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase text-slate-400">{label}</div>
      <div className={['mt-1 break-words text-[13px] font-semibold', accent || 'text-slate-800'].join(' ')}>{value}</div>
    </div>
  )
}

function readableKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function safeUnavailableEntries(row: ExtendStayUnavailableDate) {
  return Object.entries(row).filter(([key]) => {
    const normalized = key.replace(/[\s_-]/g, '').toLowerCase()
    return !hiddenKeys.has(key) && !normalized.endsWith('id') && normalized !== 'warnings'
  })
}

export function ExtendStayStep2({
  evaluation,
  manualNightlyRate,
  submitError,
  submitting,
  onBack,
  onCancel,
  onConfirm,
}: Props) {
  const currency = evaluation?.currency || 'EUR'
  const unavailableDates = evaluation?.unavailableDates ?? []
  const canConfirm = Boolean(evaluation) && unavailableDates.length === 0 && Boolean(evaluation?.isAllowed || evaluation?.requiresManualApproval)
  const isBlocked = !canConfirm

  return (
    <>
      <div className="bg-[#0B4EA2] px-8 py-5">
        <div className="text-xl font-semibold text-white">Extend Stay Quote</div>
        <div className="mt-1 text-sm text-white/90">Review the policy result before extending the reservation</div>
      </div>

      <div className="space-y-6 bg-slate-50 p-8 text-slate-700">
        {!evaluation ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            No extend stay evaluation is available. Go back and evaluate the request again.
          </div>
        ) : (
          <>
            <div
              className={[
                'flex items-start gap-3 rounded-xl border px-5 py-4 text-sm',
                canConfirm
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-rose-100 bg-rose-50 text-rose-700',
              ].join(' ')}
            >
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                {canConfirm ? null : (
                  <div className="font-bold">Extend stay cannot be confirmed</div>
                )}
                <div className={['text-[13px]', canConfirm ? '' : 'mt-1'].join(' ')}>
                  {evaluation.requiresManualApproval
                    ? 'Manual approval is required; the request will be sent with approval override.'
                    : 'No manual approval is required.'}
                </div>
                {unavailableDates.length ? (
                  <div className="mt-1 text-[13px]">Unavailable dates are listed below.</div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold text-slate-800">Evaluation Details</div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                <SummaryItem label="Current Check-out" value={formatDate(evaluation.currentCheckoutDate)} />
                <SummaryItem label="New Check-out" value={formatDate(evaluation.newCheckoutDate)} />
                <SummaryItem label="Additional Nights" value={valueOrNA(evaluation.additionalNights)} />
                <SummaryItem label="Allowed" value={valueOrNA(evaluation.isAllowed)} />
                <SummaryItem label="Manual Approval" value={valueOrNA(evaluation.requiresManualApproval)} />
                <SummaryItem label="Policy Type" value={valueOrNA(evaluation.policyType)} />
                <SummaryItem label="Policy Code" value={valueOrNA(evaluation.policyCode)} />
                <SummaryItem label="Policy Name" value={valueOrNA(evaluation.policyName)} />
                <SummaryItem label="Calculation Base" value={amount(evaluation.calculationBase, currency)} />
                <SummaryItem label="Calculation Source" value={valueOrNA(evaluation.calculationBaseSource)} />
                <SummaryItem label="Pricing Source" value={valueOrNA(evaluation.pricingSource)} />
                <SummaryItem label="Room Type" value={valueOrNA(evaluation.roomTypeName)} />
                <SummaryItem label="Assigned Room" value={valueOrNA(evaluation.assignedRoomNumber)} />
                <SummaryItem label="Rate Plan" value={valueOrNA(evaluation.ratePlanCode)} />
                <SummaryItem label="Currency" value={valueOrNA(evaluation.currency)} />
                <SummaryItem label="Manual Nightly Rate" value={amount(manualNightlyRate, currency)} />
                <SummaryItem label="Meal Plan Confirmation" value={valueOrNA(evaluation.requiresMealPlanConfirmation)} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold text-slate-800">Additional Charges</div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                <SummaryItem label="Room Before Tax" value={amount(evaluation.additionalRoomAmountBeforeTax, currency)} />
                <SummaryItem label="Room Tax" value={amount(evaluation.additionalRoomTaxAmount, currency)} />
                <SummaryItem label="Room After Tax" value={amount(evaluation.additionalRoomAmountAfterTax, currency)} />
                <SummaryItem label="Meal Plan" value={amount(evaluation.additionalMealPlanAmount, currency)} />
                <SummaryItem label="Recurring Services" value={amount(evaluation.additionalRecurringServicesAmount, currency)} />
                <SummaryItem label="Grand Total" value={amount(evaluation.additionalGrandTotal, currency)} accent="text-[#0B4EA2]" />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold text-slate-800">Nightly Breakdown</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[12px]">
                  <thead className="bg-[#EAF2FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Room Type</th>
                      <th className="px-4 py-3 font-semibold">Rate Plan</th>
                      <th className="px-4 py-3 font-semibold">Adults</th>
                      <th className="px-4 py-3 font-semibold">Children</th>
                      <th className="px-4 py-3 font-semibold">Base Room</th>
                      <th className="px-4 py-3 font-semibold">Tax</th>
                      <th className="px-4 py-3 font-semibold">Room After Tax</th>
                      <th className="px-4 py-3 font-semibold">Meal Plan</th>
                      <th className="px-4 py-3 font-semibold">Services</th>
                      <th className="px-4 py-3 font-semibold">Night Total</th>
                      <th className="px-4 py-3 font-semibold">Room Type Available</th>
                      <th className="px-4 py-3 font-semibold">Assigned Room Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.nightlyBreakdown?.length ? (
                      evaluation.nightlyBreakdown.map((line, index) => (
                        <tr key={`${line.date}-${index}`} className={index % 2 ? 'bg-[#F4F9FF]' : 'bg-white'}>
                          <td className="px-4 py-3 font-medium text-slate-800">{formatDate(line.date)}</td>
                          <td className="px-4 py-3 text-slate-600">{valueOrNA(line.roomTypeName)}</td>
                          <td className="px-4 py-3 text-slate-600">{valueOrNA(line.ratePlanCode)}</td>
                          <td className="px-4 py-3 text-slate-600">{line.adults}</td>
                          <td className="px-4 py-3 text-slate-600">{line.children}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.baseRoomAmount, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.taxAmount, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.roomAmountAfterTax, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.mealPlanAmount, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.recurringServiceAmount, currency)}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{amount(line.nightTotal, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{valueOrNA(line.isRoomTypeAvailable)}</td>
                          <td className="px-4 py-3 text-slate-600">{valueOrNA(line.isAssignedRoomAvailable)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={13} className="px-4 py-6 text-center text-slate-500">N/A</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold text-slate-800">Meal Plan Breakdown</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[12px]">
                  <thead className="bg-[#EAF2FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Code</th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Pricing Mode</th>
                      <th className="px-4 py-3 font-semibold">Added Days</th>
                      <th className="px-4 py-3 font-semibold">Unit Price</th>
                      <th className="px-4 py-3 font-semibold">Added Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.mealPlanBreakdown?.length ? (
                      evaluation.mealPlanBreakdown.map((line, index) => (
                        <tr key={`${line.mealPlanCode || line.mealPlanName || 'meal'}-${index}`} className={index % 2 ? 'bg-[#F4F9FF]' : 'bg-white'}>
                          <td className="px-4 py-3 text-slate-600">{valueOrNA(line.mealPlanCode)}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{valueOrNA(line.mealPlanName)}</td>
                          <td className="px-4 py-3 text-slate-600">{valueOrNA(line.pricingMode)}</td>
                          <td className="px-4 py-3 text-slate-600">{line.addedDays}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.unitPrice, currency)}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{amount(line.addedAmount, currency)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-500">N/A</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {unavailableDates.length ? (
              <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
                <div className="mb-4 text-sm font-bold text-rose-700">Unavailable Dates</div>
                <div className="space-y-3">
                  {unavailableDates.map((row, index) => {
                    const entries = safeUnavailableEntries(row)
                    return (
                      <div key={index} className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                        {entries.length ? (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {entries.map(([key, value]) => (
                              <SummaryItem key={key} label={readableKey(key)} value={valueOrNA(value)} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-rose-700">Unavailable date</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}

        {submitError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{submitError}</div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-11 rounded-xl border border-[#0B4EA2] px-8 text-sm font-semibold text-[#0B4EA2] transition-colors hover:bg-blue-50 disabled:opacity-60"
            onClick={onBack}
            disabled={submitting}
          >
            Back
          </button>
          <button
            type="button"
            className="h-11 rounded-xl border border-slate-200 px-8 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-60"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#093d81] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onConfirm}
          disabled={isBlocked || submitting}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? 'Extending...' : 'Confirm Extend Stay'}
        </button>
      </div>
    </>
  )
}
