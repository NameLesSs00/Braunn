import { useState } from 'react'
import { X, Building2, User, Mail, Phone, MapPin, ToggleLeft, Save } from 'lucide-react'
import { Modal } from '../../../../shared/ui/Modal'
import { useAppDispatch } from '../../../../store/hooks'
import { editCorporateAccount } from '../../../../features/corporateAccounts/corporateAccountsSlice'
import type { CorporateAccount, UpdateCorporateAccountRequest } from '../../../../models/CorporateAccount'
import { appAlert } from '../../../../shared/ui/AppAlert'

interface EditCorporateAccountPopupProps {
  account: CorporateAccount;
  onClose: () => void;
}

export function EditCorporateAccountPopup({ account, onClose }: EditCorporateAccountPopupProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<UpdateCorporateAccountRequest>({
    companyName: account.companyName || '',
    contactPerson: account.contactPerson || '',
    email: account.email || '',
    phone: account.phone || '',
    address: account.address || '',
    isActive: account.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (val: boolean) => {
    setFormData(prev => ({ ...prev, isActive: val }));
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.contactPerson || !formData.email) {
      appAlert.fire('Validation Error', 'Company Name, Contact Person, and Email are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(editCorporateAccount({ id: account.id, payload: formData })).unwrap();
      appAlert.fire({ icon: 'success', title: 'Account Updated', text: 'Corporate account updated successfully!', timer: 2000, showConfirmButton: false });
      onClose();
    } catch (err: any) {
      appAlert.fire('Error', err || 'Failed to update corporate account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-[#004bb4] px-7 py-6 text-white flex items-start justify-between rounded-t-2xl shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Edit Corporate Account</h2>
            <p className="text-blue-200 mt-1 text-sm">
              Updating: <span className="font-semibold text-white">{account.companyName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors mt-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-7 overflow-y-auto space-y-6 flex-1">

          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm uppercase tracking-wide mb-3">
              <Building2 className="w-4 h-4 text-[#004bb4]" />
              <span>Company Information</span>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g., Tech Corp International"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Person */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="John Smith"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 555-0123"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Business St, City, Country"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Account Status */}
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm uppercase tracking-wide mb-4">
              <ToggleLeft className="w-4 h-4 text-[#004bb4]" />
              <span>Account Status</span>
            </div>
            <div className="flex items-center gap-4">
              <label className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all flex-1 ${formData.isActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input
                  type="radio"
                  name="isActive"
                  checked={formData.isActive === true}
                  onChange={() => handleRadioChange(true)}
                  className="w-4 h-4 text-emerald-500 border-slate-300 focus:ring-emerald-400"
                />
                <span className={`text-sm font-semibold ${formData.isActive ? 'text-emerald-700' : 'text-slate-600'}`}>Active</span>
              </label>
              <label className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all flex-1 ${!formData.isActive ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input
                  type="radio"
                  name="isActive"
                  checked={formData.isActive === false}
                  onChange={() => handleRadioChange(false)}
                  className="w-4 h-4 text-slate-500 border-slate-300 focus:ring-slate-400"
                />
                <span className={`text-sm font-semibold ${!formData.isActive ? 'text-slate-700' : 'text-slate-500'}`}>Inactive</span>
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#004bb4] text-white rounded-xl hover:bg-blue-800 active:scale-[0.98] transition-all font-semibold text-sm shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </Modal>
  )
}
