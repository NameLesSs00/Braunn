import { useState, useEffect } from 'react'
import { X, Users, Calendar } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { fetchRoomTypes } from '../../../../features/roomTypes/roomTypesSlice'
import { addPerPersonPricing } from '../../../../features/perPersonPricing/perPersonPricingSlice'
import { fetchPerPersonPricing } from '../../../../features/perPersonPricing/perPersonPricingSlice'
interface AddPerPersonPricingPopupProps {
  onClose: () => void
}

export function AddPerPersonPricingPopup({ onClose }: AddPerPersonPricingPopupProps) {
  const dispatch = useAppDispatch()
  
  const roomTypes = useAppSelector((state) => state.roomTypes.items)
  
  const [roomTypeId, setRoomTypeId] = useState('')
  const [adultPrice, setAdultPrice] = useState(100)
  const [childPrice, setChildPrice] = useState(50)
  const [maxOccupancy, setMaxOccupancy] = useState(1)
  const [extraBedPrice, setExtraBedPrice] = useState(30)
  const [validFrom, setValidFrom] = useState('2025-01-12')
  const [validTo, setValidTo] = useState('2025-01-30')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchRoomTypes())
  }, [dispatch])

  useEffect(() => {
    if (roomTypes.length > 0 && !roomTypeId) {
      setRoomTypeId(roomTypes[0].id)
    }
  }, [roomTypes, roomTypeId])

  const handleSubmit = async () => {
    setError(null)
    if (!roomTypeId) { setError('Please select a Room Type.'); return }
    if (!validFrom || !validTo) { setError('Please select both Valid From and Valid To dates.'); return }
    if (new Date(validTo) <= new Date(validFrom)) { setError('Valid To date must be after Valid From date.'); return }
    if (adultPrice <= 0) { setError('Adult Price must be greater than 0.'); return }
    setIsLoading(true)
    try {
      const payload = {
        roomTypeId,
        adultPrice,
        childPrice,
        maxOccupancy,
        extraBedPrice,
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
        isActive: true,
      }
      await dispatch(addPerPersonPricing(payload)).unwrap()
      // we fetch the data as the response only return the id 
      await dispatch(fetchPerPersonPricing()).unwrap()
      onClose()
    } catch (error) {
      console.error('Failed to add per-person pricing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#004bb4]">
          <h2 className="text-xl font-bold text-white tracking-wide">Add Per Person Pricing</h2>
          <button 
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {/* Room Type */}
          <div>
            <label className="block text-[13px] font-bold text-slate-600 mb-2">Room Type</label>
            <div className="relative">
              <select 
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white pr-10"
              >
                {roomTypes.length === 0 ? (
                  <option value="">No Room Types Found</option>
                ) : (
                  roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            {/* Adult Price */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Adult Price</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-semibold">$</span>
                <input 
                  type="number" 
                  value={adultPrice}
                  onChange={(e) => setAdultPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-[34px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Child Price */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Child Price</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-semibold">$</span>
                <input 
                  type="number" 
                  value={childPrice}
                  onChange={(e) => setChildPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-[34px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Max Occupancy */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Max Occupancy</label>
              <div className="relative flex items-center">
                <Users className="w-4 h-4 text-slate-400 absolute left-4" />
                <input 
                  type="number" 
                  value={maxOccupancy}
                  onChange={(e) => setMaxOccupancy(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-[38px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Extra Bed Price */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Extra Bed Price</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-semibold">$</span>
                <input 
                  type="number" 
                  value={extraBedPrice}
                  onChange={(e) => setExtraBedPrice(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-[34px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Valid From */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Valid From</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="date" 
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            {/* Valid To */}
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Valid To</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="date" 
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white flex justify-end gap-3 mt-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !roomTypeId}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#004bb4] hover:bg-blue-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </>
            ) : (
              'Add Pricing'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
