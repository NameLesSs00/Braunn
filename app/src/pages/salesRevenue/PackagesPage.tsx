import { useState, useEffect } from 'react'
import { Plus, Check, Tag, ToggleLeft, ToggleRight, AlertCircle, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchRatePlans,
  createRatePlan,
  activateRatePlan,
  deactivateRatePlan,
} from '../../features/ratePlans/ratePlansSlice'
import type { CreateRatePlanPayload } from '../../models/RatePlan'
import { appAlert } from '../../shared/ui/AppAlert'

const emptyRatePlanForm: CreateRatePlanPayload = {
  code: '',
  name: '',
  description: '',
  isActive: true,
}

export function RatesSection() {
  const dispatch = useAppDispatch()
  const { items: ratePlans, status } = useAppSelector(s => s.ratePlans)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<CreateRatePlanPayload>(emptyRatePlanForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchRatePlans())
  }, [dispatch, status])

  const openAdd = () => {
    setForm(emptyRatePlanForm)
    setFormError(null)
    setShowAddModal(true)
  }

  const handleSubmit = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setFormError('Code and Name are required.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await dispatch(createRatePlan(form)).unwrap()
      setShowAddModal(false)
      appAlert.fire({ icon: 'success', title: 'Rate Plan created!', timer: 1500, showConfirmButton: false })
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to create rate plan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    setTogglingId(id)
    try {
      if (isActive) {
        await dispatch(deactivateRatePlan(id)).unwrap()
      } else {
        await dispatch(activateRatePlan(id)).unwrap()
      }
      dispatch(fetchRatePlans())
    } catch (e) {
      console.error(e)
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="w-full">
      {/* Table header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-[#004bb4]" />
          <span className="text-[14px] font-bold text-slate-800">All Rate Plans</span>
          <span className="text-xs text-slate-400 font-medium">{ratePlans.length} total</span>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 bg-[#004bb4] text-white rounded-lg font-semibold text-sm hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Add Rate Plan
        </button>
      </div>

      {status === 'loading' ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400 text-sm">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading rate plans...
        </div>
      ) : ratePlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <Tag className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-slate-700 font-semibold text-[15px]">No rate plans yet</p>
          <p className="text-slate-400 text-sm">Click "Add Rate Plan" to create your first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ratePlans.map(rp => (
                <tr key={rp.id} className="hover:bg-slate-50/60 bg-white transition-colors">
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#004bb4]/10 text-[#004bb4] text-[13px] font-bold tracking-wide">
                      {rp.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800 text-[14px]">{rp.name}</td>
                  <td className="px-5 py-4 text-slate-500 text-[14px] max-w-xs truncate">{rp.description || '—'}</td>
                  <td className="px-5 py-4 text-center">
                    {rp.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                        <AlertCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggle(rp.id, rp.isActive)}
                      disabled={togglingId === rp.id}
                      title={rp.isActive ? 'Deactivate' : 'Activate'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                        rp.isActive
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {togglingId === rp.id ? (
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : rp.isActive ? (
                        <ToggleLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ToggleRight className="w-3.5 h-3.5" />
                      )}
                      {rp.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 bg-[#004bb4]">
              <h2 className="text-xl font-bold text-white">Add Rate Plan</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER24"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#004bb4] transition-colors uppercase font-medium tracking-wide"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Summer Season 2024"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#004bb4] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-600 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#004bb4] transition-colors resize-none"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-[#004bb4]' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Active on creation</span>
              </label>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#004bb4] hover:bg-blue-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 min-w-[130px] justify-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : 'Create Rate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
