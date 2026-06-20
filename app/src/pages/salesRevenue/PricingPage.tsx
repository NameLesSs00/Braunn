import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Calendar, ChevronDown, Plus, Edit2, Users, Building, BarChart2, Eye, Trash2, MapPin } from 'lucide-react'
import { AddPerPersonPricingPopup } from './popups/pricing/AddPerPersonPricingPopup'
import { AddPerRoomPricingPopup } from './popups/pricing/AddPerRoomPricingPopup'
import { EditPerPersonPricingPopup } from './popups/pricing/EditPerPersonPricingPopup'
import { EditPerRoomPricingPopup } from './popups/pricing/EditPerRoomPricingPopup'
import { AddInclusionPricingPopup } from './popups/pricing/AddInclusionPricingPopup'
import { EditInclusionPricingPopup } from './popups/pricing/EditInclusionPricingPopup'
import { InclusionDetailsPopup } from './popups/pricing/InclusionDetailsPopup'
import { BulkEditPricingPopup } from './popups/pricing/BulkEditPricingPopup'
import { AddLocalPricingPopup } from './popups/pricing/AddLocalPricingPopup'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPerPersonPricing, removePerPersonPricing, setSelectedPricing } from '../../features/perPersonPricing/perPersonPricingSlice'
import { fetchLocalARIRates } from '../../features/localAri/localAriSlice'
import { fetchRoomTypes } from '../../features/roomTypes/roomTypesSlice'
import { fetchMealPlans } from '../../features/admin/mealPlansSlice'
import Swal from 'sweetalert2'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 } 
  },
}

function formatDateDisplay(dateString?: string) {
  if (!dateString) return '-'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return '-'
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function PricingPage() {
  const dispatch = useAppDispatch()
  
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [activeTab, setActiveTab] = useState('per-person')
  const [roomFilter, setRoomFilter] = useState('All Room Type')
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false)
  const [selectedInclusion, setSelectedInclusion] = useState<any>(null)
  const [isBulkEditPopupOpen, setIsBulkEditPopupOpen] = useState(false)

  // Local Pricing tab state
  const [localStartDate, setLocalStartDate] = useState(today)
  const [localEndDate, setLocalEndDate] = useState(nextWeek)
  const [localRoomTypeId, setLocalRoomTypeId] = useState('')
  const [localRatePlanCode, setLocalRatePlanCode] = useState('')

  const perPersonItems = useAppSelector(state => state.perPersonPricing.items)
  const roomTypesItems = useAppSelector(state => state.roomTypes.items)
  const mealPlans = useAppSelector(state => state.mealPlans.items)
  const localAriRates = useAppSelector(state => state.localAri.rates)
  const localAriStatus = useAppSelector(state => state.localAri.status)

  useEffect(() => {
    dispatch(fetchPerPersonPricing())
    dispatch(fetchRoomTypes())
    dispatch(fetchMealPlans())
  }, [dispatch])

  // Fetch local ARI rates when Local Pricing tab is active and a room type is selected
  useEffect(() => {
    if (activeTab === 'local-pricing' && localRoomTypeId && localRatePlanCode) {
      dispatch(fetchLocalARIRates({
        roomTypeId: localRoomTypeId,
        ratePlanCode: localRatePlanCode,
        startDate: localStartDate,
        endDate: localEndDate,
        roomCount: 1,
        adults: 2,
        children: 0,
        extraBeds: 0,
      }))
    }
  }, [dispatch, activeTab, localRoomTypeId, localRatePlanCode, localStartDate, localEndDate])

  const dynamicPerPersonData = useMemo(() => {
    return perPersonItems.map(item => {
      const roomType = roomTypesItems.find(rt => rt.id === item.roomTypeId)
      return {
        id: item.id,
        room: roomType ? roomType.name : 'Unknown Room',
        adultPrice: item.adultPrice,
        childPrice: item.childPrice,
        guests: item.maxOccupancy,
        extraBed: `$${item.extraBedPrice}`,
        from: formatDateDisplay(item.validFrom),
        to: formatDateDisplay(item.validTo),
        originalItem: item
      }
    })
  }, [perPersonItems, roomTypesItems])



  const dynamicPerRoomData = useMemo(() => {
    return roomTypesItems.map(item => {
      const base = item.basePrice
      const corp = Math.round(base * 1.2)
      return {
        id: item.id,
        room: item.name,
        base: String(base),
        corp: String(corp),
        adj: '+10',
        extraBed: '$30',
        final: String(base + 10),
        originalItem: item
      }
    })
  }, [roomTypesItems])

  const dynamicInclusionsData = useMemo(() => {
    return mealPlans.map((plan, idx) => {
      const roomType = roomTypesItems[idx % roomTypesItems.length]
      const roomName = roomType ? roomType.name : 'All Room Type'
      return {
        id: plan.id,
        room: roomName,
        inclusion: `${plan.name} (${plan.code})`,
        adultSupplement: String(plan.pricePerDay),
        childSupplement: String(Math.round(plan.pricePerDay * 0.5)),
        status: plan.isActive ? 'Active' : 'Inactive',
        originalItem: plan
      }
    })
  }, [mealPlans, roomTypesItems])

  const filteredPerPerson = dynamicPerPersonData.filter(item => roomFilter === 'All Room Type' || item.room === roomFilter)
  const filteredPerRoom = dynamicPerRoomData.filter(item => roomFilter === 'All Room Type' || item.room === roomFilter)
  const filteredInclusions = dynamicInclusionsData.filter(item => roomFilter === 'All Room Type' || item.room === roomFilter)

  function handleDeletePerPersonPricing(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removePerPersonPricing(id))
      }
    })
  }



  return (
    <motion.div 
      className="space-y-6 pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <TabNav />
      </motion.div>
      
      <motion.div variants={itemVariants} className="pt-2">
        <h1 className="text-[22px] font-semibold text-slate-800 tracking-tight">Pricing Management</h1>
        <p className="text-slate-500 mt-1.5 text-[15px]">Configure and manage room pricing strategies for the Sales & Revenue team</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between items-center pt-2">
        <div className="flex gap-3">
          {/* Filters */}
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-10 px-4 pr-10 outline-none hover:border-slate-300 transition-colors min-w-[130px] cursor-pointer">
              <option>This Month</option>
            </select>
            <Calendar className="w-[18px] h-[18px] text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
          </div>
          <div className="relative">
            <select 
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-10 px-4 pr-10 outline-none hover:border-slate-300 transition-colors min-w-[150px] cursor-pointer"
            >
              <option>All Room Type</option>
              <option>Single Room</option>
              <option>Double Room</option>
              <option>Twin Room</option>
              <option>Triple Room</option>
              <option>Suite</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-10 px-4 pr-10 outline-none hover:border-slate-300 transition-colors min-w-[150px] cursor-pointer">
              <option>All Guest Type</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-10 px-4 pr-10 outline-none hover:border-slate-300 transition-colors min-w-[140px] cursor-pointer">
              <option>All seasons</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddPopupOpen(true)}
            className="flex items-center gap-2 h-10 px-5 bg-white border border-[#004bb4] text-[#004bb4] rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
            Add Pricing
          </button>
          <button 
            onClick={() => setIsBulkEditPopupOpen(true)}
            className="flex items-center gap-2 h-10 px-5 bg-[#004bb4] text-white rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4" strokeWidth={2} />
            Bulk Edit Prices
          </button>
        </div>
      </motion.div>

      {/* Tabs Layout */}
      <motion.div variants={itemVariants} className="border-b border-slate-200 mt-8">
        <ul className="flex items-center gap-2 px-2">
          <li>
            <button 
              onClick={() => setActiveTab('per-person')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-[15px] transition-colors ${activeTab === 'per-person' ? 'border-[#004bb4] text-[#004bb4] bg-[#fbfcfd]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Users className="w-5 h-5 pointer-events-none" />
              Per Person Pricing
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('per-room')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-[15px] transition-colors ${activeTab === 'per-room' ? 'border-[#004bb4] text-[#004bb4] bg-[#fbfcfd]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Building className="w-5 h-5 pointer-events-none" />
              Per Room Pricing
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveTab('inclusions')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-[15px] transition-colors ${activeTab === 'inclusions' ? 'border-[#004bb4] text-[#004bb4] bg-[#fbfcfd]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Plus className="w-5 h-5 pointer-events-none text-[#004bb4]" />
              Inclusions Pricing
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('local-pricing')}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-[15px] transition-colors ${activeTab === 'local-pricing' ? 'border-[#004bb4] text-[#004bb4] bg-[#fbfcfd]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <MapPin className="w-5 h-5 pointer-events-none" />
              Local Pricing
            </button>
          </li>
        </ul>
      </motion.div>

      {/* Main Content container */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row gap-6 items-start pt-2">
        {/* Table Area */}
        <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)]">
          {activeTab === 'per-person' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Room Type</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Adult Price</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Child Price</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap text-center">Max Occupancy</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Extra Bed</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Valid From / To</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPerPerson.length > 0 ? filteredPerPerson.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                      <td className="px-5 py-5 font-bold text-slate-800 text-[15px] whitespace-nowrap">{item.room}</td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <span className="font-bold text-[#004bb4] text-[15px]">${item.adultPrice}</span>
                        <span className="text-slate-400 font-medium text-sm">/adult</span>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <span className="font-bold text-[#10b981] text-[15px]">${item.childPrice}</span>
                        <span className="text-slate-400 font-medium text-sm">/child</span>
                      </td>
                      <td className="px-5 py-5 text-center whitespace-nowrap">
                        <span className="px-3.5 py-[5px] text-xs font-bold text-[#8b5cf6] bg-[#f3e8ff] rounded-full">
                          {item.guests} guests
                        </span>
                      </td>
                      <td className="px-5 py-5 font-semibold text-slate-700 whitespace-nowrap">{item.extraBed}</td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <div className="text-[13px] font-semibold text-slate-500">{item.from}</div>
                        <div className="text-[12px] text-slate-400 my-0.5">to</div>
                        <div className="text-[13px] font-semibold text-slate-500">{item.to}</div>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              dispatch(setSelectedPricing(item.originalItem))
                              setIsEditPopupOpen(true)
                            }}
                            className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 focus:outline-none"
                            title="Edit Pricing"
                          >
                            <Edit2 className="w-[18px] h-[18px]" strokeWidth={2} />
                          </button>
                          <button 
                            onClick={() => handleDeletePerPersonPricing(item.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1.5 focus:outline-none"
                            title="Delete Pricing"
                          >
                            <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-medium">No Pricing configurations match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'per-room' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Room Type</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Base Room Price</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Corporate Price</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap text-center">Seasonal Adj.</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Extra Bed</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Final Price</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase text-center">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPerRoom.length > 0 ? filteredPerRoom.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                      <td className="px-5 py-5 font-bold text-slate-800 text-[15px] whitespace-nowrap">{item.room}</td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-[15px]">${item.base}</span>
                        <span className="text-slate-400 font-medium text-sm">/night</span>
                      </td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <span className="font-bold text-[#ea580c] text-[15px]">${item.corp}</span>
                        <span className="text-slate-400 font-medium text-sm">/night</span>
                      </td>
                      <td className="px-5 py-5 text-center whitespace-nowrap">
                        <span className="px-3.5 py-[5px] text-xs font-bold text-[#10b981] bg-[#d1fae5] rounded-full">
                          {item.adj}
                        </span>
                      </td>
                      <td className="px-5 py-5 font-semibold text-slate-700 whitespace-nowrap">{item.extraBed}</td>
                      <td className="px-5 py-5 whitespace-nowrap">
                        <span className="font-bold text-[#004bb4] text-[15px]">${item.final}</span>
                        <span className="text-slate-400 font-medium text-sm">/night</span>
                      </td>
                      <td className="px-5 py-5 text-center">
                        <button 
                          onClick={() => setIsEditPopupOpen(true)}
                          className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 focus:outline-none"
                        >
                          <Edit2 className="w-[18px] h-[18px] mx-auto" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-medium">No Pricing configurations match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}



          {activeTab === 'inclusions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Inclusion Name</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Room Type</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap text-center">Adult Supplement</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap text-center">Child Supplement</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase text-center">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInclusions.length > 0 ? filteredInclusions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                      <td className="px-5 py-6">
                        <div className="font-bold text-[#004bb4] text-[14px]">
                          {item.inclusion}
                        </div>
                      </td>
                      <td className="px-5 py-6 font-medium text-slate-600 text-[14px] whitespace-nowrap">{item.room}</td>
                      <td className="px-5 py-6 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-[15px]">${item.adultSupplement}</span>
                        <span className="text-slate-400 font-medium text-sm">/pp</span>
                      </td>
                      <td className="px-5 py-6 text-center whitespace-nowrap">
                        <span className="font-bold text-[#10b981] text-[15px]">${item.childSupplement}</span>
                        <span className="text-slate-400 font-medium text-sm">/pp</span>
                      </td>
                      <td className="px-5 py-6 text-center whitespace-nowrap">
                        <span className="px-3 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-full border border-emerald-100">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-6 text-center">
                        <button 
                          onClick={() => {
                            setSelectedInclusion(item)
                            setIsDetailsPopupOpen(true)
                          }}
                          className="text-slate-400 hover:text-[#004bb4] transition-colors p-1.5 focus:outline-none"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 mx-auto" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500 font-medium">No Inclusions configurations match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'local-pricing' && (
            <div>
              {/* Local Pricing Filters */}
              <div className="flex flex-wrap items-end gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Room Type</label>
                  <div className="relative">
                    <select
                      value={localRoomTypeId}
                      onChange={(e) => setLocalRoomTypeId(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-9 px-3 pr-9 outline-none hover:border-slate-300 focus:border-[#004bb4] transition-colors min-w-[160px] cursor-pointer"
                    >
                      <option value="">— Select Room Type —</option>
                      {roomTypesItems.map((rt) => (
                        <option key={rt.id} value={rt.id}>{rt.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Rate Plan Code</label>
                  <input
                    type="text"
                    value={localRatePlanCode}
                    onChange={(e) => setLocalRatePlanCode(e.target.value.toUpperCase())}
                    placeholder="Rate Plan Code"
                    className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-9 px-3 outline-none hover:border-slate-300 focus:border-[#004bb4] transition-colors w-[110px] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">From</label>
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-9 px-3 outline-none hover:border-slate-300 focus:border-[#004bb4] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">To</label>
                  <input
                    type="date"
                    value={localEndDate}
                    min={localStartDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg h-9 px-3 outline-none hover:border-slate-300 focus:border-[#004bb4] transition-colors"
                  />
                </div>
              </div>

              {/* Local Pricing Table */}
              {!localRoomTypeId ? (
                <div className="p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <MapPin className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Select a Room Type and Rate Plan Code to view configured rates.</p>
                </div>
              ) : localAriStatus === 'loading' ? (
                <div className="p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                  <svg className="animate-spin h-8 w-8 text-[#004bb4] mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-sm text-slate-400">Loading rates...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Date</th>
                        <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Guests</th>
                        <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Base Rate</th>
                        <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Before Tax</th>
                        <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">After Tax</th>
                        <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Seasonal Adj.</th>
                        <th className="px-5 py-4 font-bold text-slate-500 text-xs tracking-wider uppercase whitespace-nowrap">Modified By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {localAriRates.length > 0 ? localAriRates.map((rate, idx) => {
                        const isUnconfigured = !rate.modifiedBy && rate.originalBaseRate === 0 && rate.amountBeforeTax === 0 && rate.amountAfterTax === 0
                        return (
                          <tr key={idx} className={`transition-colors ${isUnconfigured ? 'bg-amber-50/50 hover:bg-amber-50' : 'bg-white hover:bg-slate-50/50'}`}>
                            <td className="px-5 py-4 font-semibold text-slate-700 text-sm whitespace-nowrap">
                              {rate.date ? new Date(rate.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            {isUnconfigured ? (
                              <td colSpan={6} className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                    Not Configured
                                  </span>
                                  <span className="text-xs text-slate-400">No pricing set for this date with the selected Room Type &amp; Rate Plan Code.</span>
                                </div>
                              </td>
                            ) : (
                              <>
                                <td className="px-5 py-4 text-slate-600 text-sm">{rate.numberOfGuests ?? '-'}</td>
                                <td className="px-5 py-4 font-bold text-slate-800 text-sm">${rate.originalBaseRate?.toLocaleString() ?? '-'}</td>
                                <td className="px-5 py-4 font-semibold text-[#004bb4] text-sm">${rate.amountBeforeTax?.toLocaleString() ?? '-'}</td>
                                <td className="px-5 py-4 font-semibold text-emerald-600 text-sm">${rate.amountAfterTax?.toLocaleString() ?? '-'}</td>
                                <td className="px-5 py-4 text-sm text-slate-500">
                                  {rate.seasonalAdjustmentAmount !== 0
                                    ? <span className="text-amber-600 font-medium">{rate.seasonalAdjustmentAmount > 0 ? '+' : ''}{rate.seasonalAdjustmentAmount}</span>
                                    : <span className="text-slate-300">—</span>}
                                </td>
                                <td className="px-5 py-4 text-xs text-slate-400">
                                  <div className="font-medium text-slate-500">{rate.modifiedBy ?? '-'}</div>
                                  <div>{rate.modifiedAt ? new Date(rate.modifiedAt).toLocaleDateString() : ''}</div>
                                </td>
                              </>
                            )}
                          </tr>
                        )
                      }) : (
                        <tr>
                          <td colSpan={7} className="px-5 py-14 text-center">
                            <MapPin className="w-9 h-9 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">No rates found for the selected filters.</p>
                            <p className="text-slate-400 text-xs mt-1">Try a different date range or rate plan code, or click "Add Pricing" to create one.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pricing Logic Details (Fixed width Right Panel) decreased width */}
        <div className="w-full xl:w-[270px] shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="w-6 h-6 text-[#1e293b]" />
              <h2 className="text-lg font-bold text-slate-800">Pricing Logic</h2>
            </div>
            <p className="text-slate-500 mb-5 text-[13px] leading-relaxed font-medium">
              Final price is calculated based on:
            </p>

            <div className="space-y-3">
              {/* Blue Pill Card */}
              <div className="p-3 bg-[#f0f7ff] border border-[#dbeafe] rounded-xl text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#004bb4]"></div>
                  <span className="font-bold text-[#1e293b] text-[14px]">Room Type</span>
                </div>
                <p className="text-slate-500 text-[13px] pl-4 leading-relaxed">Single, Double, Twin, Triple, Suite</p>
              </div>

              {/* Green Pill Card */}
              <div className="p-3 bg-[#f0fdf4] border border-[#dcfce7] rounded-xl text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
                  <span className="font-bold text-[#1e293b] text-[14px]">Guest Type</span>
                </div>
                <p className="text-slate-500 text-[13px] pl-4 leading-relaxed">Adult / Child pricing variations</p>
              </div>

              {/* Purple Pill Card */}
              <div className="p-3 bg-[#faf5ff] border border-[#f3e8ff] rounded-xl text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9333ea]"></div>
                  <span className="font-bold text-[#1e293b] text-[14px]">Occupancy</span>
                </div>
                <p className="text-slate-500 text-[13px] pl-4 leading-relaxed">Number of guests + extra beds</p>
              </div>

              {/* Orange Pill Card */}
              <div className="p-3 bg-[#fff7ed] border border-[#ffedd5] rounded-xl text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></div>
                  <span className="font-bold text-[#1e293b] text-[14px]">Season</span>
                </div>
                <p className="text-slate-500 text-[13px] pl-4 leading-relaxed">Peak, High, Low season rates</p>
              </div>

              {/* Inclusion Pill Card */}
              <div className="p-3 bg-[#fff1f2] border border-[#ffe4e6] rounded-xl text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e11d48]"></div>
                  <span className="font-bold text-[#1e293b] text-[14px]">Inclusions</span>
                </div>
                <p className="text-slate-500 text-[13px] pl-4 leading-relaxed">BB, HB, FB, AI, Ultra All-Inc</p>
              </div>
            </div>
          </div>

          {/* Example Preview Notice */}
          <div className="bg-[#fbfcfd] border border-slate-200 border-dashed rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-[13px]">Example Preview:</h3>
            <div className="space-y-3.5 text-[13px]">
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Double Room</span>
                <span className="font-bold text-slate-800">$180</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Adult:</span>
                <span className="font-bold text-[#004bb4]">$120</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-medium border-b border-slate-200 pb-3">
                <span>Child:</span>
                <span className="font-bold text-[#10b981]">$70</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="font-bold text-slate-700">Room Price:</span>
                <span className="font-bold text-[#004bb4] text-[15px]">$180</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {isAddPopupOpen && activeTab === 'per-person' && (
        <AddPerPersonPricingPopup onClose={() => setIsAddPopupOpen(false)} />
      )}
      
      {isAddPopupOpen && activeTab === 'per-room' && (
        <AddPerRoomPricingPopup onClose={() => setIsAddPopupOpen(false)} />
      )}



      {isAddPopupOpen && activeTab === 'inclusions' && (
        <AddInclusionPricingPopup onClose={() => setIsAddPopupOpen(false)} />
      )}

      {isEditPopupOpen && activeTab === 'per-person' && (
        <EditPerPersonPricingPopup onClose={() => setIsEditPopupOpen(false)} />
      )}

      {isEditPopupOpen && activeTab === 'per-room' && (
        <EditPerRoomPricingPopup onClose={() => setIsEditPopupOpen(false)} />
      )}



      {isEditPopupOpen && activeTab === 'inclusions' && (
        <EditInclusionPricingPopup onClose={() => setIsEditPopupOpen(false)} />
      )}

      {isDetailsPopupOpen && (
        <InclusionDetailsPopup 
          onClose={() => setIsDetailsPopupOpen(false)} 
          data={selectedInclusion}
        />
      )}

      {isBulkEditPopupOpen && (
        <BulkEditPricingPopup onClose={() => setIsBulkEditPopupOpen(false)} />
      )}

      {isAddPopupOpen && activeTab === 'local-pricing' && (
        <AddLocalPricingPopup
          onClose={() => setIsAddPopupOpen(false)}
          startDate={localStartDate}
          endDate={localEndDate}
          roomTypeId={localRoomTypeId}
        />
      )}
    </motion.div>
  )
}
