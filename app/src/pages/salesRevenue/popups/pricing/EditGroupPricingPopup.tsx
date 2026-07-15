import { useState, useEffect } from 'react'
import { X, Calendar, User, DollarSign, Percent, Trash2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { fetchRoomTypes } from '../../../../features/roomTypes/roomTypesSlice'
import { editGroupPricingRule, removeGroupPricingRule } from '../../../../features/groupPricing/groupPricingSlice'
import { ConfirmActionModal } from '../../../../shared/ui/ConfirmActionModal'

interface EditGroupPricingPopupProps {
  onClose: () => void
}

export function EditGroupPricingPopup({ onClose }: EditGroupPricingPopupProps) {
  const dispatch = useAppDispatch()
  
  const roomTypes = useAppSelector((state) => state.roomTypes.items)
  const selectedPricing = useAppSelector((state) => state.groupPricing.selected)
  
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const [roomTypeId, setRoomTypeId] = useState(selectedPricing?.roomTypeId || '')
  const [groupName, setGroupName] = useState(selectedPricing?.groupName || '')
  const [contactPerson, setContactPerson] = useState((selectedPricing as any)?.contactPerson || 'Group Leader')
  const [arrivalDate, setArrivalDate] = useState(formatDateForInput(selectedPricing?.validFrom) || '2025-01-12')
  const [departureDate, setDepartureDate] = useState(formatDateForInput(selectedPricing?.validTo) || '2025-01-30')
  const [cutOffDate, setCutOffDate] = useState(formatDateForInput((selectedPricing as any)?.cutOffDate) || '2025-01-10')
  const [roomBlockQuantity, setRoomBlockQuantity] = useState(selectedPricing?.minNumberOfRooms || 10)
  const [discountPercentage, setDiscountPercentage] = useState(selectedPricing?.discountPercentage || 15)
  const [specialRatePerNight, setSpecialRatePerNight] = useState((selectedPricing as any)?.specialRatePerNight || 0)
  const [depositRequired, setDepositRequired] = useState((selectedPricing as any)?.depositRequired || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isManualRate, setIsManualRate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchRoomTypes())
  }, [dispatch])

  useEffect(() => {
    if (selectedPricing) {
      setRoomTypeId(selectedPricing.roomTypeId)
      setGroupName(selectedPricing.groupName)
      setContactPerson((selectedPricing as any).contactPerson || 'Group Leader')
      setArrivalDate(formatDateForInput(selectedPricing.validFrom) || '2025-01-12')
      setDepartureDate(formatDateForInput(selectedPricing.validTo) || '2025-01-30')
      setCutOffDate(formatDateForInput((selectedPricing as any).cutOffDate) || '2025-01-10')
      setRoomBlockQuantity(selectedPricing.minNumberOfRooms || 10)
      setDiscountPercentage(selectedPricing.discountPercentage || 15)
      setSpecialRatePerNight((selectedPricing as any).specialRatePerNight || 0)
      setDepositRequired((selectedPricing as any).depositRequired || 0)
    }
  }, [selectedPricing])

  useEffect(() => {
    if (roomTypes.length > 0 && !roomTypeId) {
      setRoomTypeId(selectedPricing?.roomTypeId || roomTypes[0].id)
    }
  }, [roomTypes, roomTypeId, selectedPricing])

  const selectedRoomType = roomTypes.find((rt) => rt.id === roomTypeId)
  const basePrice = selectedRoomType ? selectedRoomType.basePrice : 90

  // Calculate automatic special rate when basePrice or discount changes
  useEffect(() => {
    if (!isManualRate) {
      const calculatedRate = Math.round(basePrice * (1 - discountPercentage / 100))
      setSpecialRatePerNight(calculatedRate)
    }
  }, [basePrice, discountPercentage, isManualRate])

  const finalRate = specialRatePerNight
  const total = finalRate * roomBlockQuantity

  const handleSubmit = async () => {
    setError(null)
    if (!selectedPricing || !roomTypeId) { setError('Please select a Room Type.'); return }
    if (!groupName.trim()) { setError('Group Name is required.'); return }
    if (!contactPerson.trim()) { setError('Contact Person is required.'); return }
    if (!arrivalDate || !departureDate) { setError('Please enter both Arrival and Departure dates.'); return }
    if (new Date(departureDate) <= new Date(arrivalDate)) { setError('Departure Date must be after Arrival Date.'); return }
    if (roomBlockQuantity <= 0) { setError('Number of Rooms must be greater than 0.'); return }
    if (discountPercentage < 0 || discountPercentage > 100) { setError('Discount must be between 0 and 100%.'); return }
    setIsLoading(true)
    try {
      const payload = {
        roomTypeId,
        groupName,
        minNumberOfRooms: Number(roomBlockQuantity),
        discountPercentage: Number(discountPercentage),
        validFrom: new Date(arrivalDate).toISOString(),
        validTo: new Date(departureDate).toISOString(),
        isActive: selectedPricing.isActive !== undefined ? selectedPricing.isActive : true,
        // Include all screenshot fields for full compatibility:
        contactPerson,
        arrivalDate: new Date(arrivalDate).toISOString(),
        departureDate: new Date(departureDate).toISOString(),
        roomBlockQuantity: Number(roomBlockQuantity),
        specialRatePerNight: Number(specialRatePerNight),
        cutOffDate: new Date(cutOffDate).toISOString(),
        depositRequired: Number(depositRequired),
        status: (selectedPricing as any).status || 'Pending'
      }
      await dispatch(editGroupPricingRule({ id: selectedPricing.id, payload })).unwrap()
      onClose()
    } catch (error) {
      console.error('Failed to edit group pricing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPricing) return
    setIsLoading(true)
    setDeleteError(null)
    try {
      await dispatch(removeGroupPricingRule(selectedPricing.id)).unwrap()
      onClose()
    } catch (error) {
      console.error('Failed to delete group pricing rule:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete pricing configuration.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedPricing) {
    return null
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#004bb4] shrink-0">
          <h2 className="text-xl font-bold text-white tracking-wide">Edit Group Pricing</h2>
          <button 
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {/* Row 1: Room Type & Group Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Room Type</label>
              <div className="relative">
                <select 
                  value={roomTypeId}
                  onChange={(e) => setRoomTypeId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium appearance-none bg-white pr-10 cursor-pointer"
                >
                  {roomTypes.length === 0 ? (
                    <option value="">No Room Types Found</option>
                  ) : (
                    roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} (${rt.basePrice}/night)
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

            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Group Name <span className="text-red-500 ml-0.5">*</span></label>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Annual Tech Conference"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal"
                required
              />
            </div>
          </div>

          {/* Row 2: Contact Person & Deposit Required */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Contact Person <span className="text-red-500 ml-0.5">*</span></label>
              <div className="relative flex items-center">
                <User className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="text" 
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Deposit Required</label>
              <div className="relative flex items-center">
                <DollarSign className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="number" 
                  value={depositRequired}
                  onChange={(e) => setDepositRequired(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Arrival Date & Departure Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Arrival Date</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="date" 
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Departure Date</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="date" 
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Cut-off Date</label>
              <div className="relative flex items-center">
                <Calendar className="w-[18px] h-[18px] text-slate-400 absolute left-3.5" />
                <input 
                  type="date" 
                  value={cutOffDate}
                  onChange={(e) => setCutOffDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg pl-[40px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Room Block Quantity, Discount %, Special Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Number of Rooms <span className="text-red-500 ml-0.5">*</span></label>
              <input 
                type="number" 
                value={roomBlockQuantity}
                onChange={(e) => setRoomBlockQuantity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Discount % <span className="text-red-500 ml-0.5">*</span></label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  value={discountPercentage}
                  onChange={(e) => {
                    setDiscountPercentage(Number(e.target.value))
                    setIsManualRate(false)
                  }}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-4" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-600 mb-2">Special Rate (per night)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-semibold">$</span>
                <input 
                  type="number" 
                  value={specialRatePerNight}
                  onChange={(e) => {
                    setSpecialRatePerNight(Number(e.target.value))
                    setIsManualRate(true)
                  }}
                  className="w-full border border-slate-200 rounded-lg pl-[34px] pr-4 py-2.5 outline-none focus:border-[#004bb4] transition-colors text-slate-700 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Price Preview */}
          <div className="bg-[#f0f7ff] border border-[#dbeafe] rounded-xl p-5 mt-2">
            <h3 className="text-[13px] font-bold text-slate-700 mb-3">Price Preview</h3>
            
            <div className="flex justify-between items-center text-[13px] font-medium text-slate-500 mb-2">
              <span>Base Price:</span>
              <span className="font-bold text-slate-800">${basePrice}</span>
            </div>
            
            <div className="flex justify-between items-center text-[13px] font-medium border-b border-[#aecdfa]/40 pb-3 mb-3">
              <span className="text-slate-500">After Discount ({discountPercentage}%):</span>
              <span className="font-bold text-[#004bb4]">${finalRate.toFixed(2)} / room</span>
            </div>
            
            <div className="flex justify-between items-center text-[14px]">
              <span className="font-bold text-slate-700">Total Price:</span>
              <span className="font-bold text-[#004bb4] text-[16px]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white flex justify-between items-center mt-1 shrink-0 border-t border-slate-100">
          <button 
            type="button"
            onClick={() => {
              setDeleteConfirmOpen(true)
              setDeleteError(null)
            }}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex gap-3">
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
              disabled={isLoading || !roomTypeId || !groupName}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#004bb4] hover:bg-blue-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    <ConfirmActionModal
      open={deleteConfirmOpen}
      title="Delete Pricing Configuration"
      description="This will permanently delete this group pricing configuration. This action cannot be undone."
      confirmLabel="Delete Pricing"
      variant="danger"
      isLoading={isLoading}
      error={deleteError}
      onCancel={() => {
        if (isLoading) return
        setDeleteConfirmOpen(false)
        setDeleteError(null)
      }}
      onConfirm={handleDelete}
    />
    </>
  )
}
