import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Plus, Edit2, Power, Percent, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchFinancialDiscounts,
  createFinancialDiscount,
  updateFinancialDiscount,
  toggleFinancialDiscount,
} from '../../features/adminFinancialSettings/financialSettingsSlice'
import type { FinancialDiscount } from '../../models/FinancialSettings'
import Swal from 'sweetalert2'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

type FormState = { name: string; value: string }
const emptyForm: FormState = { name: '', value: '' }

function validate(form: FormState): string | null {
  if (!form.name.trim()) return 'Name is required.'
  const v = Number(form.value)
  if (isNaN(v) || v < 1 || v > 100) return 'Value must be a percentage between 1 and 100.'
  return null
}

export function DiscountsPage() {
  const dispatch = useAppDispatch()
  const discounts = useAppSelector((s) => s.financialSettings.discounts)
  const discountStatus = useAppSelector((s) => s.financialSettings.discountStatus)

  const [panelMode, setPanelMode] = useState<'closed' | 'add' | 'edit'>('closed')
  const [editTarget, setEditTarget] = useState<FinancialDiscount | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (discountStatus === 'idle') {
      dispatch(fetchFinancialDiscounts())
    }
  }, [dispatch, discountStatus])

  const openAdd = () => {
    setForm(emptyForm)
    setFormError(null)
    setEditTarget(null)
    setPanelMode('add')
  }

  const openEdit = (discount: FinancialDiscount) => {
    setForm({ name: discount.name, value: String(discount.value) })
    setFormError(null)
    setEditTarget(discount)
    setPanelMode('edit')
  }

  const closePanel = () => {
    setPanelMode('closed')
    setEditTarget(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const handleSubmit = async () => {
    const err = validate(form)
    if (err) { setFormError(err); return }
    setSubmitting(true)
    setFormError(null)
    try {
      if (panelMode === 'add') {
        await dispatch(createFinancialDiscount({ name: form.name.trim(), value: Number(form.value), type: 'Percentage' })).unwrap()
        await dispatch(fetchFinancialDiscounts())
      } else if (panelMode === 'edit' && editTarget) {
        await dispatch(updateFinancialDiscount({ id: editTarget.id, data: { name: form.name.trim(), value: Number(form.value), type: 'Percentage' } })).unwrap()
      }
      closePanel()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (discount: FinancialDiscount) => {
    const action = discount.isActive ? 'deactivate' : 'activate'
    const result = await Swal.fire({
      title: `${discount.isActive ? 'Deactivate' : 'Activate'} discount?`,
      text: `"${discount.name}" will be ${action}d.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: discount.isActive ? '#dc2626' : '#0B4EA2',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Yes, ${action}`,
      scrollbarPadding: false,
    })
    if (!result.isConfirmed) return
    setTogglingId(discount.id)
    try {
      await dispatch(toggleFinancialDiscount(discount.id)).unwrap()
    } finally {
      setTogglingId(null)
    }
  }

  const isLoading = discountStatus === 'loading'

  return (
    <motion.div className="space-y-0 pb-12" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div variants={itemVariants}>
        <TabNav />
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between px-6 pt-6 pb-2">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-800 tracking-tight">Discount Policies</h1>
          <p className="text-slate-500 mt-1 text-[15px]">Manage percentage-based discounts applied during reservations</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-10 px-5 bg-[#0B4EA2] text-white rounded-lg font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />
          Add Discount
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="px-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <Percent className="w-5 h-5 text-[#0B4EA2]" />
            <span className="text-[15px] font-bold text-slate-800">All Discounts</span>
            <span className="ml-auto text-xs text-slate-400 font-medium">{discounts.length} total</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-48" />
                  <div className="h-4 bg-slate-100 rounded w-16 ml-auto" />
                  <div className="h-6 bg-slate-100 rounded-full w-20" />
                  <div className="h-8 bg-slate-100 rounded-lg w-20" />
                </div>
              ))}
            </div>
          ) : discounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <Percent className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold text-[15px]">No discounts yet</p>
              <p className="text-slate-400 text-sm max-w-xs">Click "Add Discount" to create your first percentage-based discount policy.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Value</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                    <td className="px-5 py-4 font-semibold text-slate-800 text-[15px]">{discount.name}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-[15px] font-bold text-[#0B4EA2]">
                        {discount.value}
                        <Percent className="w-3.5 h-3.5" />
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {discount.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(discount)}
                          title="Edit"
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#0B4EA2] hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleToggle(discount)}
                          disabled={togglingId === discount.id}
                          title={discount.isActive ? 'Deactivate' : 'Activate'}
                          className={[
                            'h-8 w-8 flex items-center justify-center rounded-lg transition-colors',
                            discount.isActive
                              ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50',
                            togglingId === discount.id ? 'opacity-50 cursor-not-allowed' : '',
                          ].join(' ')}
                        >
                          {togglingId === discount.id ? (
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <Power className="w-4 h-4" strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Centered Popup Modal */}
      {panelMode !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#0B4EA2]">
              <h2 className="text-xl font-bold text-white">
                {panelMode === 'add' ? 'Add Discount' : 'Edit Discount'}
              </h2>
              <button
                onClick={closePanel}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-2">
                  Discount Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Early Bird Discount"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#0B4EA2] transition-colors text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-2">
                  Percentage Value <span className="text-red-500">*</span>
                  <span className="ml-2 text-[11px] font-normal text-slate-400">(1 – 100)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder="e.g. 10"
                    className="w-full border border-slate-200 rounded-lg pl-4 pr-12 py-2.5 outline-none focus:border-[#0B4EA2] transition-colors text-slate-800 font-medium"
                  />
                  <span className="absolute right-4 text-slate-400 font-bold pointer-events-none">%</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button
                onClick={closePanel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#0B4EA2] text-white font-semibold hover:bg-blue-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : panelMode === 'add' ? 'Add Discount' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
