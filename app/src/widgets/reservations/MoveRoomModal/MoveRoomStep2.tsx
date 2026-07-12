import { AlertTriangle, ArrowRight, Home, Loader2, X } from 'lucide-react'

import type { EvaluateRoomChangeResponse, PmsReservation } from '../../../models/PmsReservation'
import type { RoomAvailability } from '../../../models/Room'
import type { MoveRoomContext } from './MoveRoomModal'
import { formatMoney } from '../CheckInProcessModal/utils'

type Props = {
  reservation: PmsReservation
  context: MoveRoomContext
  evaluation: EvaluateRoomChangeResponse | null
  selectedRoom: RoomAvailability | null
  reason: string
  setReason: (value: string) => void
  submitError: string | null
  submitting: boolean
  onBack: () => void
  onCancel: () => void
  onConfirm: () => void
}

function valueOrNA(value: unknown) {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'string') return value.trim() ? value : 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function formatDate(isoString?: string | null) {
  if (!isoString) return 'N/A'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function amount(value: number | null | undefined, currency?: string | null) {
  if (value === null || value === undefined) return 'N/A'
  return formatMoney(value, currency || 'EUR')
}

function SummaryItem({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={['mt-1 break-words text-[13px] font-semibold', accent || 'text-slate-800'].join(' ')}>{value}</div>
    </div>
  )
}

export function MoveRoomStep2({
  reservation,
  context,
  evaluation,
  selectedRoom,
  reason,
  setReason,
  submitError,
  submitting,
  onBack,
  onCancel,
  onConfirm,
}: Props) {
  const currency = evaluation?.currency || reservation.currency || 'EUR'
  const unavailableDates = evaluation?.unavailableDates ?? []
  const isBlocked = !evaluation || !evaluation.isAllowed || unavailableDates.length > 0

  return (
    <>
      <div className="relative bg-[#0B4EA2] px-8 py-5">
        <div className="text-xl font-semibold text-white">Confirm Room Change</div>
        <div className="mt-1 text-sm text-white/90">Review the policy result before changing the room</div>
        <button
          type="button"
          className="absolute right-6 top-6 grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          onClick={onCancel}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 bg-slate-50 p-8 text-slate-700">
        {!evaluation ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            No room change evaluation is available. Go back and evaluate the selected room again.
          </div>
        ) : (
          <>
            <div
              className={[
                'flex items-start gap-3 rounded-xl border px-5 py-4 text-sm',
                evaluation.isAllowed && unavailableDates.length === 0
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-rose-100 bg-rose-50 text-rose-700',
              ].join(' ')}
            >
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                {evaluation.isAllowed && unavailableDates.length === 0 ? null : (
                  <div className="font-bold">Room change cannot be confirmed</div>
                )}
                <div className={['text-[13px]', evaluation.isAllowed && unavailableDates.length === 0 ? '' : 'mt-1'].join(' ')}>
                  {evaluation.requiresManualApproval
                    ? 'Manual approval is required; the request will be sent with approval override.'
                    : 'No manual approval is required.'}
                </div>
                {unavailableDates.length ? (
                  <div className="mt-1 text-[13px]">Unavailable dates: {unavailableDates.map(formatDate).join(', ')}</div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold text-slate-800">Room Change Summary</div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Home className="h-5 w-5" />
                    <span className="text-xl font-bold text-slate-800">{evaluation.currentRoomNumber || context.currentRoomNumber || 'N/A'}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500">{evaluation.currentRoomTypeName || context.currentRoomTypeName || 'N/A'}</div>
                </div>

                <div className="grid h-full min-h-24 w-12 place-items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EAF2FF] text-[#0B4EA2]">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-xl border border-[#0B4EA2] bg-[#F4F9FF] p-5">
                  <div className="flex items-center gap-2 text-[#0B4EA2]">
                    <Home className="h-5 w-5" />
                    <span className="text-xl font-bold">{evaluation.newRoomNumber || selectedRoom?.roomNumber || 'N/A'}</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-500">{evaluation.newRoomTypeName || selectedRoom?.roomTypeName || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold text-slate-800">Evaluation Details</div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
                <SummaryItem label="Change Type" value={valueOrNA(evaluation.changeType)} />
                <SummaryItem label="Effective Date" value={formatDate(evaluation.effectiveDate)} />
                <SummaryItem label="Check-out Date" value={formatDate(evaluation.checkoutDate)} />
                <SummaryItem label="Remaining Nights" value={valueOrNA(evaluation.remainingNights)} />
                <SummaryItem label="Rate Plan" value={valueOrNA(evaluation.ratePlanCode)} />
                <SummaryItem label="Currency" value={valueOrNA(evaluation.currency)} />
                <SummaryItem label="Old Stay Amount" value={amount(evaluation.oldStayAmount, currency)} />
                <SummaryItem label="New Stay Amount" value={amount(evaluation.newStayAmount, currency)} />
                <SummaryItem
                  label="Rate Difference"
                  value={amount(evaluation.rateDifference, currency)}
                  accent={evaluation.rateDifference > 0 ? 'text-rose-600' : evaluation.rateDifference < 0 ? 'text-emerald-600' : undefined}
                />
                <SummaryItem label="Upgrade Charge" value={amount(evaluation.upgradeChargeAmount, currency)} accent={evaluation.upgradeChargeAmount > 0 ? 'text-rose-600' : undefined} />
                <SummaryItem label="Downgrade Credit" value={amount(evaluation.downgradeCreditAmount, currency)} accent={evaluation.downgradeCreditAmount > 0 ? 'text-emerald-600' : undefined} />
                <SummaryItem label="Net Paid Amount" value={amount(evaluation.netPaidAmount, currency)} />
                <SummaryItem label="Estimated Remaining Balance" value={amount(evaluation.estimatedRemainingBalanceAfterAdjustment, currency)} />
                <SummaryItem label="Maximum Refundable" value={amount(evaluation.maximumRefundableAmount, currency)} />
                <SummaryItem label="Suggested Refund" value={amount(evaluation.suggestedRefundAmount, currency)} accent={evaluation.suggestedRefundAmount > 0 ? 'text-emerald-600' : undefined} />
                <SummaryItem label="Allowed" value={valueOrNA(evaluation.isAllowed)} />
                <SummaryItem label="Manual Approval" value={valueOrNA(evaluation.requiresManualApproval)} />
                <SummaryItem label="Policy Code" value={valueOrNA(evaluation.policyCode)} />
                <SummaryItem label="Policy Name" value={valueOrNA(evaluation.policyName)} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 text-sm font-bold text-slate-800">Nightly Breakdown</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-[12px]">
                  <thead className="bg-[#EAF2FF] text-slate-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Old Before Tax</th>
                      <th className="px-4 py-3 font-semibold">Old Tax</th>
                      <th className="px-4 py-3 font-semibold">Old After Tax</th>
                      <th className="px-4 py-3 font-semibold">New Before Tax</th>
                      <th className="px-4 py-3 font-semibold">New Tax</th>
                      <th className="px-4 py-3 font-semibold">New After Tax</th>
                      <th className="px-4 py-3 font-semibold">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.nightlyBreakdown?.length ? (
                      evaluation.nightlyBreakdown.map((line, index) => (
                        <tr key={`${line.date}-${index}`} className={index % 2 ? 'bg-[#F4F9FF]' : 'bg-white'}>
                          <td className="px-4 py-3 font-medium text-slate-800">{formatDate(line.date)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.oldNightRateBeforeTax, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.oldTax, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.oldNightRateAfterTax, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.newNightRateBeforeTax, currency)}</td>
                          <td className="px-4 py-3 text-slate-600">{amount(line.newTax, currency)}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{amount(line.newNightRateAfterTax, currency)}</td>
                          <td className={['px-4 py-3 font-semibold', line.difference > 0 ? 'text-rose-600' : line.difference < 0 ? 'text-emerald-600' : 'text-slate-800'].join(' ')}>
                            {amount(line.difference, currency)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-slate-500">N/A</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Reason</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
            placeholder="Room change from PMS"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={submitting}
          />
        </div>

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
          {submitting ? 'Confirming...' : 'Confirm Room Change'}
        </button>
      </div>
    </>
  )
}
