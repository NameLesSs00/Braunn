import { useState } from 'react'
import { X, Calendar as CalendarIcon, Save, Hash } from 'lucide-react'
import { Modal } from '../../../../shared/ui/Modal'
import { useAppDispatch } from '../../../../store/hooks'
import { editCorporateAccount } from '../../../../features/corporateAccounts/corporateAccountsSlice'
import type { CorporateAccount, UpdateCorporateAccountRequest } from '../../../../models/CorporateAccount'
import { appAlert } from '../../../../shared/ui/AppAlert'

interface RenewContractPopupProps {
  account: CorporateAccount;
  onClose: () => void;
}

export function RenewContractPopup({ account, onClose }: RenewContractPopupProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<UpdateCorporateAccountRequest>({
    ...account,
    departureDate: account.departureDate?.split('T')[0] || '',
    depositRequired: account.depositRequired || 0,
    discountAmount: account.discountAmount || 0,
    blockedRooms: account.blockedRooms || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === 'number') {
        finalValue = value ? Number(value) : 0;
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async () => {
    if (!formData.departureDate) {
        appAlert.fire('Error', 'Please fill in the departure date.', 'error');
        return;
    }

    setIsSubmitting(true);
    try {
        await dispatch(editCorporateAccount({ id: account.id, payload: formData })).unwrap();
        appAlert.fire('Success', 'Contract renewed successfully!', 'success');
        onClose();
    } catch (err: any) {
        appAlert.fire('Error', err || 'Failed to renew contract.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} lockScroll>
      <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-[#004bb4] p-6 text-white flex items-start justify-between rounded-t-xl shrink-0">
          <div>
            <h2 className="text-xl font-bold">Renew Contract</h2>
            <p className="text-blue-100 mt-1 text-sm">Update renewal details for {account.companyName}</p>
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
          
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Departure Date *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input 
                    type="date" 
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deposit Required</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                  <input 
                    type="number" 
                    name="depositRequired"
                    value={formData.depositRequired}
                    onChange={handleInputChange}
                    placeholder="0" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                  <input 
                    type="number" 
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    placeholder="0" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blocked Rooms</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium"><Hash className="w-4 h-4" /></span>
                  <input 
                    type="number" 
                    name="blockedRooms"
                    value={formData.blockedRooms}
                    onChange={handleInputChange}
                    placeholder="0" 
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow placeholder:text-slate-400"
                  />
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
            {isSubmitting ? 'Renewing...' : 'Renew Contract'}
          </button>
        </div>

      </div>
    </Modal>
  )
}
