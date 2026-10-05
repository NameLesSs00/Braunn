import { useState, useEffect } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { Modal } from '../../../../../../../shared/ui/Modal'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../../../../../store/store'
import {
  createRestaurantUnit,
  updateRestaurantUnit,
  fetchRestaurantUnits,
} from '../../../../../../../features/restaurant/restaurantUnitsSlice'
import type { RestaurantUnit } from '../../../../../../../models/RestaurantUnit'

type Props = {
  open: boolean
  onClose: () => void
  mode?: 'add' | 'edit'
  initialData?: RestaurantUnit | null
}

export function AddEditUnitModal({ open, onClose, mode = 'add', initialData }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const [form, setForm] = useState({
    name: '',
    symbol: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name ?? '',
        symbol: initialData?.symbol ?? '',
      })
      setError(null)
    }
  }, [open, initialData])

  const handleClose = () => {
    setForm({ name: '', symbol: '' })
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.symbol.trim()) return
    setLoading(true)
    setError(null)
    try {
      if (mode === 'edit' && initialData) {
        await dispatch(
          updateRestaurantUnit({
            id: initialData.id,
            data: { name: form.name, symbol: form.symbol },
          })
        ).unwrap()
      } else {
        await dispatch(
          createRestaurantUnit({ name: form.name, symbol: form.symbol })
        ).unwrap()
      }
      await dispatch(fetchRestaurantUnits())
      handleClose()
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to save unit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} lockScroll>
      <div className="w-[460px] max-w-[95vw] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <h2 className="text-[18px] font-semibold text-white">
            {mode === 'edit' ? 'Edit Unit' : 'Add Unit'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 bg-white px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Liter, Kilogram"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Symbol */}
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Symbol <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. L, KG"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2.5 text-[14px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !form.name.trim() || !form.symbol.trim()}
            className="flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-[#0B4EA2] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#093c80] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
