import { useState } from 'react'
import { Modal } from '../../../shared/ui/Modal'
import { X, Save } from 'lucide-react'
import { useAppDispatch } from '../../../store/hooks'
import { updateCorporateCancellationPolicy } from '../../../features/policies/corporateCancellationPoliciesSlice'
import type { CorporateCancellationPolicy, UpdateCorporateCancellationPolicyDto } from '../../../models/CorporateCancellationPolicy'
import { appAlert } from '../../../shared/ui/AppAlert'

interface Props {
  policy: CorporateCancellationPolicy
  onClose: () => void
}

export function EditCorporateCancellationPolicyPopup({ policy, onClose }: Props) {
  const dispatch = useAppDispatch()
  const [form, setForm] = useState<UpdateCorporateCancellationPolicyDto>({
    name: policy.name,
    code: policy.code,
    isActive: policy.isActive,
    appliesToContractType: policy.appliesToContractType,
    effectiveFrom: policy.effectiveFrom,
    effectiveTo: policy.effectiveTo,
    liquidatedDamagesPenaltyPercentage: policy.liquidatedDamagesPenaltyPercentage,
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!form.name || !form.code || !form.effectiveFrom) {
      appAlert.fire('Validation Error', 'Please fill in all required fields (*).', 'error')
      return
    }

    setSubmitting(true)
    try {
      await dispatch(updateCorporateCancellationPolicy({ id: policy.id, data: form })).unwrap()
      appAlert.fire({ icon: 'success', title: 'Policy Updated', timer: 1500, showConfirmButton: false })
      onClose()
    } catch (err) {
      appAlert.fire('Error', err instanceof Error ? err.message : 'Failed to update policy', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#004bb4] px-7 py-6 text-white flex items-start justify-between rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Edit Corporate Cancellation Policy</h2>
            <p className="text-blue-200 mt-1 text-sm">Update policy: <span className="font-bold text-white">{policy.code}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 custom-scrollbar bg-slate-50/30">
          <form id="edit-policy-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CCP01"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4] uppercase font-medium tracking-wide bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Standard Commitment Policy"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4] bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Contract Type</label>
                <select
                  value={form.appliesToContractType}
                  onChange={(e) => setForm({ ...form, appliesToContractType: e.target.value as 'Allotment' | 'Commitment' })}
                  className="w-full h-10 px-3 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4] cursor-pointer"
                >
                  <option value="Allotment">Allotment</option>
                  <option value="Commitment">Commitment</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Penalty Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.liquidatedDamagesPenaltyPercentage}
                  onChange={(e) => setForm({ ...form, liquidatedDamagesPenaltyPercentage: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4] bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Effective From <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  value={form.effectiveFrom ? form.effectiveFrom.slice(0, 16) : ''}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4] bg-white"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Effective To</label>
                <input
                  type="datetime-local"
                  value={form.effectiveTo ? form.effectiveTo.slice(0, 16) : ''}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4] bg-white"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-[#004bb4]' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Policy is active</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-7 py-5 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-[#004bb4] hover:bg-[#003d99] rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
