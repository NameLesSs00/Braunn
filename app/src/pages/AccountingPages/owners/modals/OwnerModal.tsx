import { useState, useEffect } from 'react'
import { Modal } from '../../../../shared/ui/Modal'
import { useAppDispatch } from '../../../../store/hooks'
import { addOwner, editOwner } from '../../../../features/accounting/ownersSlice'
import type { Owner, CreateOwnerRequest } from '../../../../models/Accounting/owner'
import { appAlert } from '../../../../shared/ui/AppAlert'
import { Loader2 } from 'lucide-react'

type OwnerModalProps = {
  open: boolean
  onClose: () => void
  owner?: Owner
}

export function OwnerModal({ open, onClose, owner }: OwnerModalProps) {
  const dispatch = useAppDispatch()
  
  const [formData, setFormData] = useState<CreateOwnerRequest>({
    fullName: '',
    email: '',
    phone: '',
    identificationNumber: '',
    address: '',
    iban: '',
    isActive: true,
  })
  
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (owner && open) {
      setFormData({
        fullName: owner.fullName,
        email: owner.email,
        phone: owner.phone,
        identificationNumber: owner.identificationNumber,
        address: owner.address || '',
        iban: owner.iban || '',
        isActive: owner.isActive,
      })
    } else if (open) {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        identificationNumber: '',
        address: '',
        iban: '',
        isActive: true,
      })
    }
  }, [owner, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (owner) {
        await dispatch(editOwner({ id: owner.id, payload: formData })).unwrap()
        appAlert.fire({ icon: 'success', title: 'Success', text: 'Owner updated successfully.' })
      } else {
        await dispatch(addOwner(formData)).unwrap()
        appAlert.fire({ icon: 'success', title: 'Success', text: 'Owner created successfully.' })
      }
      onClose()
    } catch (err: any) {
      appAlert.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to save owner.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-[500px] overflow-hidden rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between bg-[#0B4EA2] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {owner ? 'Edit Owner' : 'Add New Owner'}
          </h2>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white font-bold text-2xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name *</label>
            <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone *</label>
            <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Identification Number *</label>
            <input required type="text" value={formData.identificationNumber} onChange={(e) => setFormData({...formData, identificationNumber: e.target.value})} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
            <input type="text" value={formData.address ?? ''} onChange={(e) => setFormData({...formData, address: e.target.value})} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">IBAN</label>
            <input type="text" value={formData.iban ?? ''} onChange={(e) => setFormData({...formData, iban: e.target.value})} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-[#0B4EA2] focus:ring-[#0B4EA2]" />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active Owner</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex items-center rounded-lg bg-[#0B4EA2] px-4 py-2 text-sm font-medium text-white hover:bg-[#0B4EA2]/90 disabled:opacity-50 transition-colors">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {owner ? 'Save Changes' : 'Create Owner'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
