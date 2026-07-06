import { X, Home, Sparkles, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { Modal } from '../../../shared/ui/Modal'
import { SuccessAlertModal } from '../../../shared/ui/SuccessAlertModal'
import type { PmsReservation } from '../../../models/PmsReservation'
import { MoveRoomStep1 } from './MoveRoomStep1'
import { MoveRoomStep2 } from './MoveRoomStep2'

type Props = {
  open: boolean
  onClose: () => void
  reservation: PmsReservation | null
}

function formatDate(isoString?: string) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return isoString
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

export function MoveRoomModal({ open, onClose, reservation }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [movementReason, setMovementReason] = useState('')
  const [moveConfig, setMoveConfig] = useState<'remaining' | 'specific'>('remaining')
  const [specificDateFrom, setSpecificDateFrom] = useState('')
  const [specificDateTo, setSpecificDateTo] = useState('')
  
  const [filterFloor, setFilterFloor] = useState('')
  const [filterRoomType, setFilterRoomType] = useState('')
  const [filterRoomView, setFilterRoomView] = useState('')

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(101)
  const [notes, setNotes] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const onCloseSafe = () => {
    onClose()
    setStep(1)
    setMovementReason('')
    setMoveConfig('remaining')
    setSpecificDateFrom('')
    setSpecificDateTo('')
    setFilterFloor('')
    setFilterRoomType('')
    setFilterRoomView('')
    setSelectedRoomId(101)
    setNotes('')
    setShowSuccess(false)
  }

  const handleContinue = () => {
    if (movementReason && selectedRoomId) {
      setStep(2)
    }
  }

  if (!reservation) return null

  return (
    <Modal open={open} onClose={onCloseSafe} lockScroll>
      <div className="flex max-h-[90vh] w-[94vw] max-w-4xl flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        {step === 1 && (
          <MoveRoomStep1
            reservation={reservation}
            movementReason={movementReason}
            setMovementReason={setMovementReason}
            moveConfig={moveConfig}
            setMoveConfig={setMoveConfig}
            specificDateFrom={specificDateFrom}
            setSpecificDateFrom={setSpecificDateFrom}
            specificDateTo={specificDateTo}
            setSpecificDateTo={setSpecificDateTo}
            filterFloor={filterFloor}
            setFilterFloor={setFilterFloor}
            filterRoomType={filterRoomType}
            setFilterRoomType={setFilterRoomType}
            filterRoomView={filterRoomView}
            setFilterRoomView={setFilterRoomView}
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            onCancel={onCloseSafe}
            onContinue={handleContinue}
          />
        )}

        {step === 2 && (
          <MoveRoomStep2
            reservation={reservation}
            movementReason={movementReason}
            moveConfig={moveConfig}
            specificDateFrom={specificDateFrom}
            specificDateTo={specificDateTo}
            filterRoomType={filterRoomType}
            selectedRoomId={selectedRoomId}
            notes={notes}
            setNotes={setNotes}
            onCancel={onCloseSafe}
            onConfirm={() => setShowSuccess(true)}
          />
        )}
      </div>

      <SuccessAlertModal
        open={showSuccess}
        onClose={onCloseSafe}
        icon={<CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />}
        message="Room move confirmed successfully!"
      />
    </Modal>
  )
}
