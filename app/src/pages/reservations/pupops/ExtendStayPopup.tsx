import { X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import type {
  EvaluateExtendStayResponse,
  ExecuteExtendStayResponse,
  PmsReservation,
  PmsReservationDetails,
} from '../../../models/PmsReservation'
import { evaluateExtendStay, executeExtendStay, getPmsReservationById } from '../../../shared/apis/PmsReservation'
import { useAppSelector } from '../../../shared/apis/hooks'
import { Modal } from '../../../shared/ui/Modal'
import { ExtendStayStep1 } from './extendStay/steps/ExtendStayStep1'
import { ExtendStayStep2 } from './extendStay/steps/ExtendStayStep2'
import { ExtendStayStep3 } from './extendStay/steps/ExtendStayStep3'

type Props = {
  open: boolean
  onClose: () => void
  reservationId: string | null
  onSuccess?: () => void
}

const DEFAULT_REASON = 'Guest requested extend stay'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return fallback
}

function isoDateOnly(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}

function dateTimeForDate(value: string) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function reservationFromInHouse(row: any): PmsReservation | null {
  if (!row) return null
  return {
    id: row.reservationId,
    guestName: row.guestFullName,
    roomNumber: row.roomNumber,
    roomTypeName: row.roomTypeName,
    checkInDate: row.checkInDate,
    checkOutDate: row.checkOutDate,
    status: row.status,
    totalAmount: row.remainingBalance,
    paidAmount: 0,
    channelName: null,
  }
}

export function ExtendStayPopup({ open, onClose, reservationId, onSuccess }: Props) {
  const pmsReservations = useAppSelector((state) => state.pms.reservations)
  const reservationsTableRows = useAppSelector((state) => state.pms.reservationsTableRows)
  const inHouseListRows = useAppSelector((state) => state.pms.inHouseListRows)
  const roomAllocationRows = useAppSelector((state) => state.pms.roomAllocationRows)
  const inHouseReservations = useAppSelector((state) => state.pms.inHouseReservations)

  const reservation = useMemo(() => {
    if (!reservationId) return null
    const row = [
      ...reservationsTableRows,
      ...inHouseListRows,
      ...roomAllocationRows,
      ...pmsReservations,
    ].find((item) => item.id === reservationId)
    if (row) return row
    return reservationFromInHouse(inHouseReservations.find((item) => item.reservationId === reservationId))
  }, [inHouseListRows, inHouseReservations, pmsReservations, reservationId, reservationsTableRows, roomAllocationRows])

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [details, setDetails] = useState<PmsReservationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [newCheckoutDate, setNewCheckoutDate] = useState('')
  const [manualNightlyRate, setManualNightlyRate] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluateExtendStayResponse | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<ExecuteExtendStayResponse | null>(null)

  const evaluatingRef = useRef(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    if (!open || !reservationId) return

    const controller = new AbortController()
    setStep(1)
    setDetails(null)
    setLoadError(null)
    setLoading(true)
    setNewCheckoutDate('')
    setManualNightlyRate('')
    setEvaluation(null)
    setEvaluating(false)
    setEvaluationError(null)
    setSubmitting(false)
    setSubmitError(null)
    setResult(null)
    evaluatingRef.current = false
    submittingRef.current = false

    void getPmsReservationById(reservationId, controller.signal)
      .then((response) => {
        setDetails(response)
        const currentCheckout = response.reservationRooms?.[0]?.checkOutDate || response.checkOutDate
        if (currentCheckout) {
          const current = new Date(`${isoDateOnly(currentCheckout)}T00:00:00`)
          if (!Number.isNaN(current.getTime())) {
            current.setDate(current.getDate() + 1)
            setNewCheckoutDate(current.toISOString().slice(0, 10))
          }
        }
        const nightlyRate = response.reservationRooms?.[0]?.pricePerNight || response.baseRateAtBooking || 0
        if (nightlyRate > 0) setManualNightlyRate(String(nightlyRate))
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setLoadError(getErrorMessage(error, 'Failed to load extend stay details.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [open, reservationId])

  const resetAndClose = () => {
    if (evaluating || submitting) return
    onClose()
    setStep(1)
    setDetails(null)
    setLoadError(null)
    setNewCheckoutDate('')
    setManualNightlyRate('')
    setEvaluation(null)
    setEvaluationError(null)
    setSubmitError(null)
    setResult(null)
    evaluatingRef.current = false
    submittingRef.current = false
  }

  const handleEvaluate = async () => {
    if (!reservationId || evaluatingRef.current) return
    const rate = Number(manualNightlyRate)
    if (!newCheckoutDate) {
      setEvaluationError('New check-out date is required.')
      return
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      setEvaluationError('Manual nightly rate must be greater than 0.')
      return
    }

    evaluatingRef.current = true
    setEvaluating(true)
    setEvaluationError(null)
    setSubmitError(null)

    try {
      const quote = await evaluateExtendStay({
        reservationId,
        newCheckoutDate,
        evaluationDateTime: new Date().toISOString(),
        useCurrentRatePlan: true,
        manualNightlyRate: rate,
        forceManualApprovalOverride: true,
      })
      setEvaluation(quote)
      setStep(2)
    } catch (error) {
      setEvaluationError(getErrorMessage(error, 'Failed to evaluate extend stay.'))
    } finally {
      evaluatingRef.current = false
      setEvaluating(false)
    }
  }

  const handleConfirm = async () => {
    if (!reservationId || !evaluation || submittingRef.current) return
    if ((!evaluation.isAllowed && !evaluation.requiresManualApproval) || (evaluation.unavailableDates?.length ?? 0) > 0) return

    const rate = Number(manualNightlyRate)
    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await executeExtendStay(reservationId, {
        newCheckoutDate: dateTimeForDate(evaluation.newCheckoutDate || newCheckoutDate),
        reason: DEFAULT_REASON,
        useCurrentRatePlan: true,
        manualNightlyRate: Number.isFinite(rate) && rate > 0 ? rate : 0,
        forceManualApprovalOverride: true,
      })
      setResult(response)
      setStep(3)
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Failed to extend stay.'))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleDone = () => {
    onSuccess?.()
    resetAndClose()
  }

  const fallbackCheckInDate = reservation?.checkInDate || ''
  const fallbackCheckOutDate = reservation?.checkOutDate || ''
  const fallbackGuestName = reservation?.guestName || ''
  const fallbackRoomNumber = reservation?.roomNumber || null

  return (
    <Modal open={open} onClose={resetAndClose} lockScroll>
      <div className="relative flex max-h-[90vh] w-[96vw] max-w-7xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute right-6 top-5 z-10 grid h-9 w-9 place-items-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-60"
          aria-label="Close"
          disabled={evaluating || submitting}
        >
          <X className="h-5 w-5" />
        </button>

        {step === 1 ? (
          <ExtendStayStep1
            details={details}
            fallbackGuestName={fallbackGuestName}
            fallbackRoomNumber={fallbackRoomNumber}
            fallbackCheckInDate={fallbackCheckInDate}
            fallbackCheckOutDate={fallbackCheckOutDate}
            newCheckoutDate={newCheckoutDate}
            onChangeNewCheckoutDate={setNewCheckoutDate}
            manualNightlyRate={manualNightlyRate}
            onChangeManualNightlyRate={setManualNightlyRate}
            loading={loading}
            error={loadError}
            evaluating={evaluating}
            evaluationError={evaluationError}
            onCancel={resetAndClose}
            onEvaluate={handleEvaluate}
          />
        ) : step === 2 ? (
          <ExtendStayStep2
            evaluation={evaluation}
            manualNightlyRate={Number(manualNightlyRate) || 0}
            submitError={submitError}
            submitting={submitting}
            onBack={() => setStep(1)}
            onCancel={resetAndClose}
            onConfirm={handleConfirm}
          />
        ) : (
          <ExtendStayStep3 result={result} onDone={handleDone} />
        )}
      </div>
    </Modal>
  )
}
