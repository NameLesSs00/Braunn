import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, X } from 'lucide-react'

import { Modal } from '../../../shared/ui/Modal'
import {
  cancelPmsReservation,
  createReservationPayment,
  evaluateCancellationPolicy,
  getPmsReservationFolio,
} from '../../../shared/apis/PmsReservation'
import type {
  CancelReservationResult,
  PmsReservation,
  PmsReservationFolio,
  ReservationPolicyEvaluationResult,
} from '../../../models/PmsReservation'
import { formatMoney } from '../../../widgets/reservations/CheckInProcessModal/utils'

type Props = {
  open: boolean
  onClose: () => void
  reservation: PmsReservation | null
  onSuccess?: () => void
}

type FlowStep = 'review' | 'payment' | 'success'

type CancelPaymentData = {
  amount: string
  currency: string
  paymentMethod: 'Card' | 'Cash' | 'Online'
  paymentReference: string
  paymentDate: string
  paymentType: 'Deposit' | 'Payment'
  method: 'Card' | 'Cash' | 'Online'
}

const PAYMENT_METHODS: CancelPaymentData['paymentMethod'][] = ['Card', 'Cash', 'Online']
const PAYMENT_TYPES: CancelPaymentData['paymentType'][] = ['Deposit', 'Payment']
const CURRENCIES = ['EUR', 'USD', 'GBP', 'EGP', 'SAR', 'AED', 'JOD', 'KWD']

function dateTimeLocalNow() {
  return new Date().toISOString().substring(0, 16)
}

// Unused inference functions removed

export function CancelReservationProcessPopup({ open, onClose, reservation, onSuccess }: Props) {
  const [step, setStep] = useState<FlowStep>('review')
  const [evaluation, setEvaluation] = useState<ReservationPolicyEvaluationResult | null>(null)
  const [folio, setFolio] = useState<PmsReservationFolio | null>(null)
  const [cancelResult, setCancelResult] = useState<CancelReservationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)
  const [paymentData, setPaymentData] = useState<CancelPaymentData>({
    amount: '',
    currency: 'EUR',
    paymentMethod: 'Card',
    paymentReference: '',
    paymentDate: dateTimeLocalNow(),
    paymentType: 'Deposit',
    method: 'Card',
  })

  useEffect(() => {
    if (!open || !reservation) return

    const controller = new AbortController()
    setStep('review')
    setEvaluation(null)
    setFolio(null)
    setCancelResult(null)
    setLoadError(null)
    setActionError(null)
    setLoading(true)

    void Promise.all([
      getPmsReservationFolio(reservation.id, controller.signal).catch(() => null),
    ])
      .then(async ([folioRes]) => {
        if (controller.signal.aborted) return
        setFolio(folioRes)

        const evaluationRes = await evaluateCancellationPolicy(
          {
            reservationId: reservation.id,
            evaluationDateTime: new Date().toISOString()
          },
          controller.signal,
        )
        if (controller.signal.aborted) return
        setEvaluation(evaluationRes)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load cancellation policy data.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [open, reservation?.id])

  const currency = folio?.currency || reservation?.currency || 'EUR'
  const balanceDue = Math.max(
    0,
    folio?.remainingBalance ?? cancelResult?.remainingBalance ?? evaluation?.penaltyAmount ?? 0,
  )
  const canContinue = Boolean(evaluation?.isAllowed)

  useEffect(() => {
    if (!open) return
    setPaymentData((prev) => ({
      ...prev,
      amount: balanceDue > 0 ? String(balanceDue) : prev.amount,
      currency,
      paymentDate: dateTimeLocalNow(),
    }))
  }, [balanceDue, currency, open])

  const refreshFolio = async () => {
    if (!reservation) return null
    const folioRes = await getPmsReservationFolio(reservation.id)
    setFolio(folioRes)
    return folioRes
  }

  const closeWithSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const continueCancellation = async () => {
    if (!reservation || !evaluation) return
    setCancelling(true)
    setActionError(null)

    try {
      const result = await cancelPmsReservation(reservation.id, {
        reason: 'user request',
        cancellationDate: new Date().toISOString(),
        forceManualApprovalOverride: true,
        externalReference: `Cancellation:user request`,
        postPenaltyToFolio: true,
        processRefund: evaluation.refundAmount > 0,
        refundPaymentMethod: 'Card',
        refundReference: '',
        originalPaymentId: folio?.payments?.[0]?.paymentId || null,
        refundExternalReference: '',
      })

      setCancelResult(result)
      const folioRes = await refreshFolio().catch(() => null)
      const remaining = Math.max(0, folioRes?.remainingBalance ?? result.remainingBalance ?? result.penaltyAmount ?? 0)

      setPaymentData((prev) => ({
        ...prev,
        amount: String(remaining),
        currency: folioRes?.currency || currency,
        paymentDate: dateTimeLocalNow(),
        paymentReference: '',
      }))

      setStep('payment')
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Failed to cancel reservation.')
    } finally {
      setCancelling(false)
    }
  }

  const submitPenaltyPayment = async () => {
    if (!reservation) return
    const amount = Number(paymentData.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError('Payment amount must be greater than 0.')
      return
    }

    setSubmittingPayment(true)
    setActionError(null)

    try {
      await createReservationPayment(reservation.id, {
        amount,
        currency: paymentData.currency || currency,
        paymentMethod: paymentData.paymentMethod,
        paymentReference: paymentData.paymentReference || null,
        paymentDate: paymentData.paymentDate ? new Date(paymentData.paymentDate).toISOString() : new Date().toISOString(),
        paymentType: paymentData.paymentType,
        method: paymentData.method,
        reference: paymentData.paymentReference || null,
      })
      await refreshFolio().catch(() => null)
      setStep('success')
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Failed to submit cancellation payment.')
    } finally {
      setSubmittingPayment(false)
    }
  }

  if (!reservation) return null

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="flex h-[calc(100vh-2rem)] w-[94vw] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-8 py-5">
          <div>
            <div className="text-lg font-semibold text-white">Cancel Reservation</div>
            <div className="text-sm text-white/80">
              {reservation.guestName || 'Guest'} - {reservation.bookingReference || reservation.id}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-8 py-6">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
            <StepIcon active={step === 'review'} completed={step !== 'review'} label="Review" />
            <div className={['mx-4 h-[2px] flex-1', step !== 'review' ? 'bg-emerald-500' : 'bg-slate-100'].join(' ')} />
            <StepIcon active={step === 'payment'} completed={step === 'success'} label="Payment" />
            <div className={['mx-4 h-[2px] flex-1', step === 'success' ? 'bg-emerald-500' : 'bg-slate-100'].join(' ')} />
            <StepIcon active={step === 'success'} completed={false} label="Done" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-slate-100 text-slate-500">
              <Loader2 className="h-9 w-9 animate-spin text-[#0B4EA2]" />
              <div className="mt-3 text-sm font-semibold">Loading cancellation policy...</div>
            </div>
          ) : loadError ? (
            <ErrorBox message={loadError} />
          ) : step === 'review' ? (
            <ReviewStep
              evaluation={evaluation}
              reservation={reservation}
              folio={folio}
              actionError={actionError}
              cancelling={cancelling}
              canContinue={canContinue}
              onCancel={onClose}
              onContinue={continueCancellation}
            />
          ) : step === 'payment' ? (
            <PaymentStep
              reservation={reservation}
              folio={folio}
              cancelResult={cancelResult}
              paymentData={paymentData}
              actionError={actionError}
              submitting={submittingPayment}
              balanceDue={balanceDue}
              currency={currency}
              onBack={() => setStep('review')}
              onSkip={() => setStep('success')}
              onPaymentChange={(data) => setPaymentData((prev) => ({ ...prev, ...data }))}
              onSubmit={submitPenaltyPayment}
            />
          ) : (
            <SuccessStep
              reservation={reservation}
              folio={folio}
              cancelResult={cancelResult}
              onDone={closeWithSuccess}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

function ReviewStep({
  evaluation,
  reservation,
  folio,
  actionError,
  cancelling,
  canContinue,
  onCancel,
  onContinue,
}: {
  evaluation: ReservationPolicyEvaluationResult | null
  reservation: PmsReservation
  folio: PmsReservationFolio | null
  actionError: string | null
  cancelling: boolean
  canContinue: boolean
  onCancel: () => void
  onContinue: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SummaryTile label="Guest" value={reservation.guestName || '-----'} />
        <SummaryTile label="Status" value={reservation.status || '-----'} />
        <SummaryTile label="Payment" value={folio?.paymentStatus || '-----'} />
      </div>

      <Section title="Cancellation evaluation">
        {evaluation ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <InfoItem label="Policy code" value={evaluation.policyCode} />
            <InfoItem label="Policy name" value={evaluation.policyName} />
            <InfoItem label="Policy type" value={evaluation.policyType} />
            <InfoItem label="Reason" value={evaluation.reason} className="lg:col-span-3" />
            <InfoItem label="Percentage" value={`${evaluation.percentage}%`} />
            <InfoItem label="Calculation base" value={formatMoney(evaluation.calculationBase, folio?.currency || reservation.currency || 'EUR')} />
            <InfoItem label="Base source" value={evaluation.calculationBaseSource} />
            <InfoItem label="Penalty amount" value={formatMoney(evaluation.penaltyAmount, folio?.currency || reservation.currency || 'EUR')} />
            <InfoItem label="Calculated amount" value={formatMoney(evaluation.calculatedAmount, folio?.currency || reservation.currency || 'EUR')} />
            <InfoItem label="Manual approval" value={evaluation.requiresManualApproval ? 'Required' : 'Not required'} />
          </div>
        ) : (
          <div className="text-sm text-slate-500">No evaluation result found.</div>
        )}
      </Section>

      {evaluation?.warnings?.length ? <WarningList warnings={evaluation.warnings} /> : null}
      {actionError ? <ErrorBox message={actionError} /> : null}

      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-xl border border-slate-200 px-8 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel process
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || cancelling}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-rose-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
        >
          {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Continue cancellation
        </button>
      </div>
    </div>
  )
}

function PaymentStep({
  reservation,
  folio,
  cancelResult,
  paymentData,
  actionError,
  submitting,
  balanceDue,
  currency,
  onBack,
  onSkip,
  onPaymentChange,
  onSubmit,
}: {
  reservation: PmsReservation
  folio: PmsReservationFolio | null
  cancelResult: CancelReservationResult | null
  paymentData: CancelPaymentData
  actionError: string | null
  submitting: boolean
  balanceDue: number
  currency: string
  onBack: () => void
  onSkip: () => void
  onPaymentChange: (data: Partial<CancelPaymentData>) => void
  onSubmit: () => void
}) {
  const paymentStatus = folio?.paymentStatus || cancelResult?.paymentStatus || 'Pending'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <SummaryTile label="Reservation status" value={folio?.reservationStatus || cancelResult?.newStatus || reservation.status || '-----'} />
        <SummaryTile label="Payment status" value={paymentStatus} />
        <SummaryTile label="Penalty" value={formatMoney(cancelResult?.penaltyAmount ?? balanceDue, currency)} />
        <SummaryTile label="Remaining balance" value={formatMoney(balanceDue, currency)} />
      </div>

      {cancelResult?.warnings?.length ? <WarningList warnings={cancelResult.warnings} /> : null}
      {actionError ? <ErrorBox message={actionError} /> : null}

      {balanceDue <= 0 ? (
        <Section title="Cancellation payment">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="text-base font-bold text-emerald-700">Free cancellation</div>
            <div className="mt-2 text-sm leading-6 text-emerald-700">
              This cancellation is free. The customer does not need to pay anything for this reservation cancellation.
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <SummaryTile label="Amount due" value={formatMoney(0, currency)} />
              <SummaryTile label="Payment needed" value="No" />
            </div>
          </div>
        </Section>
      ) : (
        <Section title="Cancellation payment">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <TextInput
              label="Amount *"
              type="number"
              value={paymentData.amount}
              disabled={submitting}
              onChange={(amount) => onPaymentChange({ amount })}
            />
            <SelectInput label="Currency" value={paymentData.currency} disabled={submitting} onChange={(currencyValue) => onPaymentChange({ currency: currencyValue })}>
              {CURRENCIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
            <SelectInput
              label="Payment Method *"
              value={paymentData.paymentMethod}
              disabled={submitting}
              onChange={(paymentMethod) => onPaymentChange({ paymentMethod: paymentMethod as CancelPaymentData['paymentMethod'], method: paymentMethod as CancelPaymentData['method'] })}
            >
              {PAYMENT_METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
            <SelectInput label="Payment Type" value={paymentData.paymentType} disabled={submitting} onChange={(paymentType) => onPaymentChange({ paymentType: paymentType as CancelPaymentData['paymentType'] })}>
              {PAYMENT_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
            <SelectInput label="Method" value={paymentData.method} disabled={submitting} onChange={(method) => onPaymentChange({ method: method as CancelPaymentData['method'] })}>
              {PAYMENT_METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
            </SelectInput>
            <TextInput
              label="Payment Date"
              type="datetime-local"
              value={paymentData.paymentDate}
              disabled={submitting}
              onChange={(paymentDate) => onPaymentChange({ paymentDate })}
            />
            <TextInput
              label="Payment Reference"
              value={paymentData.paymentReference}
              className="lg:col-span-3"
              disabled={submitting}
              onChange={(paymentReference) => onPaymentChange({ paymentReference })}
            />
          </div>
        </Section>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="h-11 rounded-xl border border-slate-200 px-8 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          {balanceDue <= 0 ? (
            <button
              type="button"
              onClick={onSkip}
              className="h-11 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white hover:bg-[#093d81]"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B4EA2] px-8 text-sm font-semibold text-white hover:bg-[#093d81] disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Pay cancellation balance
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SuccessStep({
  reservation,
  folio,
  cancelResult,
  onDone,
}: {
  reservation: PmsReservation
  folio: PmsReservationFolio | null
  cancelResult: CancelReservationResult | null
  onDone: () => void
}) {
  const currency = folio?.currency || reservation.currency || 'EUR'

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <CheckCircle2 className="h-11 w-11" />
      </div>
      <h3 className="text-2xl font-extrabold text-slate-800">Reservation Cancelled</h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
        Reservation <strong>{cancelResult?.bookingReference || reservation.bookingReference || reservation.id}</strong> has been cancelled.
      </p>

      <div className="mt-7 grid w-full grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryTile label="Previous status" value={cancelResult?.previousStatus || '-----'} />
        <SummaryTile label="New status" value={folio?.reservationStatus || cancelResult?.newStatus || 'Cancelled'} />
        <SummaryTile label="Payment status" value={folio?.paymentStatus || cancelResult?.paymentStatus || '-----'} />
        <SummaryTile label="Remaining balance" value={formatMoney(folio?.remainingBalance ?? cancelResult?.remainingBalance ?? 0, currency)} />
        <SummaryTile label="Penalty amount" value={formatMoney(cancelResult?.penaltyAmount ?? 0, currency)} />
        <SummaryTile label="Refund amount" value={formatMoney(cancelResult?.refundAmount ?? 0, currency)} />
      </div>

      {cancelResult?.warnings?.length ? <div className="mt-5 w-full"><WarningList warnings={cancelResult.warnings} /></div> : null}

      <button
        type="button"
        onClick={onDone}
        className="mt-8 h-12 w-full max-w-sm rounded-2xl bg-[#0B4EA2] text-sm font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-[#093d81]"
      >
        Done
      </button>
    </div>
  )
}

function StepIcon({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={[
        'grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition-colors',
        completed ? 'bg-emerald-500 text-white' : active ? 'bg-[#0B4EA2] text-white' : 'bg-slate-100 text-slate-400',
      ].join(' ')}>
        {completed ? <CheckCircle2 className="h-5 w-5" /> : label.slice(0, 1)}
      </div>
      <span className={['text-[12px] font-bold', active ? 'text-[#0B4EA2]' : completed ? 'text-emerald-600' : 'text-slate-400'].join(' ')}>
        {label}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h4 className="mb-4 text-sm font-bold text-slate-800">{title}</h4>
      {children}
    </section>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm font-bold text-slate-800">{value}</div>
    </div>
  )
}

function InfoItem({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-slate-800">{value || '-----'}</div>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <label className={['block space-y-2', className].join(' ')}>
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#0B4EA2] focus:bg-white disabled:opacity-60"
      />
    </label>
  )
}

function SelectInput({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm outline-none focus:border-[#0B4EA2] focus:bg-white disabled:opacity-60"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
      {message}
    </div>
  )
}

function WarningList({ warnings }: { warnings: string[] }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      <div className="mb-2 flex items-center gap-2 font-bold">
        <AlertTriangle className="h-4 w-4" />
        Warnings
      </div>
      <ul className="space-y-1">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  )
}
