import { useState } from 'react'
import { X, Calendar, DollarSign, Users, Tag } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { saveLocalARIRates, fetchLocalARIRates } from '../../../../features/localAri/localAriSlice'

type Props = {
  onClose: () => void
  startDate: string
  endDate: string
  roomTypeId: string
}


const CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP']

export function AddLocalPricingPopup({ onClose, startDate, endDate, roomTypeId }: Props) {
  const dispatch = useAppDispatch()
  const roomTypes = useAppSelector((state) => state.roomTypes.items)
  const ratePlans = useAppSelector((state) => state.ratePlans.items)

  const [form, setForm] = useState({
    roomTypeId: roomTypeId || '',
    dateFrom: startDate || new Date().toISOString().split('T')[0],
    dateTo: endDate || new Date().toISOString().split('T')[0],
    amount: 0,
    ratePlanCode: '',
    currency: 'USD',
    numberOfGuests: 1,
    ageQualifyingCode: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.roomTypeId) { setError('Please select a Room Type.'); return }
    if (!form.dateFrom || !form.dateTo) { setError('Please enter a date range.'); return }
    if (form.amount <= 0) { setError('Amount must be greater than 0.'); return }
    setError(null)
    setIsLoading(true)
    try {
      await dispatch(saveLocalARIRates({
        ...form,
        dateFrom: new Date(form.dateFrom).toISOString(),
        dateTo: new Date(form.dateTo).toISOString(),
      })).unwrap()
      // Refresh rates table
      if (form.roomTypeId && form.ratePlanCode) {
        await dispatch(fetchLocalARIRates({
          roomTypeId: form.roomTypeId,
          ratePlanCode: form.ratePlanCode,
          startDate: form.dateFrom,
          endDate: form.dateTo,
          roomCount: 1,
          adults: form.ageQualifyingCode === '10' ? form.numberOfGuests : 1,
          children: form.ageQualifyingCode === '8' ? form.numberOfGuests : 0,
          extraBeds: 0,
        }))
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pricing. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#004bb4]">
          <h2 className="text-xl font-bold text-white tracking-wide">Add Local Pricing</h2>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Room Type */}
          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-2">Room Type <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                value={form.roomTypeId}
                onChange={(e) => set('roomTypeId', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white pr-10"
              >
                <option value="">— Select Room Type —</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {/* Date From */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Date From <span className="text-red-500">*</span></label>
              <div className="relative flex items-center">
                <Calendar className="w-[17px] h-[17px] text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="date"
                  value={form.dateFrom}
                  onChange={(e) => set('dateFrom', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Date To <span className="text-red-500">*</span></label>
              <div className="relative flex items-center">
                <Calendar className="w-[17px] h-[17px] text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="date"
                  value={form.dateTo}
                  onChange={(e) => set('dateTo', e.target.value)}
                  min={form.dateFrom}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Rate Plan Code */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Rate Plan Code <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={form.ratePlanCode}
                  onChange={(e) => set('ratePlanCode', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white pr-10"
                >
                  <option value="">— Select Code —</option>
                  {ratePlans.filter(rp => rp.isActive).map((rp) => (
                    <option key={rp.id} value={rp.code}>{rp.code}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Amount <span className="text-red-500">*</span></label>
              <div className="relative flex items-center">
                <DollarSign className="w-[17px] h-[17px] text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) => set('amount', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Currency</label>
              <div className="relative">
                <select
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white pr-10"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Number of Guests */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Number of Guests</label>
              <div className="relative flex items-center">
                <Users className="w-[17px] h-[17px] text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  value={form.numberOfGuests}
                  onChange={(e) => set('numberOfGuests', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Age Qualifying Code */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Age Qualifying Code</label>
              <input
                type="text"
                value={form.ageQualifyingCode}
                onChange={(e) => set('ageQualifyingCode', e.target.value)}
                placeholder="Age Qualifying Code"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#004bb4] hover:bg-blue-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[130px] justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : 'Add Pricing'}
          </button>
        </div>
      </div>
    </div>
  )
}
