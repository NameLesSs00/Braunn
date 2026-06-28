import { useState } from 'react'
import { X, Calendar, DollarSign, Users, Trash2, Plus, Tag } from 'lucide-react'
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

  const [form, setForm] = useState<{
    roomTypeId: string
    dateFrom: string
    dateTo: string
    ratePlanCode: string
    currency: string
    basePrice: number
    numberOfGuests: number
    extraAdultPrice: number
    childrenPrice: number
    taxPercentage: number
    childPolicies: Array<{ id: number, ageFrom: number, ageTo: number, amount: number }>
  }>({
    roomTypeId: roomTypeId || '',
    dateFrom: startDate || new Date().toISOString().split('T')[0],
    dateTo: endDate || new Date().toISOString().split('T')[0],
    ratePlanCode: '',
    currency: 'USD',
    basePrice: 0,
    numberOfGuests: 1,
    extraAdultPrice: 0,
    childrenPrice: 0,
    taxPercentage: 0,
    childPolicies: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const addChildPolicy = () => {
    const newId = form.childPolicies.length > 0 ? Math.max(...form.childPolicies.map((p) => p.id)) + 1 : 1
    setForm((prev) => ({ ...prev, childPolicies: [...prev.childPolicies, { id: newId, ageFrom: 0, ageTo: 0, amount: 0 }] }))
  }

  const updateChildPolicy = (id: number, patch: Partial<{ ageFrom: number, ageTo: number, amount: number }>) => {
    setForm((prev) => ({
      ...prev,
      childPolicies: prev.childPolicies.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  }

  const removeChildPolicy = (id: number) => {
    setForm((prev) => ({
      ...prev,
      childPolicies: prev.childPolicies.filter((p) => p.id !== id),
    }))
  }

  const handleSubmit = async () => {
    if (!form.roomTypeId) { setError('Please select a Room Type.'); return }
    if (!form.dateFrom || !form.dateTo) { setError('Please enter a date range.'); return }
    if (form.basePrice <= 0) { setError('Base Price must be greater than 0.'); return }
    setError(null)
    setIsLoading(true)
    try {
      const payload = {
        roomTypeId: form.roomTypeId,
        dateFrom: form.dateFrom,
        dateTo: form.dateTo,
        ratePlanCode: form.ratePlanCode,
        currency: form.currency,
        basePrice: form.basePrice,
        numberOfGuests: form.numberOfGuests,
        extraAdultPrice: form.extraAdultPrice,
        childrenPrice: form.childrenPrice,
        taxPercentage: form.taxPercentage,
        childPolicies: form.childPolicies.map(p => ({
          ageFrom: p.ageFrom,
          ageTo: p.ageTo,
          amount: p.amount
        }))
      }
      await dispatch(saveLocalARIRates(payload)).unwrap()
      // Refresh rates table
      if (form.roomTypeId && form.ratePlanCode) {
        await dispatch(fetchLocalARIRates({
          roomTypeId: form.roomTypeId,
          ratePlanCode: form.ratePlanCode,
          startDate: form.dateFrom,
          endDate: form.dateTo,
          roomCount: 1,
          adults: form.numberOfGuests,
          children: 0,
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
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-3 flex items-start justify-between">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="text-red-500 hover:text-red-700 ml-3"
              >
                <X className="w-4 h-4" />
              </button>
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

            {/* Base Price */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Base Price <span className="text-red-500">*</span></label>
              <div className="relative flex items-center">
                <DollarSign className="w-[17px] h-[17px] text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  value={form.basePrice}
                  onChange={(e) => set('basePrice', Number(e.target.value))}
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

            {/* Extra Adult Price */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Extra Adult Price</label>
              <div className="relative flex items-center">
                <DollarSign className="w-[17px] h-[17px] text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  value={form.extraAdultPrice}
                  onChange={(e) => set('extraAdultPrice', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Children Price */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Base Children Price</label>
              <div className="relative flex items-center">
                <DollarSign className="w-[17px] h-[17px] text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  value={form.childrenPrice}
                  onChange={(e) => set('childrenPrice', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Tax Percentage */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Tax Percentage (%)</label>
              <div className="relative flex items-center">
                <span className="text-slate-400 absolute left-3.5 pointer-events-none font-bold text-[14px]">%</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.taxPercentage}
                  onChange={(e) => set('taxPercentage', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Child Policies Section */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">Child Policies</h3>
                <p className="text-[12px] text-slate-500">Configure special pricing based on child age. Set amount to 0 for free.</p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0B4EA2] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#093d81] transition-all"
                onClick={addChildPolicy}
              >
                <Plus className="w-3.5 h-3.5" /> Add Policy
              </button>
            </div>

            {form.childPolicies.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age From</th>
                      <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age To</th>
                      <th className="px-4 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2.5 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {form.childPolicies.map((policy) => (
                      <tr key={policy.id}>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={policy.ageFrom}
                            onChange={(e) => updateChildPolicy(policy.id, { ageFrom: Number(e.target.value) })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#004bb4] text-sm text-center"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={policy.ageFrom}
                            value={policy.ageTo}
                            onChange={(e) => updateChildPolicy(policy.id, { ageTo: Number(e.target.value) })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#004bb4] text-sm text-center"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="relative flex items-center">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                            <input
                              type="number"
                              min={0}
                              value={policy.amount}
                              onChange={(e) => updateChildPolicy(policy.id, { amount: Number(e.target.value) })}
                              className="w-full border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 outline-none focus:border-[#004bb4] text-sm"
                            />
                            {policy.amount === 0 && (
                              <span className="absolute right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 pointer-events-none">Free</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            className="grid h-7 w-7 place-items-center text-rose-500 hover:bg-rose-50 rounded transition-colors ml-auto"
                            onClick={() => removeChildPolicy(policy.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-5 text-center">
                <p className="text-sm font-medium text-slate-500">No child policies added.</p>
              </div>
            )}
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
