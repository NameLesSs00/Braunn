import { CheckCircle2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import type {
  EvaluateRoomChangeResponse,
  PmsReservation,
  PmsReservationDetails,
  PmsReservationFolio,
  RoomChangeType,
} from '../../../models/PmsReservation'
import { fetchRoomTypes } from '../../../features/roomTypes/roomTypesSlice'
import { fetchRoomsAvailability } from '../../../features/rooms/roomsSlice'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { Modal } from '../../../shared/ui/Modal'
import { SuccessAlertModal } from '../../../shared/ui/SuccessAlertModal'
import {
  changeReservationRoom,
  evaluateRoomChange,
  getPmsReservationById,
  getPmsReservationFolio,
} from '../../../shared/apis/PmsReservation'
import { MoveRoomStep1 } from './MoveRoomStep1'
import { MoveRoomStep2 } from './MoveRoomStep2'

type Props = {
  open: boolean
  onClose: () => void
  reservation: PmsReservation | null
  onSuccess?: () => void
}

export type MoveRoomContext = {
  details: PmsReservationDetails | null
  folio: PmsReservationFolio | null
  reservationRoomId: string | null
  currentRoomId: string | null
  currentRoomNumber: string | null
  currentRoomTypeId: string | null
  currentRoomTypeName: string | null
  effectiveDate: string
  checkoutDate: string
}

function localDate(date: Date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isoDateOnly(value?: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

function laterDate(a: string, b: string) {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

function dateTimeForDate(value: string) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function resolveReservationRoomId(details: PmsReservationDetails | null, folio: PmsReservationFolio | null) {
  if (details?.reservationRoomIds?.length) return details.reservationRoomIds[0]
  if (details?.reservationRooms?.length) return details.reservationRooms[0].reservationRoomId
  if (folio?.reservationRooms?.length) return folio.reservationRooms[0].reservationRoomId
  const chargeWithRoomId = folio?.charges?.find((charge) => charge.reservationRoomId)
  return chargeWithRoomId?.reservationRoomId || null
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return fallback
}

export function MoveRoomModal({ open, onClose, reservation, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const roomTypes = useAppSelector((state) => state.roomTypes.items)
  const roomTypesStatus = useAppSelector((state) => state.roomTypes.status)
  const roomsAvailability = useAppSelector((state) => state.rooms.availability)
  const roomsAvailabilityStatus = useAppSelector((state) => state.rooms.availabilityStatus)
  const roomsError = useAppSelector((state) => state.rooms.error)

  const [step, setStep] = useState<1 | 2>(1)
  const [changeType, setChangeType] = useState<RoomChangeType>('OperationalMove')
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState<PmsReservationDetails | null>(null)
  const [folio, setFolio] = useState<PmsReservationFolio | null>(null)
  const [loadingContext, setLoadingContext] = useState(false)
  const [contextError, setContextError] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluateRoomChangeResponse | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const evaluatingRef = useRef(false)
  const submittingRef = useRef(false)

  const context = useMemo<MoveRoomContext>(() => {
    const primaryDetailsRoom = details?.reservationRooms?.[0]
    const primaryFolioRoom = folio?.reservationRooms?.[0]
    const checkInDate = isoDateOnly(primaryDetailsRoom?.checkInDate || primaryFolioRoom?.checkInDate || reservation?.checkInDate)
    const checkoutDate = isoDateOnly(primaryDetailsRoom?.checkOutDate || primaryFolioRoom?.checkOutDate || reservation?.checkOutDate)
    const effectiveDate = laterDate(localDate(), checkInDate || localDate())
    const roomTypeByName = roomTypes.find((roomType) => roomType.name === reservation?.roomTypeName)

    return {
      details,
      folio,
      reservationRoomId: resolveReservationRoomId(details, folio),
      currentRoomId: primaryDetailsRoom?.roomId || reservation?.roomId || null,
      currentRoomNumber: reservation?.roomNumber || primaryFolioRoom?.roomNumber || folio?.roomNumber || null,
      currentRoomTypeId: primaryDetailsRoom?.roomTypeId || reservation?.roomTypeId || roomTypeByName?.id || null,
      currentRoomTypeName: reservation?.roomTypeName || primaryFolioRoom?.roomTypeName || folio?.roomTypeName || roomTypeByName?.name || null,
      effectiveDate,
      checkoutDate: checkoutDate || effectiveDate,
    }
  }, [details, folio, reservation, roomTypes])

  const selectedRoom = useMemo(
    () => roomsAvailability.find((room) => room.roomId === selectedRoomId) || null,
    [roomsAvailability, selectedRoomId],
  )

  const availableRooms = useMemo(
    () => roomsAvailability.filter((room) => room.roomId !== context.currentRoomId),
    [context.currentRoomId, roomsAvailability],
  )

  useEffect(() => {
    if (!open) return
    if (roomTypesStatus === 'idle') {
      void dispatch(fetchRoomTypes())
    }
  }, [dispatch, open, roomTypesStatus])

  useEffect(() => {
    if (!open || !reservation) return

    const controller = new AbortController()
    setLoadingContext(true)
    setContextError(null)
    setDetails(null)
    setFolio(null)
    setStep(1)
    setEvaluation(null)
    setEvaluationError(null)
    setSubmitError(null)
    setSelectedRoomId(null)

    void Promise.all([
      getPmsReservationById(reservation.id, controller.signal),
      getPmsReservationFolio(reservation.id, controller.signal),
    ])
      .then(([detailsRes, folioRes]) => {
        setDetails(detailsRes)
        setFolio(folioRes)
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setContextError(getErrorMessage(error, 'Failed to load room move details.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingContext(false)
      })

    return () => controller.abort()
  }, [open, reservation])

  useEffect(() => {
    if (!open) return
    if (context.currentRoomTypeId && !selectedRoomTypeId) {
      setSelectedRoomTypeId(context.currentRoomTypeId)
    }
  }, [context.currentRoomTypeId, open, selectedRoomTypeId])

  useEffect(() => {
    if (!open || !selectedRoomTypeId || !context.effectiveDate || !context.checkoutDate) return

    setSelectedRoomId(null)
    const request = dispatch(fetchRoomsAvailability({
      StartDate: context.effectiveDate,
      EndDate: context.checkoutDate,
      RoomTypeId: selectedRoomTypeId,
    }))
    return () => request.abort()
  }, [context.checkoutDate, context.effectiveDate, dispatch, open, selectedRoomTypeId])

  const resetState = () => {
    setStep(1)
    setChangeType('OperationalMove')
    setSelectedRoomTypeId('')
    setSelectedRoomId(null)
    setReason('')
    setDetails(null)
    setFolio(null)
    setContextError(null)
    setEvaluation(null)
    setEvaluationError(null)
    setSubmitError(null)
    setShowSuccess(false)
    setLoadingContext(false)
    setEvaluating(false)
    setSubmitting(false)
    evaluatingRef.current = false
    submittingRef.current = false
  }

  const closeModal = () => {
    onClose()
    resetState()
  }

  const closeSuccess = () => {
    setShowSuccess(false)
    onSuccess?.()
    closeModal()
  }

  const handleEvaluate = async () => {
    if (!reservation || evaluatingRef.current) return
    if (!context.reservationRoomId) {
      setEvaluationError('No reservation room was found for this reservation.')
      return
    }
    if (!selectedRoomId) {
      setEvaluationError('Select an available room before continuing.')
      return
    }

    evaluatingRef.current = true
    setEvaluating(true)
    setEvaluationError(null)
    setSubmitError(null)

    try {
      const result = await evaluateRoomChange({
        reservationRoomId: context.reservationRoomId,
        newRoomId: selectedRoomId,
        changeType,
        effectiveDate: context.effectiveDate,
        evaluationDateTime: new Date().toISOString(),
        forceManualApprovalOverride: true,
      })
      setEvaluation(result)
      setStep(2)
    } catch (error) {
      setEvaluationError(getErrorMessage(error, 'Failed to evaluate room change.'))
    } finally {
      evaluatingRef.current = false
      setEvaluating(false)
    }
  }

  const handleConfirm = async () => {
    if (!context.reservationRoomId || !selectedRoomId || !evaluation || submittingRef.current) return
    if (!evaluation.isAllowed || (evaluation.unavailableDates?.length ?? 0) > 0) return

    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)

    const refundAmount = Math.max(0, evaluation.suggestedRefundAmount || evaluation.downgradeCreditAmount || 0)
    const chargeAmount = Math.max(0, evaluation.upgradeChargeAmount || 0)

    try {
      await changeReservationRoom(context.reservationRoomId, {
        newRoomId: selectedRoomId,
        changeType,
        reason: reason.trim() || 'Room change from PMS',
        effectiveDate: dateTimeForDate(context.effectiveDate),
        forceManualApprovalOverride: true,
        processRefund: refundAmount > 0,
        manualChargeAmount: chargeAmount > 0 ? chargeAmount : null,
        manualRefundAmount: refundAmount > 0 ? refundAmount : null,
      })
      setShowSuccess(true)
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Failed to change room.'))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (!reservation) return null

  return (
    <Modal open={open} onClose={closeModal} lockScroll>
      <div className="flex max-h-[90vh] w-[94vw] max-w-6xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        {step === 1 ? (
          <MoveRoomStep1
            reservation={reservation}
            context={context}
            roomTypes={roomTypes}
            roomTypesLoading={roomTypesStatus === 'loading'}
            rooms={availableRooms}
            roomsLoading={roomsAvailabilityStatus === 'loading'}
            roomsError={roomsError || null}
            loadingContext={loadingContext}
            contextError={contextError}
            changeType={changeType}
            setChangeType={setChangeType}
            selectedRoomTypeId={selectedRoomTypeId}
            setSelectedRoomTypeId={setSelectedRoomTypeId}
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            evaluating={evaluating}
            evaluationError={evaluationError}
            onCancel={closeModal}
            onContinue={handleEvaluate}
          />
        ) : (
          <MoveRoomStep2
            reservation={reservation}
            context={context}
            evaluation={evaluation}
            selectedRoom={selectedRoom}
            reason={reason}
            setReason={setReason}
            submitError={submitError}
            submitting={submitting}
            onBack={() => setStep(1)}
            onCancel={closeModal}
            onConfirm={handleConfirm}
          />
        )}
      </div>

      <SuccessAlertModal
        open={showSuccess}
        onClose={closeSuccess}
        icon={<CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />}
        message="Room change confirmed successfully!"
      />
    </Modal>
  )
}
