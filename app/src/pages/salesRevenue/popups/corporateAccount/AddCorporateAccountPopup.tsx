import { useState } from 'react'
import { X, Building2, User, Mail, Phone, Calendar as CalendarIcon, DollarSign, ChevronDown, Save } from 'lucide-react'
import { Modal } from '../../../../shared/ui/Modal'
import { useAppDispatch } from '../../../../store/hooks'
import { addCorporateAccount } from '../../../../features/corporateAccounts/corporateAccountsSlice'
import type { CreateCorporateAccountRequest } from '../../../../models/CorporateAccount'
import Swal from 'sweetalert2'

interface AddCorporateAccountPopupProps {
  onClose: () => void;
}

export function AddCorporateAccountPopup({ onClose }: AddCorporateAccountPopupProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<CreateCorporateAccountRequest>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: 0,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'number') {
        finalValue = value ? Number(value) : 0;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleRadioChange = (val: boolean) => {
    setFormData(prev => ({ ...prev, isActive: val }));
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.contactPerson || !formData.email) {
        Swal.fire('Error', 'Please fill in all required fields.', 'error');
        return;
    }

    setIsSubmitting(true);
    try {
        await dispatch(addCorporateAccount(formData)).unwrap();
        Swal.fire('Success', 'Corporate account created successfully!', 'success');
        onClose();
    } catch (err: any) {
        Swal.fire('Error', err || 'Failed to create corporate account.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="bg-white rounded-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-[#004bb4] p-6 text-white flex items-start justify-between rounded-t-xl shrink-0">
          <div>
            <h2 className="text-xl font-bold">Add Corporate Account</h2>
            <p className="text-blue-100 mt-1 text-sm">Create a new corporate client account</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
              <Building2 className="w-5 h-5 text-[#004bb4]" />
              <h3>Company Information</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name *</label>
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g., Tech Corp International" 
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Person *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="John Smith" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                <div className="relative">
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@company.com" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 555-0123" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Business St, City, Country" 
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Financial & Account Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
              <DollarSign className="w-5 h-5 text-[#004bb4]" />
              <h3>Financial & Account Status</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Credit Limit</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                  <input 
                    type="number" 
                    name="creditLimit"
                    value={formData.creditLimit}
                    onChange={handleInputChange}
                    placeholder="50000" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col text-slate-400 cursor-pointer">
                    <ChevronDown className="w-3 h-3 rotate-180 mb-[-2px]" />
                    <ChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Status</label>
                <div className="flex items-center gap-6 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="isActive" 
                      checked={formData.isActive === true}
                      onChange={() => handleRadioChange(true)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="isActive" 
                      checked={formData.isActive === false}
                      onChange={() => handleRadioChange(false)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#004bb4] text-white rounded-xl hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </div>

      </div>
    </Modal>
  )
}
