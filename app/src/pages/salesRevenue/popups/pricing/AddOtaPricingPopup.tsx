import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Send } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { RootState } from '../../../../store/store'
import { fetchARIRatePlans, submitARIUpdateRates } from '../../../../features/localAri/localAriSlice'
import { generateARIRequestId } from '../../../../shared/apis/LocalAri'
import type { ARIRateAmountMessage, ARIBaseByGuestAmt, ARIAdditionalGuestAmt } from '../../../../models/LocalAri'
import Swal from 'sweetalert2'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP']

interface RateItemState {
  id: string
  baseAmts: (ARIBaseByGuestAmt & { id: string })[]
  additionalAmts: (ARIAdditionalGuestAmt & { id: string })[]
}

interface EntryFormState {
  id: string
  roomTypeId: string
  ratePlanCode: string
  startDate: string
  endDate: string
  rates: RateItemState[]
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const createEmptyBaseAmt = (): ARIBaseByGuestAmt & { id: string } => ({
  id: generateId(),
  amountAfterTax: 0,
  currencyCode: 'EUR',
  numberOfGuests: 1,
  ageQualifyingCode: '10'
})

const createEmptyRateItem = (): RateItemState => ({
  id: generateId(),
  baseAmts: [createEmptyBaseAmt()],
  additionalAmts: [{ id: generateId(), amount: 0, ageQualifyingCode: '10' }]
})

const createEmptyEntry = (): EntryFormState => ({
  id: generateId(),
  roomTypeId: '',
  ratePlanCode: '',
  startDate: '',
  endDate: '',
  rates: [createEmptyRateItem()]
})

type Props = {
  onClose: () => void
}

export function AddOtaPricingPopup({ onClose }: Props) {
  const dispatch = useAppDispatch()
  
  const roomTypes = useAppSelector((state: RootState) => state.roomTypes.items)
  const ratePlans = useAppSelector((state: RootState) => state.localAri.ariRatePlans)
  const isSubmitting = useAppSelector((state: RootState) => state.localAri.ariSubmitStatus === 'loading')

  const [entries, setEntries] = useState<EntryFormState[]>([createEmptyEntry()])
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchARIRatePlans())
    
    // Fetch request ID when window opens
    generateARIRequestId().then(res => {
      if (res && res.requestId) {
        setRequestId(res.requestId)
      } else if (typeof res === 'string') {
        // Fallback in case the API just returns a raw string
        setRequestId(res)
      }
    }).catch(err => {
      console.error('Failed to generate request ID on mount:', err)
    })
  }, [dispatch])

  const handleUpdateEntry = (entryId: string, field: keyof EntryFormState, value: any) => {
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, [field]: value } : e))
  }

  const handleAddEntry = () => {
    setEntries(prev => [...prev, createEmptyEntry()])
  }

  const handleRemoveEntry = (entryId: string) => {
    if (entries.length === 1) return
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }

  const handleAddRateItem = (entryId: string) => {
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, rates: [...e.rates, createEmptyRateItem()] } : e))
  }

  const handleRemoveRateItem = (entryId: string, rateId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        if (e.rates.length === 1) return e
        return { ...e, rates: e.rates.filter(r => r.id !== rateId) }
      }
      return e
    }))
  }

  // Base Amount Handlers
  const handleAddBaseAmt = (entryId: string, rateId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          rates: e.rates.map(r => r.id === rateId ? { ...r, baseAmts: [...r.baseAmts, createEmptyBaseAmt()] } : r)
        }
      }
      return e
    }))
  }

  const handleRemoveBaseAmt = (entryId: string, rateId: string, amtId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          rates: e.rates.map(r => r.id === rateId && r.baseAmts.length > 1 ? { ...r, baseAmts: r.baseAmts.filter(a => a.id !== amtId) } : r)
        }
      }
      return e
    }))
  }

  const handleUpdateBaseAmt = (entryId: string, rateId: string, amtId: string, field: keyof ARIBaseByGuestAmt, value: any) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          rates: e.rates.map(r => r.id === rateId ? {
            ...r,
            baseAmts: r.baseAmts.map(a => a.id === amtId ? { ...a, [field]: value } : a)
          } : r)
        }
      }
      return e
    }))
  }

  // Additional Amount Handlers
  const handleAddAdditionalAmt = (entryId: string, rateId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          rates: e.rates.map(r => r.id === rateId ? {
            ...r,
            additionalAmts: [...r.additionalAmts, { id: generateId(), amount: 0, ageQualifyingCode: '10' }]
          } : r)
        }
      }
      return e
    }))
  }

  const handleRemoveAdditionalAmt = (entryId: string, rateId: string, amtId: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          rates: e.rates.map(r => r.id === rateId && r.additionalAmts.length > 1 ? { ...r, additionalAmts: r.additionalAmts.filter(a => a.id !== amtId) } : r)
        }
      }
      return e
    }))
  }

  const handleUpdateAdditionalAmt = (entryId: string, rateId: string, amtId: string, field: keyof ARIAdditionalGuestAmt, value: any) => {
    setEntries(prev => prev.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          rates: e.rates.map(r => r.id === rateId ? {
            ...r,
            additionalAmts: r.additionalAmts.map(a => a.id === amtId ? { ...a, [field]: value } : a)
          } : r)
        }
      }
      return e
    }))
  }

  const handleSubmit = async () => {
    // Validation
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      if (!entry.roomTypeId || !entry.ratePlanCode || !entry.startDate || !entry.endDate) {
        Swal.fire('Validation Error', `Entry #${i + 1} is missing required fields (Room Type, Rate Plan, Start Date, or End Date).`, 'error')
        return
      }

      if (new Date(entry.startDate) > new Date(entry.endDate)) {
        Swal.fire('Validation Error', `Entry #${i + 1} has a start date after the end date.`, 'error')
        return
      }

      if (entry.rates.length === 0) {
        Swal.fire('Validation Error', `Entry #${i + 1} must have at least one rate configuration.`, 'error')
        return
      }

      const roomType = roomTypes.find(rt => rt.id === entry.roomTypeId)
      if (roomType) {
        for (let j = 0; j < entry.rates.length; j++) {
          const rateItem = entry.rates[j]
          
          if (rateItem.baseAmts.length === 0) {
            Swal.fire('Validation Error', `Entry #${i + 1}, Rate List #${j + 1}: Base Guest Amounts cannot be empty.`, 'error')
            return
          }

          if (rateItem.additionalAmts.length === 0) {
            Swal.fire('Validation Error', `Entry #${i + 1}, Rate List #${j + 1}: Additional Guest Amounts cannot be empty.`, 'error')
            return
          }

          for (const baseAmt of rateItem.baseAmts) {
            if (baseAmt.numberOfGuests > roomType.maxGuests || baseAmt.numberOfGuests < 1) {
              Swal.fire('Validation Error', `Entry #${i + 1}: Invalid number of guests. Must be between 1 and ${roomType.maxGuests} for room type ${roomType.name}.`, 'error')
              return
            }
            if (baseAmt.amountAfterTax === undefined || baseAmt.amountAfterTax === null || baseAmt.amountAfterTax < 0 || baseAmt.amountAfterTax === '') {
              Swal.fire('Validation Error', `Entry #${i + 1}: Base Guest Amount must have a valid price.`, 'error')
              return
            }
          }

          for (const addAmt of rateItem.additionalAmts) {
            if (addAmt.amount === undefined || addAmt.amount === null || addAmt.amount < 0 || addAmt.amount === '') {
              Swal.fire('Validation Error', `Entry #${i + 1}: Additional Guest Amount must have a valid price.`, 'error')
              return
            }
          }
        }
      }
    }

    try {
      if (!requestId) {
        Swal.fire('Error', 'Request ID is missing. Please close and reopen the window to try again.', 'error')
        return
      }
      
      // 2. Build Payload
      const rateAmountMessage: ARIRateAmountMessage[] = entries.map(entry => {
        const roomTypeForPayload = roomTypes.find(rt => rt.id === entry.roomTypeId)
        return {
          statusApplicationControl: {
            start: entry.startDate,
            end: entry.endDate,
            invTypeCode: roomTypeForPayload?.code || '',
            ratePlanCode: entry.ratePlanCode
          },
          rates: entry.rates.map(rateItem => ({
            baseByGuestAmts: rateItem.baseAmts.map(({ id, ...rest }) => ({
              ...rest,
              amountAfterTax: Number(rest.amountAfterTax),
              numberOfGuests: Number(rest.numberOfGuests)
            })),
            additionalGuestAmts: rateItem.additionalAmts.map(({ id, ...rest }) => ({
              ...rest,
              amount: Number(rest.amount)
            }))
          }))
        }
      })

      const payload = {
        rateAmountMessages: {
          requestId: requestId,
          timeStamp: new Date().toISOString(),
          notifType: 'Delta',
          hotelCode: '57928',
          partnerId: 'TGR',
          rateAmountMessage
        }
      }

      // 3. Submit
      await dispatch(submitARIUpdateRates(payload)).unwrap()
      
      Swal.fire('Success', 'Rates have been successfully sent to the OTA.', 'success')
      onClose()

    } catch (err: any) {
      Swal.fire('Error', err?.message || 'Failed to submit rates to OTA.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">OTA Pricing Updates</h2>
            <p className="text-sm text-slate-500 mt-1">Build and send rate updates to connected OTAs via RateTiger.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          <div className="space-y-6">
            {entries.map((entry, entryIndex) => (
              <div key={entry.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-700">Rate Config #{entryIndex + 1}</h3>
                  <button
                    onClick={() => handleRemoveEntry(entry.id)}
                    disabled={entries.length === 1}
                    className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-30 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Config
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Top Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Type</label>
                      <select
                        value={entry.roomTypeId}
                        onChange={(e) => handleUpdateEntry(entry.id, 'roomTypeId', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4]"
                      >
                        <option value="">Select Room Type</option>
                        {roomTypes.map(rt => (
                          <option key={rt.id} value={rt.id}>{rt.name} (Max {rt.maxGuests})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rate Plan</label>
                      <select
                        value={entry.ratePlanCode}
                        onChange={(e) => handleUpdateEntry(entry.id, 'ratePlanCode', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4]"
                      >
                        <option value="">Select Rate Plan</option>
                        {ratePlans.map(rp => (
                          <option key={rp.id} value={rp.code}>{rp.name} ({rp.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={entry.startDate}
                        onChange={(e) => handleUpdateEntry(entry.id, 'startDate', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={entry.endDate}
                        onChange={(e) => handleUpdateEntry(entry.id, 'endDate', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm outline-none focus:border-[#004bb4] focus:ring-1 focus:ring-[#004bb4]"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Rates Lists */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-lg">Rates Configurations</h3>
                      <button onClick={() => handleAddRateItem(entry.id)} className="text-[#004bb4] hover:text-blue-800 text-sm font-semibold flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Add Rate List
                      </button>
                    </div>

                    {entry.rates.map((rateItem, index) => (
                      <div key={rateItem.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                        <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-white">
                          <h4 className="font-semibold text-slate-700 text-sm">Rate List #{index + 1}</h4>
                          <button onClick={() => handleRemoveRateItem(entry.id, rateItem.id)} disabled={entry.rates.length === 1} className="text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="p-5 space-y-6">
                          {/* Base Amounts */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-slate-700 text-[13px] uppercase tracking-wider">Base Guest Amounts</h5>
                              <button onClick={() => handleAddBaseAmt(entry.id, rateItem.id)} className="text-[#004bb4] hover:text-blue-800 text-xs font-semibold flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Row
                              </button>
                            </div>
                            <div className="space-y-2">
                              {rateItem.baseAmts.map((amt) => (
                                <div key={amt.id} className="flex gap-3 items-start">
                                  <div className="flex-1 grid grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">GUESTS</label>
                                      <input type="number" min="1" value={amt.numberOfGuests} onChange={(e) => handleUpdateBaseAmt(entry.id, rateItem.id, amt.id, 'numberOfGuests', e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:border-[#004bb4] outline-none transition-colors" />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">AMOUNT</label>
                                      <input type="number" min="0" step="0.01" value={amt.amountAfterTax} onChange={(e) => handleUpdateBaseAmt(entry.id, rateItem.id, amt.id, 'amountAfterTax', e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:border-[#004bb4] outline-none transition-colors" />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">CURRENCY</label>
                                      <select value={amt.currencyCode} onChange={(e) => handleUpdateBaseAmt(entry.id, rateItem.id, amt.id, 'currencyCode', e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm bg-white cursor-pointer focus:border-[#004bb4] outline-none transition-colors">
                                        {CURRENCIES.map(curr => (
                                          <option key={curr} value={curr}>{curr}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">TYPE</label>
                                      <select value={amt.ageQualifyingCode} onChange={(e) => handleUpdateBaseAmt(entry.id, rateItem.id, amt.id, 'ageQualifyingCode', e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm bg-white cursor-pointer focus:border-[#004bb4] outline-none transition-colors">
                                        <option value="10">Adult</option>
                                        <option value="8">Child</option>
                                      </select>
                                    </div>
                                  </div>
                                  <button onClick={() => handleRemoveBaseAmt(entry.id, rateItem.id, amt.id)} disabled={rateItem.baseAmts.length === 1} className="mt-2.5 p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors bg-white border border-slate-200 rounded-md">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="h-px bg-slate-200" />

                          {/* Additional Amounts */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-bold text-slate-700 text-[13px] uppercase tracking-wider">Additional Guest Amounts</h5>
                              <button onClick={() => handleAddAdditionalAmt(entry.id, rateItem.id)} className="text-[#004bb4] hover:text-blue-800 text-xs font-semibold flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add Row
                              </button>
                            </div>
                            <div className="space-y-2">
                              {rateItem.additionalAmts.map((amt) => (
                                <div key={amt.id} className="flex gap-3 items-start">
                                  <div className="flex-1 grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">AMOUNT</label>
                                      <input type="number" min="0" step="0.01" value={amt.amount} onChange={(e) => handleUpdateAdditionalAmt(entry.id, rateItem.id, amt.id, 'amount', e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:border-[#004bb4] outline-none transition-colors" />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-500 mb-1">TYPE</label>
                                      <select value={amt.ageQualifyingCode} onChange={(e) => handleUpdateAdditionalAmt(entry.id, rateItem.id, amt.id, 'ageQualifyingCode', e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm bg-white cursor-pointer focus:border-[#004bb4] outline-none transition-colors">
                                        <option value="10">Adult</option>
                                        <option value="8">Child</option>
                                      </select>
                                    </div>
                                  </div>
                                  <button onClick={() => handleRemoveAdditionalAmt(entry.id, rateItem.id, amt.id)} disabled={rateItem.additionalAmts.length === 1} className="mt-2.5 p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors bg-white border border-slate-200 rounded-md">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddEntry}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-semibold hover:border-[#004bb4] hover:text-[#004bb4] hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 bg-white"
          >
            <Plus className="w-5 h-5" />
            Add Another Rate Config
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
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
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#004bb4] hover:bg-blue-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[130px] justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to OTA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
