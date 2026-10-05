import { useState, useEffect } from 'react'
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react'
import { Modal } from '../../../../../../../shared/ui/Modal'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../../../../../store/store'
import { toggleRestaurantUnitStatus } from '../../../../../../../features/restaurant/restaurantUnitsSlice'

type Props = {
  open: boolean
  onClose: () => void
  unitId: number
  unitName: string
  currentStatus: boolean
}

export function ToggleUnitStatusModal({ open, onClose, unitId, unitName, currentStatus }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) setError(null)
  }, [open])

  const isActivating = !currentStatus

  const handleToggle = async () => {
    setLoading(true)
    setError(null)
    try {
      await dispatch(toggleRestaurantUnitStatus({ id: unitId, activate: isActivating })).unwrap()
      onClose()
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to toggle status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} lockScroll>
      <div className="w-[400px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h3 className="mb-2 text-center text-[18px] font-semibold text-slate-900">
            {isActivating ? 'Activate Unit' : 'Deactivate Unit'}
          </h3>

          <p className="text-center text-[14px] text-slate-500">
            Are you sure you want to {isActivating ? 'activate' : 'deactivate'} the unit{' '}
            <span className="font-semibold text-slate-700">"{unitName}"</span>?
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-[14px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleToggle}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isActivating ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
